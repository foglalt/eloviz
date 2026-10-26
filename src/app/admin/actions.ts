"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  clearLoginFailures,
  createAdminSession,
  isAdminAuthenticated,
  isAdminAuthConfigured,
  isLoginRateLimited,
  recordFailedLogin,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { requireSql } from "@/lib/db";
import { deleteBlobPdf, storePdf } from "@/lib/document-storage";
import { prepareStudyPdf } from "@/lib/study-pdf-preparation";
import { studyMetadataQueries, studyPdfQueries, type PreparedStudyPdf, type StoredStudyPdf } from "@/lib/study-save-queries";
import { persistWithOptionalPdf } from "@/lib/study-save-workflow";
import type { StudySaveState } from "@/lib/study-save-state";
import { parseYouTubeId, slugifyHungarian, studyInputSchema, studySeriesInputSchema, topicInputSchema, videoInputSchema } from "@/lib/content-validation";
import { COMPACT_SERIES_POSITIONS, SERIES_EDIT_LOCK } from "@/lib/study-series-editing";
import { resolveStudyDocumentRemoval, resolveStudyPublicationStatus } from "@/lib/study-publication";
import { fetchYouTubeMetadata } from "@/lib/youtube-metadata";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function ids(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean);
}

function destination(path: string, kind: "message" | "error", value: string, edit?: string) {
  const params = new URLSearchParams({ [kind]: value });
  if (edit) params.set("edit", edit);
  return `${path}?${params}`;
}

function validationMessage(issues: { message: string }[]) {
  return issues.map((issue) => issue.message).join(" ");
}

function rethrowFrameworkRedirect(error: unknown) {
  if (error instanceof Error && (error.message === "NEXT_REDIRECT" || String((error as Error & { digest?: string }).digest).startsWith("NEXT_REDIRECT"))) throw error;
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin?error=A+munkamenet+lejárt.+Jelentkezz+be+újra.");
}

function refreshPublicContent() {
  for (const path of ["/", "/temak", "/tanulmanyok", "/sorozatok", "/videok", "/sitemap.xml"]) revalidatePath(path);
  for (const path of ["/tanulmanyok/[slug]", "/sorozatok/[slug]"]) revalidatePath(path, "page");
  revalidatePath("/admin/tanulmanyok");
  revalidatePath("/admin/sorozatok");
}

export async function loginAction(formData: FormData) {
  if (!isAdminAuthConfigured()) redirect("/admin?error=Az+admin+belépés+még+nincs+beállítva.");
  const headerStore = await headers();
  const key = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isLoginRateLimited(key)) redirect("/admin?error=Túl+sok+sikertelen+próbálkozás.+Próbáld+újra+15+perc+múlva.");
  if (!verifyAdminPassword(field(formData, "password"))) {
    recordFailedLogin(key);
    redirect("/admin?error=Hibás+jelszó.");
  }
  clearLoginFailures(key);
  await createAdminSession();
  redirect("/admin?message=Sikeres+belépés.");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin?message=Sikeresen+kiléptél.");
}

export async function saveTopicAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const title = field(formData, "title");
  const parsed = topicInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title),
    description: field(formData, "description"), seoTitle: field(formData, "seoTitle"),
    seoDescription: field(formData, "seoDescription"), status: field(formData, "status"),
    featured: formData.get("featured") === "on", sortOrder: Number(field(formData, "sortOrder") || 0),
  });
  if (!parsed.success) redirect(destination("/admin/temak", "error", validationMessage(parsed.error.issues), id));
  const sql = requireSql();
  try {
    const rows = id
      ? await sql.query(`UPDATE topics SET slug=$2,title=$3,description=$4,seo_title=NULLIF($5,''),seo_description=NULLIF($6,''),status=$7,featured=$8,sort_order=$9,updated_at=now(),published_at=CASE WHEN $7='published' THEN COALESCE(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING id::text`, [id, parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder])
      : await sql.query(`INSERT INTO topics(slug,title,description,seo_title,seo_description,status,featured,sort_order,published_at) VALUES($1,$2,$3,NULLIF($4,''),NULLIF($5,''),$6,$7,$8,CASE WHEN $6='published' THEN now() END) RETURNING id::text`, [parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder]);
    refreshPublicContent();
    redirect(destination("/admin/temak", "message", "A téma mentve.", String(rows[0].id)));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    const message = error instanceof Error && error.message.includes("unique") ? "Ez a slug már használatban van." : "A téma mentése nem sikerült.";
    redirect(destination("/admin/temak", "error", message, id));
  }
}

