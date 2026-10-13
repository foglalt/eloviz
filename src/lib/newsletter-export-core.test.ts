import assert from "node:assert/strict";
import test from "node:test";
import { collectExportPages, reconcileNewsletterExport, type PortableSubscriber, type ExportContact } from "./newsletter-export-core.ts";

const subscriber: PortableSubscriber = { id: "1", email: "Reader@Example.invalid", status: "subscribed", consentedAt: "2026-10-01T12:00:00Z", confirmedAt: "2026-10-01T12:01:00Z", updatedAt: "2026-10-01T12:01:00Z" };
const contact: ExportContact = { id: "provider-1", email: "reader@example.invalid", unsubscribed: false };
const reconcile = (local = subscriber, provider = [contact], members = [contact]) => reconcileNewsletterExport([local], provider, members, [])[0];

test("eligible recipients preserve independently stored consent and confirmation evidence", () => {
  const result = reconcile();
  assert.equal(result.eligibility, "eligible");
  assert.equal(result.email, "reader@example.invalid");
  assert.equal(result.consentedAt, subscriber.consentedAt);
  assert.equal(result.confirmedAt, subscriber.confirmedAt);
  assert.deepEqual(result.reasons, []);
  assert.equal(subscriber.email, "Reader@Example.invalid");
});
test("local and provider opt-outs independently override any active state", () => {
  assert.equal(reconcile({ ...subscriber, status: "unsubscribed" }).eligibility, "blocked");
  assert.equal(reconcile(subscriber, [{ ...contact, unsubscribed: true }]).eligibility, "blocked");
  assert.equal(reconcile(subscriber, [contact], [{ ...contact, unsubscribed: true }]).eligibility, "blocked");
  assert.equal(reconcile({ ...subscriber, status: "pending" }, [{ ...contact, unsubscribed: true }]).eligibility, "blocked");
});
test("bounce, complaint and manual suppressions win and unrelated account addresses never appear", () => {
  for (const origin of ["bounce", "complaint", "manual"]) {
    const result = reconcileNewsletterExport([subscriber], [contact], [contact], [
      { id: "block", email: "READER@example.invalid", origin },
      { id: "other", email: "unrelated@example.invalid", origin },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].eligibility, "blocked");
    assert.deepEqual(result[0].reasons, [`suppression:${origin}`]);
  }
});
test("pending, unconfirmed and missing provider memberships are never eligible", () => {
  assert.equal(reconcile({ ...subscriber, status: "pending" }).eligibility, "pending");
  assert.equal(reconcile({ ...subscriber, confirmedAt: null }).eligibility, "review");
  assert.equal(reconcile(subscriber, [], []).eligibility, "review");
  assert.equal(reconcile(subscriber, [contact], []).eligibility, "review");
});
test("duplicate provider email conflict requires review and any opt-out remains blocked", () => {
  assert.equal(reconcile(subscriber, [contact, { ...contact, id: "second" }]).eligibility, "review");
  assert.equal(reconcile(subscriber, [contact, { ...contact, id: "second", unsubscribed: true }]).eligibility, "blocked");
  assert.throws(() => reconcileNewsletterExport([subscriber, { ...subscriber, id: "2" }], [contact], [contact], []), /Duplicate local/);
});
test("full pagination works beyond 100 rows and preserves the final cursor", async () => {
  const requests: (string | undefined)[] = [];
  const first = Array.from({ length: 100 }, (_, index) => ({ id: String(index) }));
  const rows = await collectExportPages(async (after) => { requests.push(after); return after ? { data: [{ id: "100" }], has_more: false } : { data: first, has_more: true }; });
  assert.equal(rows.length, 101);
  assert.deepEqual(requests, [undefined, "99"]);
});
test("partial or unstable pages fail instead of returning an importable partial list", async () => {
  await assert.rejects(collectExportPages(async () => ({ data: [], has_more: true })), /Incomplete/);
  await assert.rejects(collectExportPages(async () => ({ data: [{ id: "same" }], has_more: true })), /pagination changed/);
  await assert.rejects(collectExportPages(async (after) => { if (after) throw new Error("Provider unavailable"); return { data: [{ id: "first" }], has_more: true }; }), /Provider unavailable/);
});
