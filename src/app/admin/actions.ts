"use server";

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
import { deleteBlobPdf, MAX_PDF_BYTES, sha256, storePdf, validatePdfBuffer } from "@/lib/document-storage";
import { extractPdfPages } from "@/lib/pdf-extract";
import { DETECTOR_VERSION, detectScriptureReferences, parseOsisReferenceLine } from "@/lib/scripture-references";
import { parseYouTubeId, sanitizePdfFilename, slugifyHungarian, studyInputSchema, topicInputSchema, videoInputSchema } from "@/lib/content-validation";
import { resolveStudyDocumentRemoval, resolveStudyPublicationStatus } from "@/lib/study-publication";

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
  for (const path of ["/", "/temak", "/tanulmanyok", "/videok", "/sitemap.xml"]) revalidatePath(path);
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

export async function saveStudyAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const title = field(formData, "title");
  const parsed = studyInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title), summary: field(formData, "summary"),
    seoTitle: field(formData, "seoTitle"), seoDescription: field(formData, "seoDescription"),
    status: field(formData, "status"), featured: formData.get("featured") === "on",
    sortOrder: Number(field(formData, "sortOrder") || 0), topicIds: ids(formData, "topicIds"),
    relatedVideoIds: ids(formData, "relatedVideoIds"),
  });
  if (!parsed.success) redirect(destination("/admin/tanulmanyok", "error", validationMessage(parsed.error.issues), id));
  const sql = requireSql();
  try {
    const readiness = id
      ? await sql.query("SELECT published_document_id IS NOT NULL AS has_published_document FROM studies WHERE id=$1", [id])
      : [];
    const publication = resolveStudyPublicationStatus(
      parsed.data.status,
      Boolean(readiness[0]?.has_published_document),
    );
    const status = id ? publication.status : "draft";
    const rows = id
      ? await sql.query(`UPDATE studies SET slug=$2,title=$3,summary=$4,seo_title=NULLIF($5,''),seo_description=NULLIF($6,''),status=$7,featured=$8,sort_order=$9,updated_at=now(),published_at=CASE WHEN $7='published' THEN COALESCE(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING id::text`, [id, parsed.data.slug, parsed.data.title, parsed.data.summary, parsed.data.seoTitle, parsed.data.seoDescription, status, parsed.data.featured, parsed.data.sortOrder])
      : await sql.query(`INSERT INTO studies(slug,title,summary,seo_title,seo_description,status,featured,sort_order) VALUES($1,$2,$3,NULLIF($4,''),NULLIF($5,''),$6,$7,$8) RETURNING id::text`, [parsed.data.slug, parsed.data.title, parsed.data.summary, parsed.data.seoTitle, parsed.data.seoDescription, status, parsed.data.featured, parsed.data.sortOrder]);
    const studyId = String(rows[0].id);
    await sql.query("DELETE FROM study_topics WHERE study_id=$1", [studyId]);
    for (const [index, topicId] of parsed.data.topicIds.entries()) await sql.query("INSERT INTO study_topics(study_id,topic_id,sort_order) VALUES($1,$2,$3)", [studyId, topicId, index]);
    await sql.query("DELETE FROM study_videos WHERE study_id=$1", [studyId]);
    for (const [index, videoId] of parsed.data.relatedVideoIds.entries()) await sql.query("INSERT INTO study_videos(study_id,video_id,sort_order) VALUES($1,$2,$3)", [studyId, videoId, index]);
    refreshPublicContent();
    const message = !id
      ? "A tanulmány vázlata létrejött. Most feltöltheted a PDF-et."
      : publication.downgraded
        ? "Az adatok mentve. Véglegesített PDF nélkül a tanulmány vázlatként maradt."
        : "A tanulmány adatai mentve.";
    redirect(destination("/admin/tanulmanyok", "message", message, studyId));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    const message = error instanceof Error && error.message.includes("unique") ? "Ez a slug már használatban van." : "A tanulmány mentése nem sikerült.";
    redirect(destination("/admin/tanulmanyok", "error", message, id));
  }
}

