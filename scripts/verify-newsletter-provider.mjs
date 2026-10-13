// Explicit real-provider smoke test: reserved Resend test recipient only.
// An isolated temporary segment prevents sending to any real subscriber.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { registerHooks } from 'node:module';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

if (!process.argv.includes('--send-provider-tests')) throw new Error('Pass --send-provider-tests to send only to a reserved Resend test address.');
process.env.NODE_ENV = 'production';
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export%20%7B%7D', shortCircuit: true };
  try { return nextResolve(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context); throw error; }
} });
const sql = neon(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);
const id = randomUUID();
const email = `delivered+eloviz-${id}@resend.dev`;
const testPeriod = '2090-02-05T18:00:00Z';
const testDay = '2090-02-01';
const ip = `resend-provider-${id}`;
const videoId = randomUUID();
let segmentId;
let contactId;
let broadcastId;
const data = (result) => { if (result.error || !result.data) throw new Error(`Provider probe failed: ${result.error?.name ?? 'empty_response'}`); return result.data; };
assert.equal((await sql.query('SELECT id FROM newsletter_digest_runs WHERE period_end=$1', [testPeriod])).length, 0);
assert.equal((await sql.query('SELECT bucket FROM newsletter_request_limits WHERE bucket=$1', [`day:${testDay}`])).length, 0);
const domains = data(await resend.domains.list());
assert.ok(domains.data.some((domain) => domain.name === 'eloviz.hu' && domain.status === 'verified'), 'Sender domain must be verified.');
try {
  segmentId = data(await resend.segments.create({ name: `Élő Víz verification ${id}` })).id;
  Object.assign(process.env, { RESEND_NEWSLETTER_SEGMENT_ID: segmentId, NEWSLETTER_ENABLED: 'true', VERCEL_ENV: 'production' });
  const { requestNewsletterConfirmation, confirmNewsletterSubscription } = await import('../src/lib/newsletter.ts');
  const { deliverWeeklyDigest } = await import('../src/lib/newsletter-digest.ts');
  const confirmationId = await requestNewsletterConfirmation(email, ip, new Date(`${testDay}T12:00:00Z`));
  assert.ok(confirmationId);
  const confirmation = data(await resend.emails.get(confirmationId));
  const token = /token=([a-f0-9]{64})/.exec(confirmation.html)?.[1];
  assert.ok(token);
  assert.equal(await confirmNewsletterSubscription(token), true);
  const contact = data(await resend.contacts.get({ email }));
  contactId = contact.id;
  assert.equal(contact.unsubscribed, false);
  const members = data(await resend.contacts.list({ segmentId, limit: 100 }));
  assert.equal(members.has_more, false);
  assert.deepEqual(members.data.map((member) => member.email), [email]);
  console.log('PASS: real verified sender confirmation, single-use token and contact membership; recipient is the reserved Resend sink.');
  await sql.query(`INSERT INTO videos(id,slug,title,description,youtube_url,youtube_id,status,published_at)
    VALUES($1,$2,'Élő Víz értesítő – szolgáltatói teszt','Kizárólag a Resend tesztcímére küldött ellenőrzés.','https://www.youtube.com/watch?v=abcdefghijk','abcdefghijk','published','2090-02-02T12:00:00Z')`, [videoId, `provider-probe-${id}`]);
  assert.equal((await deliverWeeklyDigest(new Date(testPeriod))).status, 'sent');
  const run = (await sql.query('SELECT broadcast_id FROM newsletter_digest_runs WHERE period_end=$1', [testPeriod]))[0];
  broadcastId = run.broadcast_id;
  let broadcast = data(await resend.broadcasts.get(broadcastId));
  assert.equal(broadcast.segment_id, segmentId);
  assert.ok(['queued','sent'].includes(broadcast.status));
  assert.equal((await deliverWeeklyDigest(new Date(testPeriod))).status, 'already_processed');
  console.log(`Broadcast ${broadcastId} queued to the isolated test segment; retaining fixtures until delivery completes.`);
  for (let attempt = 0; attempt < 30 && broadcast.status === 'queued'; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    broadcast = data(await resend.broadcasts.get(broadcastId));
  }
  assert.equal(broadcast.status, 'sent', 'Provider broadcast must complete before fixture cleanup.');
  // Aggregate recipient counters update later than the individual delivery event.
  let weeklyEmails = [];
  for (let attempt = 0; attempt < 10 && !weeklyEmails.length; attempt++) {
    const emails = data(await resend.emails.list({ limit: 100 }));
    weeklyEmails = emails.data.filter((message) => message.to.includes(email) && message.subject.startsWith('Élő Víz · Heti újdonságok'));
    if (!weeklyEmails.length) await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  assert.equal(weeklyEmails.length, 1, 'Exactly one weekly email must exist for the reserved recipient.');
  const weeklyEmail = weeklyEmails[0];
  assert.ok(weeklyEmail);
  let weeklyDelivery = data(await resend.emails.get(weeklyEmail.id));
  for (let attempt = 0; attempt < 10 && weeklyDelivery.last_event !== 'delivered'; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    weeklyDelivery = data(await resend.emails.get(weeklyEmail.id));
  }
  assert.equal(weeklyDelivery.last_event, 'delivered', 'Authoritative email delivery event must be recorded.');
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = data(await resend.emails.get(confirmationId));
    if (current.last_event === 'delivered') break;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  const finalConfirmation = data(await resend.emails.get(confirmationId));
  assert.equal(finalConfirmation.last_event, 'delivered');
  console.log(`PASS: real isolated weekly broadcast delivered (${broadcastId}); repeated execution suppressed; confirmation delivery verified.`);
} finally {
  if (broadcastId) {
    const current = data(await resend.broadcasts.get(broadcastId));
    if (current.status === 'queued') data(await resend.broadcasts.cancel(broadcastId));
  }
  if (!contactId) {
    const result = await resend.contacts.get({ email });
    if (result.data) contactId = result.data.id;
  }
  if (contactId) data(await resend.contacts.remove(contactId));
  if (segmentId) data(await resend.segments.remove(segmentId));
  await sql.transaction((tx) => [
    tx.query('DELETE FROM newsletter_subscribers WHERE email=$1', [email]),
    tx.query('DELETE FROM videos WHERE id=$1', [videoId]),
    tx.query('DELETE FROM newsletter_digest_runs WHERE period_end=$1', [testPeriod]),
    tx.query('DELETE FROM newsletter_request_limits WHERE bucket=$1 OR bucket LIKE $2', [`day:${testDay}`, `ip:${createHash('sha256').update(`${process.env.CRON_SECRET}:${ip}`).digest('hex')}%`]),
  ]);
  console.log('Reserved contact, isolated segment and database fixtures removed. The test broadcast stays in Resend history for delivery evidence.');
}
