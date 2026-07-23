import assert from "node:assert/strict";
import test from "node:test";
import {
  foldCatalogSearchText,
  normalizeCatalogSearchQuery,
  searchBundledCatalog,
} from "./catalog-search.ts";
import type { StudySummary, TopicSummary, VideoSummary } from "./content-types.ts";

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
  references: [],
};

const video: VideoSummary = {
  id: "video-1",
  slug: "attekintes-jeremias",
  title: "Áttekintés: Jeremiás",
  description: "A könyv felépítése és az új szövetség ígérete.",
  youtubeUrl: "https://www.youtube.com/watch?v=example",
  youtubeId: "example",
  channelName: "BibleProject",
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
