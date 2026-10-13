import assert from "node:assert/strict";
import test from "node:test";
import { digestPeriod, isConfirmationToken, orderDigestItems, providerDeliveryState, renderDigest, UNSUBSCRIBE_PLACEHOLDER, type DigestItem } from "./newsletter-delivery-core.ts";

test("weekly cutoff is stable before/at/after Sunday evening", () => {
  assert.equal(digestPeriod(new Date("2026-10-18T17:59:59Z")).end.toISOString(), "2026-10-11T18:00:00.000Z");
  const period = digestPeriod(new Date("2026-10-18T18:00:00Z"));
  assert.equal(period.end.toISOString(), "2026-10-18T18:00:00.000Z");
  assert.equal(period.start.toISOString(), "2026-10-11T18:00:00.000Z");
  assert.deepEqual(digestPeriod(new Date("2026-10-19T08:00:00Z")), period);
});
test("DST transition keeps UTC schedule and seven-day window", () => {
  const period = digestPeriod(new Date("2026-10-25T18:50:00Z"));
  assert.equal(period.end.getTime() - period.start.getTime(), 7 * 86400000);
  assert.equal(period.end.toISOString(), "2026-10-25T18:00:00.000Z");
});
test("only full-length random confirmation tokens are accepted", () => {
  assert.equal(isConfirmationToken("a".repeat(64)), true);
  for (const token of [undefined, "", "a".repeat(63), "a".repeat(65), "G".repeat(64), "<script>"]) assert.equal(isConfirmationToken(token), false);
});
test("digest escapes editorial text and safely encodes chapter URLs", () => {
  const item: DigestItem = { id: "1", kind: "study", slug: 'evil"/path', title: '<script>alert("x")</script>', summary: "A & B", seriesTitle: "Sorozat <1>", position: 3, publishedAt: "2026-10-13T12:00:00Z" };
  const email = renderDigest([item], new Date("2026-10-18T18:00:00Z"));
  assert.equal(email.html.includes("<script>"), false);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /evil%22%2Fpath/);
  assert.match(email.html, /Sorozat &lt;1&gt; · 3. rész/);
  assert.ok(email.html.includes(UNSUBSCRIBE_PLACEHOLDER));
  assert.ok(email.text.includes(UNSUBSCRIBE_PLACEHOLDER));
  assert.match(email.text, /3. rész/);
});
test("a queued/sent broadcast is never resent and uncertain requests require review", () => {
  assert.equal(providerDeliveryState("queued", "sending"), "sent");
  assert.equal(providerDeliveryState("sent", "draft"), "sent");
  assert.equal(providerDeliveryState("draft", "sending"), "review");
  assert.equal(providerDeliveryState("draft", "review"), "review");
  assert.equal(providerDeliveryState("draft", "draft"), "draft");
  assert.equal(providerDeliveryState("failed", "sending"), "review");
  assert.equal(providerDeliveryState("canceled", "sending"), "review");
});

test("new chapters remain together in series order despite publication order", () => {
  const base: DigestItem = { id: "3", kind: "study", slug: "chapter", title: "Chapter", summary: "", publishedAt: "2026-10-13T12:00:00Z", seriesId: "series", seriesTitle: "Series", position: 3 };
  const items = [base, { ...base, id: "video", kind: "video" as const, seriesId: undefined, publishedAt: "2026-10-14T12:00:00Z" }, { ...base, id: "1", position: 1, publishedAt: "2026-10-15T12:00:00Z" }];
  assert.deepEqual(orderDigestItems(items).map((item) => item.id), ["1", "3", "video"]);
  assert.equal(items[0].id, "3");
});
