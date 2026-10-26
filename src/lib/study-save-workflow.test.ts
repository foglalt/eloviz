import assert from "node:assert/strict";
import test from "node:test";
import { persistWithOptionalPdf } from "./study-save-workflow.ts";
import { MAX_PDF_BYTES, pdfFileIssue } from "./pdf-file-policy.ts";

function harness(failure?: "store" | "commit" | "cleanup") {
  const events: string[] = [];
  const storageFailure = new Error("storage unavailable");
  const databaseFailure = new Error("transaction rolled back");
  const stored = { key: "private/new-study.pdf" };
  return { events, stored, storageFailure, databaseFailure, dependencies: {
    store: async (pdf: string) => { assert.equal(pdf, "pdf"); events.push("store"); if (failure === "store") throw storageFailure; return stored; },
    commit: async (pdf: typeof stored | null) => { events.push(pdf ? "commit-pdf" : "commit-draft"); if (failure === "commit" || failure === "cleanup") throw databaseFailure; return "saved"; },
    remove: async (pdf: typeof stored) => { assert.equal(pdf, stored); events.push("cleanup"); if (failure === "cleanup") throw new Error("cleanup unavailable"); },
    onCleanupError: () => { events.push("report-cleanup"); },
  } };
}

test("draft-only save never uploads or removes a PDF", async () => {
  const h = harness();
  assert.equal(await persistWithOptionalPdf(null, h.dependencies), "saved");
  assert.deepEqual(h.events, ["commit-draft"]);
});

test("successful creation stores before committing and retains the document", async () => {
  const h = harness();
  assert.equal(await persistWithOptionalPdf("pdf", h.dependencies), "saved");
  assert.deepEqual(h.events, ["store", "commit-pdf"]);
});

test("failed transaction removes only its unused upload", async () => {
  const h = harness("commit");
  await assert.rejects(persistWithOptionalPdf("pdf", h.dependencies), (error) => error === h.databaseFailure);
  assert.deepEqual(h.events, ["store", "commit-pdf", "cleanup"]);
});

test("storage failure creates no database record", async () => {
  const h = harness("store");
  await assert.rejects(persistWithOptionalPdf("pdf", h.dependencies), (error) => error === h.storageFailure);
  assert.deepEqual(h.events, ["store"]);
});

test("cleanup failure is reported without hiding the original transaction error", async () => {
  const h = harness("cleanup");
  await assert.rejects(persistWithOptionalPdf("pdf", h.dependencies), (error) => error === h.databaseFailure);
  assert.deepEqual(h.events, ["store", "commit-pdf", "cleanup", "report-cleanup"]);
});

test("optional PDF policy accepts no selection and enforces empty/12 MB boundaries", () => {
  assert.equal(pdfFileIssue(undefined), "");
  assert.ok(pdfFileIssue({ size: 0 }));
  assert.equal(pdfFileIssue({ size: MAX_PDF_BYTES }), "");
  assert.ok(pdfFileIssue({ size: MAX_PDF_BYTES + 1 }));
});