export async function saveStudyAction(_previous: StudySaveState, formData: FormData): Promise<StudySaveState> {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const title = field(formData, "title");
  const parsed = studyInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title), summary: field(formData, "summary"),
    seoTitle: field(formData, "seoTitle"), seoDescription: field(formData, "seoDescription"),
    status: field(formData, "status"), featured: formData.get("featured") === "on",
    sortOrder: Number(field(formData, "sortOrder") || 0), topicIds: ids(formData, "topicIds"),
    relatedStudyIds: ids(formData, "relatedStudyIds"),
    relatedVideoIds: ids(formData, "relatedVideoIds"),
    seriesId: field(formData, "seriesId") || null,
    seriesPosition: Number(field(formData, "seriesPosition") || 1),
  });
  if (!parsed.success) return { error: validationMessage(parsed.error.issues) };
  const file = formData.get("pdf");
  let prepared: PreparedStudyPdf | null = null;
  if (!id && file instanceof File && file.name) {
    try { prepared = await prepareStudyPdf(file, parsed.data.title); }
    catch (error) { return { error: error instanceof Error ? error.message : "A PDF feldolgozása nem sikerült." }; }
  }
  const studyId = id ?? randomUUID();
  let downgraded = false;
  try {
    const sql = requireSql();
    const readiness = id
      ? await sql.query("SELECT published_document_id IS NOT NULL AS has_published_document FROM studies WHERE id=$1", [id])
      : [];
    if (id && !readiness[0]) return { error: "A tanulmány nem található. Frissítsd az oldalt." };
    const publication = resolveStudyPublicationStatus(parsed.data.status, Boolean(prepared || readiness[0]?.has_published_document));
    downgraded = publication.downgraded;
    await persistWithOptionalPdf(prepared, {
      store: (pdf) => storePdf(pdf.buffer, studyId, pdf.filename),
      commit: (stored) => sql.transaction((transaction) => [
        ...studyMetadataQueries(transaction, studyId, parsed.data, publication.status),
        ...(prepared && stored ? studyPdfQueries(transaction, studyId, randomUUID(), 1, prepared, stored) : []),
      ]),
      remove: removeUnusedPdf,
      onCleanupError: logPdfCleanupError,
    });
  } catch (error) {
    console.error("Study save failed", { studyId, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error && error.message.includes("unique")
      ? "Ehhez a címhez már tartozik tanulmány. Adj meg másik címet."
      : "A tanulmány mentése nem sikerült. Az adatok és a kiválasztott PDF megmaradtak; próbáld újra." };
  }
  refreshPublicContent();
  const message = prepared
    ? `A tanulmány és a PDF mentve. A HTML olvasási nézet elkészült; ${prepared.candidates.length} igehely felismerve.`
    : downgraded
      ? "Az adatok mentve. Véglegesített PDF nélkül a tanulmány vázlatként maradt."
      : !id ? "A tanulmány vázlata létrejött. PDF-et később is feltölthetsz." : "A tanulmány adatai mentve.";
  redirect(destination("/admin/tanulmanyok", "message", message, studyId));
}

async function removeUnusedPdf(stored: StoredStudyPdf) {
  if (stored.storageKind === "blob") await deleteBlobPdf(stored.storageKey);
}

function logPdfCleanupError(error: unknown) {
  console.error("Failed to clean up PDF after database transaction failure", { error: error instanceof Error ? error.message : String(error) });
}

