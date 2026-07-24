import assert from "node:assert/strict";
import test from "node:test";
import { searchBundledCatalog } from "./catalog-search.ts";
import type { StudySummary, TopicSummary } from "./content-types.ts";
import { topicInputSchema } from "./content-validation.ts";
import {
  attachOtherTopicToUnassignedStudies,
  includeOtherTopic,
  OTHER_TOPIC_SLUG,
} from "./other-topic.ts";

const explicitTopic: TopicSummary = {
  id: "topic-1",
  slug: "hit",
  title: "Hit",
  description: "A hit bibliai összefüggéseit bemutató témakör.",
  featured: false,
  sortOrder: 10,
};

function study(id: string, topics: TopicSummary[]): StudySummary {
  return {
    id,
    slug: id,
    title: `Tanulmány ${id}`,
    summary: "A teszthez használt, kellően hosszú tanulmány-összefoglaló.",
    featured: false,
    sortOrder: 10,
    status: "published",
    pdfUrl: `/api/documents/${id}`,
    topics,
    references: [],
  };
}

test("assigns Egyéb only to studies without a public topic", () => {
  const unassigned = study("unassigned", []);
  const assigned = study("assigned", [explicitTopic]);
  const result = attachOtherTopicToUnassignedStudies([unassigned, assigned]);

  assert.equal(result[0].topics[0].slug, OTHER_TOPIC_SLUG);
  assert.strictEqual(result[1], assigned);
});

test("always includes Egyéb with the unassigned study count", () => {
  const result = includeOtherTopic([explicitTopic], 3);
  const other = result.find((topic) => topic.slug === OTHER_TOPIC_SLUG);

  assert.equal(result.at(-1)?.slug, OTHER_TOPIC_SLUG);
  assert.equal(other?.studyCount, 3);
  assert.equal(other?.videoCount, 0);
});

test("merges the fallback count if an Egyéb topic already exists", () => {
  const existing = {
    ...explicitTopic,
    id: "topic-other",
    slug: OTHER_TOPIC_SLUG,
    title: "Egyéb",
    studyCount: 2,
  };
  const result = includeOtherTopic([existing], 3);

  assert.equal(result.length, 1);
  assert.equal(result[0].studyCount, 5);
});

test("makes Egyéb and its unassigned studies centrally searchable", () => {
  const studies = attachOtherTopicToUnassignedStudies([study("unassigned", [])]);
  const topics = includeOtherTopic([], 1);
  const result = searchBundledCatalog("egyeb", topics, studies, []);

  assert.equal(result.topics[0]?.slug, OTHER_TOPIC_SLUG);
  assert.equal(result.studies[0]?.slug, "unassigned");
  assert.equal(result.studies[0]?.meta, "Egyéb");
});

test("reserves the automatic Egyéb slug from manually created topics", () => {
  const result = topicInputSchema.safeParse({
    title: "Egyéb",
    slug: OTHER_TOPIC_SLUG,
    description: "A rendszer által fenntartott automatikus témakör leírása.",
    status: "published",
    featured: false,
    sortOrder: 100,
  });

  assert.equal(result.success, false);
});
