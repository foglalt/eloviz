import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogSearchKindsForPathname,
  foldCatalogSearchText,
  normalizeCatalogSearchKinds,
  normalizeCatalogSearchQuery,
  searchBundledCatalog,
} from "./catalog-search.ts";
import type { StudySummary, TopicSummary, VideoSummary } from "./content-types.ts";
import { parseScriptureReferenceQuery } from "./scripture-references.ts";

const topic: TopicSummary = {
  id: "topic-1",
  slug: "szovetseg-es-kozosseg",
  title: "Szövetség és közösség",
  description: "A páska és az új szövetség bibliai összefüggései.",
  featured: true,
  sortOrder: 10,
  studyCount: 1,
  videoCount: 1,
};

const study: StudySummary = {
  id: "study-1",
  slug: "a-paszka-tipologiaja",
  title: "A páska tipológiája",
  summary: "Az egyiptomi szabadítás története.",
  featured: true,
  sortOrder: 10,
  status: "published",
  pdfUrl: "/studies/a-paszka-tipologiaja.pdf",
  topics: [topic],
  references: [{
    label: "Jn 3:1-5",
    osisStart: "John.3.1",
    osisEnd: "John.3.5",
  }],
};

const video: VideoSummary = {
  id: "video-1",
  slug: "attekintes-jeremias",
  title: "Áttekintés: Jeremiás",
  description: "A könyv felépítése és az új szövetség ígérete.",
  youtubeUrl: "https://www.youtube.com/watch?v=example",
  youtubeId: "example",
  channelName: "BibleProject",
  speaker: "Kovács János",
  featured: true,
  sortOrder: 10,
  status: "published",
  topics: [topic],
};

test("normalizes whitespace and Hungarian accents for matching", () => {
  assert.equal(normalizeCatalogSearchQuery("  új   szövetség  "), "új szövetség");
  assert.equal(foldCatalogSearchText("Szentlélek és HÚSVÉT"), "szentlelek es husvet");
});

test("searches topics, finalized studies, and videos including their topic context", () => {
  const results = searchBundledCatalog(
    "szövetség",
    [topic],
    [study],
    [video],
  );

  assert.ok(results.topics.some((item) => item.slug === "szovetseg-es-kozosseg"));
  assert.ok(results.studies.some((item) => item.slug === "a-paszka-tipologiaja"));
  assert.ok(results.videos.some((item) => item.slug === "attekintes-jeremias"));
});

test("supports accent-free searches and ignores one-character queries", () => {
  const accentFree = searchBundledCatalog("paszka", [topic], [study], [video]);
  const tooShort = searchBundledCatalog("a", [topic], [study], [video]);

  assert.ok(accentFree.studies.some((item) => item.slug === "a-paszka-tipologiaja"));
  assert.equal(tooShort.total, 0);
});

test("finds videos by speaker", () => {
  const results = searchBundledCatalog("kovacs", [topic], [study], [video]);

  assert.ok(results.videos.some((item) => item.slug === "attekintes-jeremias"));
  assert.match(results.videos[0]?.meta ?? "", /Kovács János/);
  assert.doesNotMatch(results.videos[0]?.meta ?? "", /BibleProject/);
});

test("finds videos by channel without exposing the channel in result metadata", () => {
  const results = searchBundledCatalog("bibleproject", [topic], [study], [video]);

  assert.ok(results.videos.some((item) => item.slug === "attekintes-jeremias"));
  assert.equal(results.videos[0]?.meta, "Kovács János");
});

test("normalizes one or more content-type filters in canonical order", () => {
  assert.deepEqual(normalizeCatalogSearchKinds(undefined), ["topic", "study", "video"]);
  assert.deepEqual(normalizeCatalogSearchKinds("video"), ["video"]);
  assert.deepEqual(
    normalizeCatalogSearchKinds(["video", "study", "video", "unknown"]),
    ["study", "video"],
  );
  assert.deepEqual(normalizeCatalogSearchKinds(["unknown"]), ["topic", "study", "video"]);
});

test("derives compact search filters from catalogue routes", () => {
  assert.deepEqual(catalogSearchKindsForPathname("/temak"), ["topic"]);
  assert.deepEqual(catalogSearchKindsForPathname("/temak/szovetseg"), ["topic"]);
  assert.deepEqual(catalogSearchKindsForPathname("/tanulmanyok"), ["study"]);
  assert.deepEqual(catalogSearchKindsForPathname("/tanulmanyok/a-paszka"), ["study"]);
  assert.deepEqual(catalogSearchKindsForPathname("/videok"), ["video"]);
  assert.deepEqual(catalogSearchKindsForPathname("/videok/jeremias"), ["video"]);
  assert.deepEqual(catalogSearchKindsForPathname("/"), ["topic", "study", "video"]);
  assert.deepEqual(catalogSearchKindsForPathname("/kereses"), ["topic", "study", "video"]);
});

test("searches only the selected content types", () => {
  const results = searchBundledCatalog(
    "szövetség",
    [topic],
    [study],
    [video],
    ["study", "video"],
  );

  assert.equal(results.topics.length, 0);
  assert.ok(results.studies.length > 0);
  assert.ok(results.videos.length > 0);
  assert.equal(results.total, results.studies.length + results.videos.length);
});

test("filters studies by overlapping Scripture ranges without requiring text", () => {
  const overlapping = parseScriptureReferenceQuery("Jn 3:4-8");
  const separate = parseScriptureReferenceQuery("Jn 3:6-8");
  assert.ok(overlapping);
  assert.ok(separate);

  const matching = searchBundledCatalog(
    "",
    [topic],
    [study],
    [video],
    ["topic", "study", "video"],
    overlapping,
  );
  const notMatching = searchBundledCatalog(
    "",
    [topic],
    [study],
    [video],
    ["study"],
    separate,
  );

  assert.deepEqual(matching.studies.map((item) => item.slug), ["a-paszka-tipologiaja"]);
  assert.equal(matching.topics.length, 0);
  assert.equal(matching.videos.length, 0);
  assert.equal(notMatching.total, 0);
});

test("combines text and Scripture filters for study results", () => {
  const filter = parseScriptureReferenceQuery("Jn 3:2");
  assert.ok(filter);

  const matching = searchBundledCatalog(
    "paszka",
    [topic],
    [study],
    [video],
    ["study"],
    filter,
  );
  const textMismatch = searchBundledCatalog(
    "jeremias",
    [topic],
    [study],
    [video],
    ["study"],
    filter,
  );

  assert.equal(matching.studies.length, 1);
  assert.equal(textMismatch.studies.length, 0);
});
