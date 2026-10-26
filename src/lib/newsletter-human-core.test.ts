import assert from "node:assert/strict";
import test from "node:test";
import { HUMAN_CHECK_MESSAGE, HUMAN_CHECK_UNAVAILABLE, isTurnstileConfigured, NEWSLETTER_TURNSTILE_ACTION, verifyNewsletterHuman } from "./newsletter-human-core.ts";

const configuration = { siteKey: "real-site-key", secretKey: "private-test-secret", production: true };
const accepted = { success: true, hostname: "www.eloviz.hu", action: NEWSLETTER_TURNSTILE_ACTION };
const reply = (body: unknown): typeof fetch => async () => Response.json(body);

test("human guard fails closed on missing configuration and rejects dummy production keys", async () => {
  let called = false;
  const request: typeof fetch = async () => { called = true; return Response.json(accepted); };
  for (const config of [{ production: true }, { ...configuration, siteKey: "" }, { ...configuration, secretKey: "" }, { ...configuration, siteKey: "1x00000000000000000000AA" }, { ...configuration, secretKey: "1x0000000000000000000000000000000AA" }]) {
    assert.deepEqual(await verifyNewsletterHuman("token", config, request), { success: false, message: HUMAN_CHECK_UNAVAILABLE });
  }
  assert.equal(called, false);
  assert.equal(isTurnstileConfigured({ siteKey: "1x00000000000000000000AA", secretKey: "1x0000000000000000000000000000000AA", production: false }), true);
});

test("missing, malformed and oversized tokens never call Cloudflare", async () => {
  let called = false;
  for (const token of [undefined, null, "", "   ", 123, new Blob(["token"]), "x".repeat(2049)]) {
    assert.deepEqual(await verifyNewsletterHuman(token, configuration, async () => { called = true; return Response.json(accepted); }), { success: false, message: HUMAN_CHECK_MESSAGE });
  }
  assert.equal(called, false);
});

test("validates a token server-side without sending email or subscriber data", async () => {
  let calls = 0;
  const result = await verifyNewsletterHuman("one-use-token", configuration, async (url, options) => {
    calls++;
    assert.equal(url, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    assert.equal(options?.method, "POST");
    assert.equal(options?.cache, "no-store");
    assert.ok(options?.signal instanceof AbortSignal);
    assert.deepEqual(Array.from((options?.body as URLSearchParams).entries()), [["secret", configuration.secretKey], ["response", "one-use-token"]]);
    return Response.json(accepted);
  });
  assert.deepEqual(result, { success: true });
  assert.equal(calls, 1);
});

test("requires the exact verified hostname and newsletter action", async () => {
  for (const value of [null, [], {}, { ...accepted, success: "true" }, { ...accepted, hostname: "www.eloviz.hu.evil.test" }, { ...accepted, hostname: "evil.test" }, { ...accepted, hostname: "localhost" }, { ...accepted, action: "login" }, { ...accepted, action: undefined }]) {
    assert.equal((await verifyNewsletterHuman("token", configuration, reply(value))).success, false);
  }
  assert.deepEqual(await verifyNewsletterHuman("token", configuration, reply({ ...accepted, hostname: "eloviz.hu" })), { success: true });
  assert.deepEqual(await verifyNewsletterHuman("token", { ...configuration, production: false }, reply({ ...accepted, hostname: "localhost" })), { success: true });
});

test("expired, duplicate and invalid tokens fail without retries or caching success", async () => {
  for (const code of ["timeout-or-duplicate", "invalid-input-response", "missing-input-secret"]) {
    let calls = 0;
    const verify: typeof fetch = async () => { calls++; return Response.json({ success: false, "error-codes": [code] }); };
    assert.equal((await verifyNewsletterHuman("token", configuration, verify)).success, false);
    assert.equal(calls, 1);
  }
  let calls = 0;
  const verify: typeof fetch = async () => Response.json(++calls === 1 ? accepted : { success: false, "error-codes": ["timeout-or-duplicate"] });
  assert.equal((await verifyNewsletterHuman("same-token", configuration, verify)).success, true);
  assert.equal((await verifyNewsletterHuman("same-token", configuration, verify)).success, false);
});

test("provider outage, timeout and malformed JSON fail closed with a useful message", async () => {
  for (const verify of [async () => { throw new Error("timeout"); }, async () => new Response("outage", { status: 503 }), async () => new Response("not JSON")]) {
    assert.deepEqual(await verifyNewsletterHuman("token", configuration, verify), { success: false, message: HUMAN_CHECK_UNAVAILABLE });
  }
});
