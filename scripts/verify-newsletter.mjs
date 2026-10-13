// Real Postgres probes with an explicitly intercepted Resend transport.
// No request to Resend, and no email to a real recipient, can leave this script.
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { neon } from "@neondatabase/serverless";

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,export%20%7B%7D", shortCircuit: true };
  if (specifier.startsWith("@/")) return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return nextResolve(specifier, context); }
  catch (error) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    throw error;
  }
} });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const sql = neon(process.env.DATABASE_URL);
const prefix = `newsletter-probe-${randomUUID()}`;
const email = `${prefix}@example.invalid`;
const contactId = randomUUID();
const webhookSecret = randomBytes(32);
Object.assign(process.env, {
  RESEND_API_KEY: "re_integration_test_only", NEWSLETTER_FROM_EMAIL: "probe@example.invalid",
  RESEND_NEWSLETTER_SEGMENT_ID: randomUUID(), RESEND_WEBHOOK_SECRET: `whsec_${webhookSecret.toString("base64")}`,
  CRON_SECRET: randomBytes(32).toString("hex"), NEWSLETTER_ENABLED: "true", VERCEL_ENV: "production",
});
const actualFetch = globalThis.fetch;
const providerCalls = [];
const broadcasts = new Map();
let sentConfirmation = "";
let contactExists = false;
let loseSendResponse = false;
let rateLimitedOnce = false;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.startsWith("https://api.resend.com/")) return actualFetch(input, init);
  const path = new URL(url).pathname;
  const method = init?.method ?? "GET";
  providerCalls.push(`${method} ${path}`);
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  const json = (value, status = 200) => Response.json(value, { status });
  if (path === "/emails") { sentConfirmation = body.html; return json({ id: randomUUID() }); }
  if (path.startsWith("/contacts")) {
    if (method === "GET") return contactExists ? json({ id: contactId, email, unsubscribed: false }) : json({ name: "not_found", message: "Not found" }, 404);
    if (!rateLimitedOnce) { rateLimitedOnce = true; return json({ name: "rate_limit_exceeded", message: "Too many requests" }, 429); }
    contactExists = true;
    return json({ id: contactId });
  }
  if (path === "/broadcasts" && method === "POST") {
    assert.equal(body.send, false);
    assert.equal(body.segment_id, process.env.RESEND_NEWSLETTER_SEGMENT_ID);
    assert.ok(body.html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}"));
    const id = randomUUID(); broadcasts.set(id, { id, status: "draft" }); return json({ id });
  }
  const id = path.split("/")[2];
  if (path.endsWith("/send")) {
    broadcasts.get(id).status = "sent";
    if (loseSendResponse) throw new Error("Synthetic lost response");
    return json({ id });
  }
  if (method === "GET" && broadcasts.has(id)) return json(broadcasts.get(id));
  throw new Error(`Unexpected test provider request: ${method} ${path}`);
};

const { requestNewsletterConfirmation, confirmNewsletterSubscription } = await import("../src/lib/newsletter.ts");
const { deliverWeeklyDigest, listDigestItems } = await import("../src/lib/newsletter-digest.ts");
const { GET: cron } = await import("../src/app/api/cron/newsletter/route.ts");
const { POST: webhook } = await import("../src/app/api/newsletter/webhook/route.ts");
const videoIds = [randomUUID(), randomUUID(), randomUUID()];
const periodEnds = ["2090-01-08T18:00:00Z", "2090-01-15T18:00:00Z", "2090-01-22T18:00:00Z"];