export async function uploadStudyPdfAction(formData: FormData) {
  await requireAdmin();
  const studyId = field(formData, "studyId");
  const file = formData.get("pdf");
  if (!studyId || !(file instanceof File) || file.size === 0) redirect(destination("/admin/tanulmanyok", "error", "Válassz ki egy PDF-fájlt.", studyId));
  if (file.size > MAX_PDF_BYTES) redirect(destination("/admin/tanulmanyok", "error", "A PDF legfeljebb 12 MB lehet.", studyId));
  const buffer = Buffer.from(await file.arrayBuffer());
  try { validatePdfBuffer(buffer); } catch (error) {
    redirect(destination("/admin/tanulmanyok", "error", error instanceof Error ? error.message : "Érvénytelen PDF.", studyId));
  }
  const sql = requireSql();
  try {
    const versionRows = await sql.query("SELECT COALESCE(max(version_number),0)+1 AS next_version FROM study_documents WHERE study_id=$1", [studyId]);
    const version = Number(versionRows[0].next_version);
    const filename = sanitizePdfFilename(file.name);
    const stored = await storePdf(buffer, studyId, filename);
    let pages: string[] = [];
    let extractionStatus: "complete" | "manual_required" | "failed" = "complete";
    let extractionError: string | null = null;
    try {
      pages = await extractPdfPages(buffer);
      if (pages.join(" ").trim().length < 40) {
        extractionStatus = "manual_required";
        extractionError = "A PDF-ben kevés géppel olvasható szöveg található. Az igehelyeket kézzel ellenőrizd.";
      }
    } catch {
      extractionStatus = "failed";
      extractionError = "A szöveg automatikus kiolvasása nem sikerült. Az igehelyek kézzel megadhatók.";
    }
    const documentRows = await sql.query(`INSERT INTO study_documents(study_id,version_number,original_filename,byte_size,sha256,storage_kind,storage_key,file_data,extraction_status,extraction_error,extracted_text) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id::text`, [studyId, version, filename, buffer.length, sha256(buffer), stored.storageKind, stored.storageKey, stored.fileData, extractionStatus, extractionError, pages.join("\n\n")]);
    const documentId = String(documentRows[0].id);
    const candidates = detectScriptureReferences(pages);
    for (const [index, candidate] of candidates.entries()) {
      await sql.query(`INSERT INTO study_reference_candidates(document_id,raw_text,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,page_number,context_snippet,detector_version,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [documentId, candidate.rawText, candidate.displayLabel, candidate.bookCode, candidate.startChapter, candidate.startVerse, candidate.endChapter, candidate.endVerse, candidate.osisStart, candidate.osisEnd, candidate.pageNumber, candidate.contextSnippet, DETECTOR_VERSION, index]);
    }
    await sql.query("UPDATE studies SET reference_reviewed=false,updated_at=now() WHERE id=$1", [studyId]);
    redirect(destination("/admin/tanulmanyok", "message", `${candidates.length} igehely-javaslat készült. Ellenőrizd és véglegesítsd a listát.`, studyId));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    const duplicate = error instanceof Error && error.message.includes("sha256");
    redirect(destination("/admin/tanulmanyok", "error", duplicate ? "Ugyanez a PDF már fel van töltve ehhez a tanulmányhoz." : "A PDF feldolgozása nem sikerült.", studyId));
  }
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

export async function finalizeStudyReferencesAction(formData: FormData) {
  await requireAdmin();
  const studyId = field(formData, "studyId");
  const documentId = field(formData, "documentId");
  if (formData.get("confirmed") !== "on") redirect(destination("/admin/tanulmanyok", "error", "A véglegesítéshez jelöld be az ellenőrzés megerősítését.", studyId));
  const rawLines = field(formData, "references").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = rawLines.map(parseOsisReferenceLine);
  if (parsed.some((reference) => !reference)) redirect(destination("/admin/tanulmanyok", "error", "Hibás igehelyformátum. Példa: Jn 3:16 | John.3.16", studyId));
  const references = parsed.filter((reference) => reference !== null);
  const sql = requireSql();
  try {
    const validDocument = await sql.query("SELECT 1 FROM study_documents WHERE id=$1 AND study_id=$2", [documentId, studyId]);
    if (!validDocument.length) redirect(destination("/admin/tanulmanyok", "error", "A dokumentum nem tartozik ehhez a tanulmányhoz.", studyId));
    const bookRows = await sql.query("SELECT code FROM canonical_books");
    const knownBooks = new Set(bookRows.map((row) => String(row.code)));
    if (references.some((reference) => !knownBooks.has(reference.bookCode))) redirect(destination("/admin/tanulmanyok", "error", "Ismeretlen OSIS-könyvkód van a listában.", studyId));
    await sql.query("DELETE FROM study_scripture_references WHERE study_id=$1 AND document_id=$2", [studyId, documentId]);
    for (const [index, reference] of references.entries()) {
      await sql.query(`INSERT INTO study_scripture_references(study_id,document_id,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [studyId, documentId, reference.displayLabel, reference.bookCode, reference.startChapter, reference.startVerse, reference.endChapter, reference.endVerse, reference.osisStart, reference.osisEnd, index]);
    }
    await sql.query("UPDATE study_reference_candidates SET review_status='rejected' WHERE document_id=$1", [documentId]);
    for (const reference of references) await sql.query("UPDATE study_reference_candidates SET review_status='accepted' WHERE document_id=$1 AND osis_start=$2 AND osis_end=$3", [documentId, reference.osisStart, reference.osisEnd]);
    const publishNow = formData.get("publishNow") === "on";
    await sql.query("UPDATE studies SET published_document_id=$2,reference_reviewed=true,status=CASE WHEN $3 THEN 'published' ELSE status END,published_at=CASE WHEN $3 THEN COALESCE(published_at,now()) ELSE published_at END,updated_at=now() WHERE id=$1", [studyId, documentId, publishNow]);
    refreshPublicContent();
    redirect(destination("/admin/tanulmanyok", "message", publishNow ? "Az igehelyek véglegesítve, a tanulmány publikálva." : "Az igehelyek és a PDF-verzió véglegesítve.", studyId));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    redirect(destination("/admin/tanulmanyok", "error", "Az igehelyek véglegesítése nem sikerült.", studyId));
  }
}

export async function saveVideoAction(formData: FormData) {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const title = field(formData, "title");
  const youtubeUrl = field(formData, "youtubeUrl");
  const parsed = videoInputSchema.safeParse({
    id, title, slug: field(formData, "slug") || slugifyHungarian(title), description: field(formData, "description"),
    youtubeUrl, youtubeId: parseYouTubeId(youtubeUrl) ?? "", channelName: field(formData, "channelName"),
    seoTitle: field(formData, "seoTitle"), seoDescription: field(formData, "seoDescription"),
    status: field(formData, "status"), featured: formData.get("featured") === "on",
    sortOrder: Number(field(formData, "sortOrder") || 0), topicIds: ids(formData, "topicIds"),
    relatedStudyIds: ids(formData, "relatedStudyIds"),
  });
  if (!parsed.success) redirect(destination("/admin/videok", "error", validationMessage(parsed.error.issues), id));
  const sql = requireSql();
  try {
    const rows = id
      ? await sql.query(`UPDATE videos SET slug=$2,title=$3,description=$4,youtube_url=$5,youtube_id=$6,channel_name=NULLIF($7,''),seo_title=NULLIF($8,''),seo_description=NULLIF($9,''),status=$10,featured=$11,sort_order=$12,updated_at=now(),published_at=CASE WHEN $10='published' THEN COALESCE(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING id::text`, [id, parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.youtubeUrl, parsed.data.youtubeId, parsed.data.channelName, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder])
      : await sql.query(`INSERT INTO videos(slug,title,description,youtube_url,youtube_id,channel_name,seo_title,seo_description,status,featured,sort_order,published_at) VALUES($1,$2,$3,$4,$5,NULLIF($6,''),NULLIF($7,''),NULLIF($8,''),$9,$10,$11,CASE WHEN $9='published' THEN now() END) RETURNING id::text`, [parsed.data.slug, parsed.data.title, parsed.data.description, parsed.data.youtubeUrl, parsed.data.youtubeId, parsed.data.channelName, parsed.data.seoTitle, parsed.data.seoDescription, parsed.data.status, parsed.data.featured, parsed.data.sortOrder]);
    const videoId = String(rows[0].id);
    await sql.query("DELETE FROM video_topics WHERE video_id=$1", [videoId]);
    for (const [index, topicId] of parsed.data.topicIds.entries()) await sql.query("INSERT INTO video_topics(video_id,topic_id,sort_order) VALUES($1,$2,$3)", [videoId, topicId, index]);
    await sql.query("DELETE FROM study_videos WHERE video_id=$1", [videoId]);
    for (const [index, studyId] of parsed.data.relatedStudyIds.entries()) await sql.query("INSERT INTO study_videos(study_id,video_id,sort_order) VALUES($1,$2,$3)", [studyId, videoId, index]);
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
    await sql.query(`DELETE FROM ${definition.table} WHERE id=$1`, [id]);
    refreshPublicContent();
    redirect(destination(definition.path, "message", `A ${definition.label} törölve.`));
  } catch (error) {
    rethrowFrameworkRedirect(error);
    redirect(destination(definition.path, "error", "A törlés nem sikerült.", id));
  }
}
