import assert from "node:assert/strict";
import test from "node:test";
import { isAutomatedAnalyticsUserAgent, normalizeAnalyticsPath } from "./analytics-core.ts";

test("accepts the public indexes and strips one trailing slash", () => {
  assert.equal(normalizeAnalyticsPath("/"), "/");
  assert.equal(normalizeAnalyticsPath("/temak/"), "/temak");
  assert.equal(normalizeAnalyticsPath("/tanulmanyok"), "/tanulmanyok");
  assert.equal(normalizeAnalyticsPath("/videok"), "/videok");
  assert.equal(normalizeAnalyticsPath("/kereses"), "/kereses");
});

test("accepts canonical content detail paths", () => {
  assert.equal(normalizeAnalyticsPath("/temak/a-biblia"), "/temak/a-biblia");
  assert.equal(normalizeAnalyticsPath("/tanulmanyok/jeremias-31"), "/tanulmanyok/jeremias-31");
  assert.equal(normalizeAnalyticsPath("/videok/attekintes-jeremias"), "/videok/attekintes-jeremias");
});

test("rejects private, API, nested, malformed, and query-bearing paths", () => {
  for (const path of [
    "/admin",
    "/api/analytics",
    "/temak/a/b",
    "/temak//a",
    "/temak/árvíztűrő",
    "/kereses?q=hit",
    "https://www.eloviz.hu/temak",
  ]) assert.equal(normalizeAnalyticsPath(path), null);
});

test("recognizes common automated user agents without rejecting browsers", () => {
  assert.equal(isAutomatedAnalyticsUserAgent("Mozilla/5.0 HeadlessChrome/136.0"), true);
  assert.equal(isAutomatedAnalyticsUserAgent("Googlebot/2.1"), true);
  assert.equal(isAutomatedAnalyticsUserAgent("Mozilla/5.0 Chrome/136.0 Safari/537.36"), false);
  assert.equal(isAutomatedAnalyticsUserAgent(null), false);
});