async function signedEvent(unsubscribed, eventAt, signatureValid = true) {
  const payload = JSON.stringify({ type: "contact.updated", created_at: eventAt, data: { id: contactId, email, unsubscribed, segment_ids: [] } });
  const id = randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", webhookSecret).update(`${id}.${timestamp}.${payload}`).digest("base64");
  return webhook(new Request("https://www.eloviz.hu/api/newsletter/webhook", { method: "POST", body: payload,
    headers: { "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${signatureValid ? signature : "invalid"}` } }));
}

// Preflight runs outside cleanup: never remove a preexisting record on failure.
const beforeDay = await sql.query("SELECT count FROM newsletter_request_limits WHERE bucket='day:2090-01-02'");
assert.equal(beforeDay.length, 0, "The synthetic future-day rate bucket already exists.");
const beforeRuns = await sql.query("SELECT id FROM newsletter_digest_runs WHERE period_end=ANY($1::timestamptz[])", [periodEnds]);
assert.equal(beforeRuns.length, 0, "Synthetic future-period digest runs already exist.");
try {
  await requestNewsletterConfirmation(email, prefix, new Date("2090-01-02T12:00:00Z"));
  const token = /token=([a-f0-9]{64})/.exec(sentConfirmation)?.[1];
  assert.ok(token);
  const pending = await sql.query("SELECT status,confirmation_hash FROM newsletter_subscribers WHERE email=$1", [email]);
  assert.equal(pending[0].status, "pending");
  assert.equal(pending[0].confirmation_hash, createHash("sha256").update(token).digest("hex"));
  await requestNewsletterConfirmation(email, prefix, new Date("2090-01-02T12:00:00Z"));
  assert.equal(providerCalls.filter((call) => call === "POST /emails").length, 1);
  assert.equal(await confirmNewsletterSubscription("bad"), false);
  await sql.query("UPDATE newsletter_subscribers SET confirmation_expires_at=now()-interval '1 second' WHERE email=$1", [email]);
  assert.equal(await confirmNewsletterSubscription(token), false);
  await sql.query("UPDATE newsletter_subscribers SET confirmation_expires_at=now()+interval '72 hours' WHERE email=$1", [email]);
  assert.equal(await confirmNewsletterSubscription(token), true);
  assert.equal(await confirmNewsletterSubscription(token), false);
  assert.equal(rateLimitedOnce, true);
  console.log("PASS: pending signup, hashed token, resend throttle, provider rate-limit retry, single-use confirmation.");

  const auth = { authorization: `Bearer ${process.env.CRON_SECRET}` };
  assert.equal((await cron(new Request("https://example.invalid/api/cron/newsletter"))).status, 401);
  process.env.NEWSLETTER_ENABLED = "false";
  assert.deepEqual(await (await cron(new Request("https://example.invalid/api/cron/newsletter", { headers: auth }))).json(), { status: "disabled" });
  process.env.NEWSLETTER_ENABLED = "true";
  await sql.transaction((tx) => videoIds.map((id, index) => tx.query(`INSERT INTO videos(id,slug,title,description,youtube_url,youtube_id,status,published_at)
    VALUES($1,$2,'Synthetic newsletter probe','Removed after verification','https://www.youtube.com/watch?v=abcdefghijk','abcdefghijk',$3,$4)`,
    [id, `${prefix}-${index}`, index === 2 ? "draft" : "published", index === 0 ? "2090-01-08T18:00:00Z" : "2090-01-01T18:00:00Z"])));
  const items = await listDigestItems(new Date("2090-01-01T18:00:00Z"), new Date(periodEnds[0]));
  assert.deepEqual(items.map((item) => item.id), [videoIds[0]]);
  const concurrent = await Promise.all([deliverWeeklyDigest(new Date(periodEnds[0])), deliverWeeklyDigest(new Date(periodEnds[0]))]);
  assert.ok(concurrent.some((result) => result.status === "sent"));
  assert.ok(concurrent.some((result) => result.status === "already_processed"));
  assert.equal(providerCalls.filter((call) => call.endsWith("/send")).length, 1);
  assert.equal((await deliverWeeklyDigest(new Date(periodEnds[0]))).status, "already_processed");
  assert.equal((await deliverWeeklyDigest(new Date(periodEnds[1]))).status, "skipped");
  console.log("PASS: cron authentication/disabled state, exact publication boundaries, draft exclusion, concurrent and repeated execution, empty week.");

  await sql.query("UPDATE videos SET published_at='2090-01-20T12:00:00Z' WHERE id=$1", [videoIds[0]]);
  loseSendResponse = true;
  await assert.rejects(deliverWeeklyDigest(new Date(periodEnds[2])));
  loseSendResponse = false;
  assert.equal((await deliverWeeklyDigest(new Date(periodEnds[2]))).status, "sent");
  assert.equal(providerCalls.filter((call) => call.endsWith("/send")).length, 2);
  console.log("PASS: lost send response reconciles provider state without a duplicate send.");

  assert.equal((await signedEvent(true, "2090-01-23T12:00:00Z", false)).status, 400);
  assert.equal((await signedEvent(true, "2000-01-01T12:00:00Z")).status, 200);
  assert.equal((await sql.query("SELECT status FROM newsletter_subscribers WHERE email=$1", [email]))[0].status, "subscribed");
  assert.equal((await signedEvent(true, "2090-01-23T12:00:00Z")).status, 200);
  assert.equal((await signedEvent(false, "2090-01-24T12:00:00Z")).status, 200);
  assert.equal((await sql.query("SELECT status FROM newsletter_subscribers WHERE email=$1", [email]))[0].status, "unsubscribed");
  console.log("PASS: real signature verification rejects forged events; stale opt-outs are ignored; opt-ins cannot reactivate subscriptions.");
} finally {
  globalThis.fetch = actualFetch;
  await sql.transaction((tx) => [
    tx.query("DELETE FROM newsletter_subscribers WHERE email=$1", [email]),
    tx.query("DELETE FROM videos WHERE id=ANY($1::uuid[])", [videoIds]),
    tx.query("DELETE FROM newsletter_digest_runs WHERE period_end=ANY($1::timestamptz[])", [periodEnds]),
    tx.query("DELETE FROM newsletter_request_limits WHERE bucket=$1 OR bucket LIKE $2", ["day:2090-01-02", `ip:${createHash("sha256").update(`${process.env.CRON_SECRET}:${prefix}`).digest("hex")}%`]),
  ]);
  console.log("Synthetic records and test rate-limit buckets removed.");
}
