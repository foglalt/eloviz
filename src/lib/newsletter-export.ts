import "server-only";
import { Resend } from "resend";
import { requireSql } from "./db";
import { providerRequest, requireProviderData } from "./newsletter-provider";
import { collectExportPages, reconcileNewsletterExport, type PortableSubscriber } from "./newsletter-export-core";

export async function exportNewsletterMigration() {
  const key = process.env.RESEND_API_KEY?.trim();
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();
  if (!key || !segmentId) throw new Error("Export needs provider read access and the newsletter segment.");
  const startedAt = new Date().toISOString();
  const sql = requireSql();
  const subscriberQuery = `SELECT id::text,email,status,consented_at,confirmed_at,updated_at
    FROM newsletter_subscribers ORDER BY id`;
  const runQuery = `SELECT id::text,period_start,period_end,status,items,broadcast_id,updated_at
    FROM newsletter_digest_runs ORDER BY period_end`;
  const [rows, runs] = await sql.transaction((tx) => [tx.query(subscriberQuery), tx.query(runQuery)],
    { isolationLevel: "RepeatableRead", readOnly: true });
  const resend = new Resend(key);
  const contacts = await collectExportPages(async (after) => requireProviderData(await providerRequest(() => resend.contacts.list({ limit: 100, ...(after ? { after } : {}) }))));
  const members = await collectExportPages(async (after) => requireProviderData(await providerRequest(() => resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) }))));
  const suppressions = await collectExportPages(async (after) => requireProviderData(await providerRequest(() => resend.suppressions.list({ limit: 100, ...(after ? { after } : {}) }))));
  const broadcasts = await collectExportPages(async (after) => requireProviderData(await providerRequest(() => resend.broadcasts.list({ limit: 100, ...(after ? { after } : {}) }))));
  const sourceIds = new Set(runs.map((run) => String(run.broadcast_id ?? "")));
  const newsletterBroadcasts = broadcasts.filter((broadcast) => broadcast.segment_id === segmentId || sourceIds.has(broadcast.id));
  const [finalRows, finalRuns] = await sql.transaction((tx) => [tx.query(subscriberQuery), tx.query(runQuery)],
    { isolationLevel: "RepeatableRead", readOnly: true });
  if (JSON.stringify(rows) !== JSON.stringify(finalRows) || JSON.stringify(runs) !== JSON.stringify(finalRuns)) {
    throw new Error("Newsletter data changed during export; retry.");
  }
  const date = (value: unknown) => new Date(String(value)).toISOString();
  const subscribers: PortableSubscriber[] = rows.map((row) => ({ id: String(row.id), email: String(row.email),
    status: row.status as PortableSubscriber["status"], consentedAt: date(row.consented_at),
    confirmedAt: row.confirmed_at ? date(row.confirmed_at) : null, updatedAt: date(row.updated_at) }));
  const records = reconcileNewsletterExport(subscribers, contacts, members, suppressions);
  const activeRuns = runs.filter((run) => !["sent", "skipped"].includes(String(run.status)));
  const sendingPaused = process.env.NEWSLETTER_ENABLED !== "true";
  return {
    schemaVersion: 1,
    site: "https://www.eloviz.hu",
    sourceProvider: "resend",
    startedAt,
    finishedAt: new Date().toISOString(),
    sendingPaused,
    // Cross-system snapshots need final reconciliation at cutover; never auto-import.
    requiresFinalReconciliation: true,
    cutoverBlockers: [...(!sendingPaused ? ["sending_is_enabled"] : []),
      ...(activeRuns.length ? ["unresolved_digest_runs"] : []),
      ...(newsletterBroadcasts.some((broadcast) => !["draft", "sent", "failed", "canceled"].includes(String(broadcast.status))) ? ["provider_broadcasts_in_flight"] : []),
      ...(records.some((record) => record.eligibility === "review") ? ["subscriber_review_required"] : [])],
    counts: {
      total: records.length,
      eligible: records.filter((record) => record.eligibility === "eligible").length,
      blocked: records.filter((record) => record.eligibility === "blocked").length,
      pending: records.filter((record) => record.eligibility === "pending").length,
      review: records.filter((record) => record.eligibility === "review").length,
    },
    subscribers: records,
    digestRuns: runs.map((run) => ({ id: String(run.id), periodStart: date(run.period_start),
      periodEnd: date(run.period_end), status: String(run.status), items: run.items,
      sourceBroadcastId: run.broadcast_id ? String(run.broadcast_id) : null, updatedAt: date(run.updated_at) })),
    sourceBroadcasts: newsletterBroadcasts.map((broadcast) => ({ id: broadcast.id, status: broadcast.status,
      createdAt: broadcast.created_at, scheduledAt: broadcast.scheduled_at, sentAt: broadcast.sent_at })),
    instructions: [
      "Only eligible records may be imported as active subscriptions.",
      "Import blocked records into the destination do-not-send list first; preserve pending/review without sending.",
      "Pause both senders and signup confirmation writes, reconcile late opt-outs and suppressions, and resolve queued/review runs before cutover.",
      "Keep old Resend unsubscribe URLs and the old webhook working; forward late opt-outs into the new provider.",
      "Do not carry provider contact/broadcast IDs into the new adapter; retain them as historical evidence only.",
    ],
  };
}