export async function saveStudySeriesAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const title = field(formData, "title");
  const parsed = studySeriesInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title),
    description: field(formData, "description"), author: field(formData, "author"),
    sourceUrl: field(formData, "sourceUrl"), status: field(formData, "status"),
    partIds: ids(formData, "partIds"),
  });
  if (!parsed.success) redirect(destination("/admin/sorozatok", "error", validationMessage(parsed.error.issues), id));
  const sql = requireSql();
  const seriesId = id ?? randomUUID();
  const expectedUpdatedAt = field(formData, "expectedUpdatedAt");
  try {
    await sql.transaction((transaction) => [
      transaction.query(SERIES_EDIT_LOCK),
      // Abort stale edits before changing any part. Study membership saves bump this timestamp too.
      ...(id ? [transaction.query(`SELECT 1/count(*)::int AS version_guard
        FROM study_series WHERE id=$1 AND updated_at=$2::timestamptz`, [id, expectedUpdatedAt])] : []),
      id
        ? transaction.query(`UPDATE study_series SET title=$2,slug=$3,description=$4,
          author=NULLIF($5,''),source_url=NULLIF($6,''),status=$7,updated_at=now() WHERE id=$1`,
          [seriesId, parsed.data.title, parsed.data.slug, parsed.data.description, parsed.data.author, parsed.data.sourceUrl, parsed.data.status])
        : transaction.query(`INSERT INTO study_series(id,title,slug,description,author,source_url,status)
          VALUES($1,$2,$3,$4,NULLIF($5,''),NULLIF($6,''),$7)`,
          [seriesId, parsed.data.title, parsed.data.slug, parsed.data.description, parsed.data.author, parsed.data.sourceUrl, parsed.data.status]),
      transaction.query("DELETE FROM study_series_parts WHERE series_id=$1", [seriesId]),
      ...parsed.data.partIds.map((studyId, index) => transaction.query(
        "INSERT INTO study_series_parts(study_id,series_id,position) VALUES($1,$2,$3)", [studyId, seriesId, index + 1],
      )),
    ]);
    refreshPublicContent();
    redirect(destination("/admin/sorozatok", "message", "A sorozat és a részek sorrendje mentve.", seriesId));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    const message = error instanceof Error && error.message.includes("division by zero")
      ? "A sorozat közben megváltozott. Frissítsd az oldalt, majd próbáld újra."
      : error instanceof Error && error.message.includes("study_series_parts_pkey")
        ? "Az egyik tanulmány már másik sorozat része. Előbb helyezd át a tanulmány szerkesztőjében."
        : error instanceof Error && error.message.includes("unique")
          ? "Ez a sorozatcímhez tartozó webcím már használatban van."
          : "A sorozat mentése nem sikerült.";
    redirect(destination("/admin/sorozatok", "error", message, id));
  }
}

export async function uploadStudyPdfAction(formData: FormData) {
  await requireAdmin();
  const studyId = field(formData, "studyId");
  const file = formData.get("pdf");
  if (!studyId || !(file instanceof File) || !file.name) redirect(destination("/admin/tanulmanyok", "error", "Válassz ki egy PDF-fájlt.", studyId));
  const sql = requireSql();
  const studyRows = await sql.query("SELECT title FROM studies WHERE id=$1", [studyId]);
  if (!studyRows[0]?.title) redirect(destination("/admin/tanulmanyok", "error", "A tanulmány nem található.", studyId));
  let prepared: PreparedStudyPdf;
  try { prepared = await prepareStudyPdf(file, String(studyRows[0].title)); }
  catch (error) { redirect(destination("/admin/tanulmanyok", "error", error instanceof Error ? error.message : "A PDF feldolgozása nem sikerült.", studyId)); }
  try {
    const versions = await sql.query("SELECT COALESCE(max(version_number),0)+1 AS next_version FROM study_documents WHERE study_id=$1", [studyId]);
    await persistWithOptionalPdf(prepared, {
      store: (pdf) => storePdf(pdf.buffer, studyId, pdf.filename),
      commit: (stored) => {
        if (!stored) throw new Error("Hiányzó PDF.");
        return sql.transaction((transaction) => studyPdfQueries(transaction, studyId, randomUUID(), Number(versions[0].next_version), prepared, stored));
      },
      remove: removeUnusedPdf,
      onCleanupError: logPdfCleanupError,
    });
  } catch (error) {
    const duplicate = error instanceof Error && error.message.includes("sha256");
    if (!duplicate) console.error("PDF storage or finalization failed", { studyId, error: error instanceof Error ? error.message : String(error) });
    redirect(destination("/admin/tanulmanyok", "error", duplicate ? "Ugyanez a PDF már fel van töltve ehhez a tanulmányhoz." : "A PDF feldolgozása nem sikerült.", studyId));
  }
  refreshPublicContent();
  redirect(destination("/admin/tanulmanyok", "message", `${prepared.candidates.length} igehely felismerve. A HTML olvasási nézet elkészült, a PDF-verzió automatikusan véglegesítve.`, studyId));
}

