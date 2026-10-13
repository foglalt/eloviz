import "server-only";
import { randomUUID } from "node:crypto";
import { requireSql } from "./db";
import { getNewsletterSubscriberCount } from "./newsletter";
import { digestPeriod, orderDigestItems, providerDeliveryState, renderDigest, type DigestItem } from "./newsletter-delivery-core";
import { newsletterProvider, providerRequest, requireProviderData } from "./newsletter-provider";

export async function listDigestItems(start: Date, end: Date): Promise<DigestItem[]> {
  const rows = await requireSql().query(`SELECT s.id::text,'study' AS kind,s.slug,s.title,s.summary,s.published_at,
      series.title AS series_title,parts.position,series.id::text AS series_id
    FROM studies s JOIN study_documents d ON d.id=s.published_document_id AND d.study_id=s.id
    LEFT JOIN study_series_parts parts ON parts.study_id=s.id
    LEFT JOIN study_series series ON series.id=parts.series_id AND series.status='published'
    WHERE s.status='published' AND s.published_at>$1 AND s.published_at<=$2
    UNION ALL SELECT v.id::text,'video',v.slug,v.title,v.description,v.published_at,NULL,NULL,NULL
    FROM videos v WHERE v.status='published' AND v.published_at>$1 AND v.published_at<=$2
    ORDER BY published_at,position NULLS LAST,id`, [start.toISOString(), end.toISOString()]);
  return orderDigestItems(rows.map((row) => ({ id: String(row.id), kind: row.kind === "study" ? "study" as const : "video" as const,
    slug: String(row.slug), title: String(row.title), summary: String(row.summary),
    publishedAt: new Date(String(row.published_at)).toISOString(),
    ...(row.series_title ? { seriesTitle: String(row.series_title), seriesId: String(row.series_id), position: Number(row.position) } : {}) })));
}

export async function newsletterOverview() {
  const sql = requireSql();
  const { start, end } = digestPeriod(new Date(Date.now() + 7 * 86400000));
  const [counts, runs, items] = await Promise.all([
    sql.query("SELECT status,count(*)::int AS count FROM newsletter_subscribers GROUP BY status"),
    sql.query("SELECT id::text,period_end,status,broadcast_id,note FROM newsletter_digest_runs ORDER BY period_end DESC LIMIT 12"),
    listDigestItems(start, end),
  ]);
  return { counts, runs, items, end };
}

export async function deliverWeeklyDigest(now = new Date()) {
  const provider = newsletterProvider();
  const sql = requireSql();
  const { start, end } = digestPeriod(now);
  const leaseId = randomUUID();
  const claimed = await sql.query(`INSERT INTO newsletter_digest_runs(period_start,period_end,status,lease_id,lease_until)
    VALUES ($1,$2,'preparing',$3,now()+interval '20 minutes')
    ON CONFLICT(period_end) DO UPDATE SET lease_id=$3,lease_until=now()+interval '20 minutes',updated_at=now()
    WHERE newsletter_digest_runs.status NOT IN ('sent','skipped')
      AND (newsletter_digest_runs.lease_until IS NULL OR newsletter_digest_runs.lease_until<now())
    RETURNING id::text,status,broadcast_id,items`, [start.toISOString(), end.toISOString(), leaseId]);
  if (!claimed.length) return { status: "already_processed" };
  const run = claimed[0];
  let stage = String(run.status);
  const update = async (status: string, note: string | null, broadcastId: string | null = null) => {
    await sql.query(`UPDATE newsletter_digest_runs SET status=$3,note=$4,broadcast_id=coalesce($5,broadcast_id),updated_at=now()
      WHERE id=$1 AND lease_id=$2`, [run.id, leaseId, status, note, broadcastId]);
    stage = status;
  };
  try {
    if (run.broadcast_id) {
      const broadcast = requireProviderData(await providerRequest(() => provider.resend.broadcasts.get(String(run.broadcast_id))));
      const status = providerDeliveryState(broadcast.status, stage);
      if (status !== "draft") {
        await update(status, status === "review" ? "A küldési kérés eredménye bizonytalan. Ellenőrizd a Resend felületén; automatikusan nem küldjük újra." : null);
        return { status };
      }
    } else if (["creating", "sending", "review"].includes(stage)) {
      await update("review", "A szolgáltatói művelet eredménye nem rögzült. Ellenőrizd a Resend felületén; automatikusan nem készül új levél.");
      return { status: "review" };
    } else {
      const [items, subscribers] = await Promise.all([listDigestItems(start, end), getNewsletterSubscriberCount()]);
      await sql.query("UPDATE newsletter_digest_runs SET items=$3::jsonb WHERE id=$1 AND lease_id=$2", [run.id, leaseId, JSON.stringify(items)]);
      if (!items.length || !subscribers) {
        await update("skipped", !items.length ? "Ezen a héten nincs új tartalom." : "Még nincs megerősített feliratkozó.");
        return { status: "skipped" };
      }
      // Persist before the external mutation. A lost response is reviewed, not repeated.
      await update("creating", null);
      const email = renderDigest(items, end);
      const draft = requireProviderData(await providerRequest(() => provider.resend.broadcasts.create({ ...email, from: provider.from,
        segmentId: provider.segmentId, name: `Élő Víz ${end.toISOString().slice(0, 10)}`, send: false })));
      run.broadcast_id = draft.id;
      await update("draft", null, draft.id);
    }
    await update("sending", null);
    requireProviderData(await providerRequest(() => provider.resend.broadcasts.send(String(run.broadcast_id))));
    await update("sent", null);
    return { status: "sent" };
  } catch (error) {
    const uncertain = stage === "creating" || stage === "sending";
    await update(uncertain ? "review" : "failed", uncertain
      ? "A szolgáltatói művelet eredménye bizonytalan; ellenőrzést igényel a Resend felületén."
      : "Az értesítő előkészítése nem sikerült. Következő indításkor újrapróbáljuk.");
    console.error("Weekly newsletter failed.", error instanceof Error ? error.message : "Unknown error");
    throw new Error("Weekly newsletter failed.");
  } finally {
    await sql.query("UPDATE newsletter_digest_runs SET lease_until=NULL WHERE id=$1 AND lease_id=$2", [run.id, leaseId]);
  }
}
