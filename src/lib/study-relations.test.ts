import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalStudyRelationPair,
  relatedStudyId,
} from "./study-relations.ts";

const studyA = "11111111-1111-4111-8111-111111111111";
const studyB = "22222222-2222-4222-8222-222222222222";

test("canonicalizes a study relation identically from either direction", () => {
  const forward = canonicalStudyRelationPair(studyA, studyB);
  const reverse = canonicalStudyRelationPair(studyB, studyA);

  assert.deepEqual(forward, reverse);
  assert.deepEqual(forward, { studyAId: studyA, studyBId: studyB });
});

test("resolves the related study from both ends of a canonical pair", () => {
  const pair = canonicalStudyRelationPair(studyA, studyB);
  assert.ok(pair);
  assert.equal(relatedStudyId(pair, studyA), studyB);
  assert.equal(relatedStudyId(pair, studyB), studyA);
});

test("rejects self-relations and unrelated lookups", () => {
  assert.equal(canonicalStudyRelationPair(studyA, studyA), null);
  const pair = canonicalStudyRelationPair(studyA, studyB);
  assert.ok(pair);
  assert.equal(relatedStudyId(pair, "33333333-3333-4333-8333-333333333333"), null);
});
