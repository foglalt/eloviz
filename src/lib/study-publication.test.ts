import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveStudyDocumentRemoval,
  resolveStudyPublicationStatus,
} from "./study-publication.ts";

test("keeps a study published when it has a finalized PDF", () => {
  assert.deepEqual(resolveStudyPublicationStatus("published", true), {
    status: "published",
    downgraded: false,
  });
});

test("automatically keeps a study as draft without a finalized PDF", () => {
  assert.deepEqual(resolveStudyPublicationStatus("published", false), {
    status: "draft",
    downgraded: true,
  });
});

test("respects an explicitly selected draft status", () => {
  assert.deepEqual(resolveStudyPublicationStatus("draft", true), {
    status: "draft",
    downgraded: false,
  });
});

test("automatically drafts a published study when its current PDF is removed", () => {
  assert.deepEqual(resolveStudyDocumentRemoval("published", true), {
    status: "draft",
    downgraded: true,
  });
});

test("keeps the current status when an older PDF version is removed", () => {
  assert.deepEqual(resolveStudyDocumentRemoval("published", false), {
    status: "published",
    downgraded: false,
  });
});
