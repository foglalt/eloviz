import "server-only";
import { getSql } from "./db";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  consentedAt: Date;
};

export async function saveNewsletterSubscriber(email: string) {
  const sql = getSql();
  if (!sql) throw new Error("A DATABASE_URL nincs beállítva.");

  await sql.query(`
    INSERT INTO newsletter_subscribers(email)
    VALUES ($1)
    ON CONFLICT (email) DO UPDATE SET
      status = 'subscribed',
      consented_at = now(),
      updated_at = now()
  `, [email]);
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const sql = getSql();
  if (!sql) return [];

  const rows = await sql.query(`
    SELECT id::text, email, consented_at
    FROM newsletter_subscribers
    WHERE status = 'subscribed'
    ORDER BY consented_at DESC, id DESC
  `);

  return rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    consentedAt: new Date(String(row.consented_at)),
  }));
}

export async function getNewsletterSubscriberCount() {
  const sql = getSql();
  if (!sql) return 0;
  const rows = await sql.query("SELECT count(*)::int AS count FROM newsletter_subscribers WHERE status='subscribed'");
  return Number(rows[0]?.count ?? 0);
}