export async function deleteStudyDocumentAction(formData: FormData) {
  await requireAdmin();
  const studyId = field(formData, "studyId");
  const documentId = field(formData, "documentId");
  if (!studyId || !documentId) redirect(destination("/admin/tanulmanyok", "error", "Érvénytelen PDF-törlési kérés.", studyId));
  if (formData.get("confirmed") !== "on") {
    redirect(destination("/admin/tanulmanyok", "error", "A PDF eltávolításához jelöld be a megerősítést.", studyId));
  }

  const sql = requireSql();
  try {
    const rows = await sql.query(`
      SELECT d.storage_kind, d.storage_key,
        s.status, s.published_document_id::text
      FROM study_documents d
      JOIN studies s ON s.id = d.study_id
      WHERE d.id = $1 AND d.study_id = $2
    `, [documentId, studyId]);
    const document = rows[0];
    if (!document) {
      redirect(destination("/admin/tanulmanyok", "error", "A PDF nem található, vagy nem ehhez a tanulmányhoz tartozik.", studyId));
    }

    const isPublishedDocument = String(document.published_document_id ?? "") === documentId;
    const publication = resolveStudyDocumentRemoval(
      document.status === "published" ? "published" : "draft",
      isPublishedDocument,
    );

    if (document.storage_kind === "blob") await deleteBlobPdf(String(document.storage_key));
    await sql.query("DELETE FROM study_documents WHERE id=$1 AND study_id=$2", [documentId, studyId]);
    if (isPublishedDocument) {
      await sql.query(
        "UPDATE studies SET status=$2,reference_reviewed=false,updated_at=now() WHERE id=$1",
        [studyId, publication.status],
      );
    }
    refreshPublicContent();
    redirect(destination(
      "/admin/tanulmanyok",
      "message",
      publication.downgraded
        ? "A PDF-verzió eltávolítva. A tanulmány automatikusan vázlatra került."
        : "A PDF-verzió eltávolítva.",
      studyId,
    ));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    redirect(destination("/admin/tanulmanyok", "error", "A PDF eltávolítása nem sikerült.", studyId));
  }
}

