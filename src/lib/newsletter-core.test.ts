import assert from "node:assert/strict";
import test from "node:test";
import { parseNewsletterSignup } from "./newsletter-core.ts";

test("normalizes a valid, consented email address", () => {
  assert.deepEqual(
    parseNewsletterSignup({ email: "  Olvaso@Example.COM ", consent: "on", website: "" }),
    { success: true, email: "olvaso@example.com" },
  );
});

test("uses locale-independent casing for email addresses", () => {
  assert.deepEqual(
    parseNewsletterSignup({ email: "INFO@EXAMPLE.COM", consent: "on", website: "" }),
    { success: true, email: "info@example.com" },
  );
});

test("rejects an invalid email address", () => {
  const result = parseNewsletterSignup({ email: "nem-email", consent: "on", website: "" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.reason, "invalid");
});

test("requires explicit consent", () => {
  const result = parseNewsletterSignup({ email: "olvaso@example.com", consent: null, website: "" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.reason, "consent");
});

test("rejects honeypot submissions", () => {
  const result = parseNewsletterSignup({ email: "olvaso@example.com", consent: "on", website: "robot" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.reason, "bot");
});
