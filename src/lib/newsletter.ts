import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getSql, requireSql } from "./db";
import { isConfirmationToken } from "./newsletter-delivery-core";
import { newsletterProvider, providerRequest, requireProviderData } from "./newsletter-provider";

export type NewsletterSubscriber = { id: string; email: string; status: string; consentedAt: Date };
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function requestNewsletterConfirmation(email: string, clientAddress: string, now = new Date()) {
  const { resend, from } = newsletterProvider();
  const sql = requireSql();
  const ipHash = createHash("sha256").update(`${process.env.CRON_SECRET}:${clientAddress}`).digest("hex");
  await sql.query("DELETE FROM newsletter_request_limits WHERE expires_at < now()");
  for (const [bucket, limit, duration] of [[`ip:${ipHash}:${now.toISOString().slice(0, 13)}`, 5, 3600], [`day:${now.toISOString().slice(0, 10)}`, 80, 86400]] as const) {
    const result = await sql.query(`INSERT INTO newsletter_request_limits(bucket,count,expires_at)
      VALUES ($1,1,now()+make_interval(secs=>$3)) ON CONFLICT(bucket) DO UPDATE
      SET count=newsletter_request_limits.count+1 WHERE newsletter_request_limits.count<$2 RETURNING count`, [bucket, limit, duration]);
    if (!result.length) throw new Error("Newsletter confirmation rate limit reached.");
  }
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const rows = await sql.query(`INSERT INTO newsletter_subscribers(email,status,confirmation_hash,confirmation_expires_at,confirmation_requested_at)
    VALUES ($1,'pending',$2,now()+interval '72 hours',now())
    ON CONFLICT(email) DO UPDATE SET status='pending',consented_at=now(),confirmation_hash=$2,
      confirmation_expires_at=now()+interval '72 hours',confirmation_requested_at=now(),updated_at=now()
    WHERE newsletter_subscribers.status<>'subscribed' AND
      (newsletter_subscribers.confirmation_requested_at IS NULL OR newsletter_subscribers.confirmation_requested_at<now()-interval '10 minutes')
    RETURNING id`, [email, tokenHash]);
  if (!rows.length) return;
  const url = `https://www.eloviz.hu/feliratkozas/megerosites?token=${token}`;
  const delivery = await providerRequest(() => resend.emails.send({
    from, to: email, subject: "Élő Víz · Erősítsd meg a feliratkozásodat",
    text: `Kérted az Élő Víz heti értesítőjét. A megerősítéshez nyisd meg ezt a linket, majd kattints a megerősítő gombra:\n${url}\n\nA link 72 óráig érvényes. Ha nem te kérted a feliratkozást, nincs teendőd; értesítőt nem küldünk.\nÉlő Víz · https://www.eloviz.hu`,
    html: `<html lang="hu"><body style="font-family:Arial,sans-serif;color:#193f3d;max-width:600px;margin:32px auto;padding:16px"><h1>Élő Víz</h1><h2>Erősítsd meg a feliratkozásodat</h2><p>Kérted az Élő Víz heti értesítőjét az új tanulmányokról és videókról.</p><p><a href="${url}">Megerősítem a feliratkozásomat →</a></p><p>A megnyíló oldalon kattints a megerősítő gombra. A link 72 óráig érvényes.</p><p>Ha nem te kérted a feliratkozást, nincs teendőd; értesítőt nem küldünk.</p></body></html>`,
  }, { idempotencyKey: `eloviz-confirm-${tokenHash}` }));
  if (delivery.error) await sql.query("UPDATE newsletter_subscribers SET confirmation_requested_at=NULL WHERE confirmation_hash=$1", [tokenHash]);
  return requireProviderData(delivery).id;
}

export async function confirmNewsletterSubscription(token: string) {
  if (!isConfirmationToken(token)) return false;
  const sql = requireSql();
  const tokenHash = hashToken(token);
  const rows = await sql.query(`SELECT id::text,email FROM newsletter_subscribers
    WHERE confirmation_hash=$1 AND confirmation_expires_at>now() AND status='pending'`, [tokenHash]);
  if (!rows.length) return false;
  const email = String(rows[0].email);
  const { resend, segmentId } = newsletterProvider();
  const existing = await providerRequest(() => resend.contacts.get({ email }));
  let contactId: string;
  if (existing.data) {
    contactId = existing.data.id;
    requireProviderData(await providerRequest(() => resend.contacts.update({ id: contactId, unsubscribed: false })));
    requireProviderData(await providerRequest(() => resend.contacts.segments.add({ contactId, segmentId })));
  } else {
    if (existing.error?.name !== "not_found") requireProviderData(existing);
    contactId = requireProviderData(await providerRequest(() => resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] }))).id;
  }
  const updated = await sql.query(`UPDATE newsletter_subscribers SET status='subscribed',confirmed_at=now(),
    resend_contact_id=$2,confirmation_hash=NULL,confirmation_expires_at=NULL,updated_at=now()
    WHERE confirmation_hash=$1 AND status='pending' AND confirmation_expires_at>now() RETURNING id`, [tokenHash, contactId]);
  return updated.length > 0;
}

export async function synchronizeNewsletterOptOut(email: string, contactId: string, eventAt: string) {
  await requireSql().query(`UPDATE newsletter_subscribers SET status='unsubscribed',confirmation_hash=NULL,
    confirmation_expires_at=NULL,provider_event_at=$3,updated_at=now()
    WHERE email=$1 AND (resend_contact_id IS NULL OR resend_contact_id=$2)
      AND (confirmed_at IS NULL OR confirmed_at<=$3::timestamptz)
      AND (provider_event_at IS NULL OR provider_event_at<=$3::timestamptz)`, [email.toLowerCase(), contactId, eventAt]);
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT id::text,email,status,consented_at FROM newsletter_subscribers ORDER BY consented_at DESC,id DESC LIMIT 100`);
  return rows.map((row) => ({ id: String(row.id), email: String(row.email), status: String(row.status), consentedAt: new Date(String(row.consented_at)) }));
}

export async function getNewsletterSubscriberCount() {
  const sql = getSql();
  if (!sql) return 0;
  const rows = await sql.query("SELECT count(*)::int AS count FROM newsletter_subscribers WHERE status='subscribed'");
  return Number(rows[0]?.count ?? 0);
}
