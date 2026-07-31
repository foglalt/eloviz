import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { extractPdfPages } from "./pdf-extract-core.ts";
import { detectScriptureReferences } from "./scripture-references.ts";

test("extracts native PDF text with the production PDF.js runtime dependencies", async () => {
  const fixture = path.join(
    process.cwd(),
    "public",
    "studies",
    "hogy-el-ne-fogyatkozzon-a-te-hited.pdf",
  );
  const pages = await extractPdfPages(await readFile(fixture));
  const references = detectScriptureReferences(pages);

  assert.equal(pages.length, 1);
  assert.ok(pages[0].length > 40);
  assert.deepEqual(
    references.map((reference) => [reference.osisStart, reference.osisEnd]),
    [
      ["Luke.22.31", "Luke.22.34"],
      ["John.21.15", "John.21.17"],
      ["Heb.4.15", "Heb.4.16"],
      ["Rev.22.17", "Rev.22.17"],
    ],
  );
  assert.equal(typeof globalThis.DOMMatrix, "function");
  assert.equal(typeof globalThis.Path2D, "function");
  assert.equal(typeof globalThis.ImageData, "function");
  const runtime = globalThis as typeof globalThis & {
    pdfjsWorker?: { WorkerMessageHandler?: unknown };
  };
  assert.equal(typeof runtime.pdfjsWorker?.WorkerMessageHandler, "function");
});