export async function saveVideoAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const youtubeUrl = field(formData, "youtubeUrl");
  let title = field(formData, "title");
  let channelName = field(formData, "channelName");

  if (parseYouTubeId(youtubeUrl)) {
    try {
      const metadata = await fetchYouTubeMetadata(youtubeUrl);
      title = metadata.title;
      channelName = metadata.channelName;
    } catch (error) {
      console.warn("Unable to refresh YouTube metadata while saving; using submitted values.", error);
    }
  }

  const parsed = videoInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title), description: field(formData, "description"),
    youtubeUrl, youtubeId: parseYouTubeId(youtubeUrl) ?? "", channelName,
    speaker: field(formData, "speaker"),
    seoTitle: field(formData, "seoTitle"), seoDescription: field(formData, "seoDescription"),
    status: field(formData, "status"), featured: formData.get("featured") === "on",
    sortOrder: Number(field(formData, "sortOrder") || 0), topicIds: ids(formData, "topicIds"),
    relatedStudyIds: ids(formData, "relatedStudyIds"),
  });
  if (!parsed.success) redirect(destination("/admin/videok", "error", validationMessage(parsed.error.issues), id));
  const sql = requireSql();
  try {
    const videoId = id ?? randomUUID();
    const [rows] = await sql.transaction((transaction) => [
      id
        ? transaction.query(`UPDATE videos SET slug=$2,title=$3,description=$4,youtube_url=$5,youtube_id=$6,channel_name=NULLIF($7,''),speaker=NULLIF($8,''),seo_title=NULLIF($9,''),seo_description=NULLIF($10,''),status=$11,featured=$12,sort_order=$13,updated_at=now(),published_at=CASE WHEN $11='published' THEN COALESCE(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING id::text`, [videoId, parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.youtubeUrl, parsed.data.youtubeId, parsed.data.channelName, parsed.data.speaker, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder])
        : transaction.query(`INSERT INTO videos(id,slug,title,description,youtube_url,youtube_id,channel_name,speaker,seo_title,seo_description,status,featured,sort_order,published_at) VALUES($1,$2,$3,$4,$5,$6,NULLIF($7,''),NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),$11,$12,$13,CASE WHEN $11='published' THEN now() END) RETURNING id::text`, [videoId, parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.youtubeUrl, parsed.data.youtubeId, parsed.data.channelName, parsed.data.speaker, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder]),
      transaction.query("DELETE FROM video_topics WHERE video_id=$1", [videoId]),
      ...parsed.data.topicIds.map((topicId, index) =>
        transaction.query("INSERT INTO video_topics(video_id,topic_id,sort_order) VALUES($1,$2,$3)", [videoId, topicId, index])),
      transaction.query("DELETE FROM study_videos WHERE video_id=$1", [videoId]),
      ...parsed.data.relatedStudyIds.map((studyId, index) =>
        transaction.query("INSERT INTO study_videos(study_id,video_id,sort_order) VALUES($1,$2,$3)", [studyId, videoId, index])),
    ]);
    if (!rows[0]?.id) throw new Error("A mentendő videó nem található.");
    refreshPublicContent();
    redirect(destination("/admin/videok", "message", "A videó mentve.", videoId));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    const message = error instanceof Error && error.message.includes("unique") ? "Ez a slug már használatban van." : "A videó mentése nem sikerült.";
    redirect(destination("/admin/videok", "error", message, id));
  }
}

export async function deleteContentAction(formData: FormData) {
  await requireAdmin();
  const entity = field(formData, "entity");
  const id = field(formData, "id");
  const confirmedTitle = field(formData, "confirmedTitle");
  const definitions = {
    topic: { table: "topics", path: "/admin/temak", label: "téma" },
    study: { table: "studies", path: "/admin/tanulmanyok", label: "tanulmány" },
    video: { table: "videos", path: "/admin/videok", label: "videó" },
  } as const;
  const definition = definitions[entity as keyof typeof definitions];
  if (!definition || !id) redirect("/admin?error=Érvénytelen+törlési+kérés.");
  const sql = requireSql();
  try {
    const rows = await sql.query(`SELECT title FROM ${definition.table} WHERE id=$1`, [id]);
    const item = rows[0];
    if (!item) redirect(destination(definition.path, "error", "A törlendő tartalom nem található."));
    if (confirmedTitle !== String(item.title)) redirect(destination(definition.path, "error", "A megerősítéshez pontosan írd be a tartalom címét.", id));
    if (entity === "study") {
      const blobs = await sql.query("SELECT storage_key FROM study_documents WHERE study_id=$1 AND storage_kind='blob'", [id]);
      for (const blob of blobs) await deleteBlobPdf(String(blob.storage_key));
    }
    if (entity === "study") {
      await sql.transaction((transaction) => [
        transaction.query(SERIES_EDIT_LOCK),
        transaction.query(`UPDATE study_series SET updated_at=now()
          WHERE id IN (SELECT series_id FROM study_series_parts WHERE study_id=$1)`, [id]),
        transaction.query("DELETE FROM studies WHERE id=$1", [id]),
        transaction.query(COMPACT_SERIES_POSITIONS),
      ]);
    } else {
      await sql.query(`DELETE FROM ${definition.table} WHERE id=$1`, [id]);
    }
    refreshPublicContent();
    redirect(destination(definition.path, "message", `A ${definition.label} törölve.`));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    redirect(destination(definition.path, "error", "A törlés nem sikerült.", id));
  }
}
