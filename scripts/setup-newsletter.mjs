// Configure the user's existing account; never print secrets or upgrade billing.
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { parseEnv } from 'node:util';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

process.env.NODE_ENV = 'production';
const envPath = new URL('../.env', import.meta.url);
let source = await readFile(envPath, 'utf8');
const env = parseEnv(source);
if (!env.RESEND_API_KEY?.trim()) throw new Error('Add RESEND_API_KEY to .env first.');
if (!env.NEWSLETTER_FROM_EMAIL?.trim()) throw new Error('Add your verified NEWSLETTER_FROM_EMAIL to .env first.');
const sender = /(?:<)?([^<>\s]+@[^<>\s]+)>?$/.exec(env.NEWSLETTER_FROM_EMAIL.trim())?.[1];
if (!sender) throw new Error('NEWSLETTER_FROM_EMAIL must be a valid sender address.');
const resend = new Resend(env.RESEND_API_KEY.trim());
async function request(operation) {
  for (let attempt = 0; ; attempt++) {
    const result = await operation();
    if (result.error?.name === 'rate_limit_exceeded' && attempt < 3) { await new Promise((resolve) => setTimeout(resolve, 1100 * (attempt + 1))); continue; }
    if (result.error || !result.data) throw new Error(`Resend setup failed: ${result.error?.name ?? 'empty_response'}. A Full access key is required.`);
    return result.data;
  }
}
function save(key, value) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  source = pattern.test(source) ? source.replace(pattern, () => line) : `${source.trimEnd()}\n${line}\n`;
  env[key] = value;
}
const domains = await request(() => resend.domains.list());
const domain = domains.data.find((entry) => entry.name.toLowerCase() === sender.split('@')[1].toLowerCase());
if (!domain) throw new Error('Add the exact sender domain to Resend before configuring newsletter delivery.');
const verified = domain.status === 'verified';
const segmentName = 'Élő Víz · Heti értesítő';
let segmentId = env.RESEND_NEWSLETTER_SEGMENT_ID;
if (segmentId) {
  const segment = await request(() => resend.segments.get(segmentId));
  if (segment.name !== segmentName) throw new Error('Configured segment is not the dedicated Élő Víz newsletter list.');
}
else {
  const segments = await request(() => resend.segments.list({ limit: 100 }));
  segmentId = segments.data.find((segment) => segment.name === segmentName)?.id;
  if (!segmentId) segmentId = (await request(() => resend.segments.create({ name: segmentName }))).id;
  save('RESEND_NEWSLETTER_SEGMENT_ID', segmentId);
  await writeFile(envPath, source, 'utf8');
}
const endpoint = 'https://www.eloviz.hu/api/newsletter/webhook';
const hooks = await request(() => resend.webhooks.list({ limit: 100 }));
const existingHook = hooks.data.find((hook) => hook.endpoint === endpoint);
let hook;
if (existingHook) {
  await request(() => resend.webhooks.update(existingHook.id, { events: ['contact.updated', 'contact.deleted'], status: 'enabled' }));
  hook = await request(() => resend.webhooks.get(existingHook.id));
} else hook = await request(() => resend.webhooks.create({ endpoint, events: ['contact.updated', 'contact.deleted'] }));
save('RESEND_WEBHOOK_SECRET', hook.signing_secret);
if (!env.CRON_SECRET?.trim()) save('CRON_SECRET', randomBytes(32).toString('hex'));
// Real provider validation and production verification precede explicit activation.
if (!verified || !env.NEWSLETTER_ENABLED) save('NEWSLETTER_ENABLED', 'false');
await writeFile(envPath, source, 'utf8');
// Preserve explicitly consented addresses collected before double opt-in shipped.
// Never reactivate an existing provider opt-out during this background migration.
if (env.DATABASE_URL) {
  const sql = neon(env.DATABASE_URL);
  const legacy = await sql.query("SELECT email FROM newsletter_subscribers WHERE status='subscribed' AND resend_contact_id IS NULL");
  for (const row of legacy) {
    const existing = await request(async () => {
      const result = await resend.contacts.get({ email: row.email });
      return result.error?.name === 'not_found' ? { data: { missing: true }, error: null } : result;
    });
    if (existing.unsubscribed) {
      await sql.query("UPDATE newsletter_subscribers SET status='unsubscribed',resend_contact_id=$2,updated_at=now() WHERE email=$1 AND status='subscribed'", [row.email, existing.id]);
      continue;
    }
    let contactId = existing.id;
    if (existing.missing) contactId = (await request(() => resend.contacts.create({ email: row.email, unsubscribed: false, segments: [{ id: segmentId }] }))).id;
    else await request(() => resend.contacts.segments.add({ contactId, segmentId }));
    await sql.query("UPDATE newsletter_subscribers SET resend_contact_id=$2,confirmed_at=coalesce(confirmed_at,consented_at),updated_at=now() WHERE email=$1 AND status='subscribed'", [row.email, contactId]);
  }
  console.log(`Processed ${legacy.length} previously consented subscriptions; provider opt-outs preserved.`);
}
console.log(`${verified ? 'Verified' : 'Pending'} sender domain, dedicated segment and signed unsubscribe webhook configured. Server secrets saved only in ignored .env; delivery remains gated by NEWSLETTER_ENABLED.`);
