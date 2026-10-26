import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { extractPdfDocument, extractPdfPages } from "./pdf-extract-core.ts";
import { detectScriptureReferences } from "./scripture-references.ts";
import { createBoldFixturePdf, createColorFixturePdf, createSpoilerFixturePdf } from "./fixtures/pdf-color-fixture.ts";
import { parseStudyArticle } from "./study-article.ts";

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

test("derives a semantic HTML article from PDF layout without repeating its title", async () => {
  const fixture = path.join(process.cwd(), "public", "studies", "a-paszka-tipologiaja.pdf");
  const extraction = await extractPdfDocument(await readFile(fixture), "A páska tipológiája");

  assert.ok(extraction.article.blocks.length >= 6);
  assert.equal(
    extraction.article.blocks.some((block) => "text" in block && block.text === "A páska tipológiája"),
    false,
  );
  assert.ok(extraction.article.blocks.some((block) => block.type === "heading"));
  assert.ok(extraction.article.blocks.some((block) => block.type === "paragraph"));
});

test("converts only red painted PDF text into stored bold ranges", async () => {
  const { article, pages } = await extractPdfDocument(createColorFixturePdf());
  assert.deepEqual(parseStudyArticle(JSON.stringify(article)), article);
  const emphasized = article.blocks.flatMap((block) => block.type === "list"
    ? block.items.flatMap((text, index) => (block.itemBoldRanges?.[index] ?? []).map((range) => text.slice(range.start, range.end)))
    : (block.boldRanges ?? []).map((range) => block.text.slice(range.start, range.end)));
  assert.deepEqual(emphasized, ["piros", "Bordo", "szoveg.", "kiemeles", "CMYK", "piros.", "Piros", "kontur.", "János", "3:16", "piros", "elvalasztas"]);
  assert.ok(article.blocks.some((block) => block.type === "list" && block.items.includes("Lista piros resze.")));
  assert.ok(article.blocks.some((block) => "text" in block && block.text.includes("Normal piros normal.")));
  assert.ok(pages[0].includes("Normal kiemeles ismet normal."));
});

test("preserves native bold PDF runs alongside red text, lists, wrapped words and Bible references", async () => {
  const { article, pages } = await extractPdfDocument(createBoldFixturePdf());
  assert.deepEqual(parseStudyArticle(JSON.stringify(article)), article);
  const emphasized = article.blocks.flatMap((block) => block.type === "list"
    ? block.items.flatMap((text, index) => (block.itemBoldRanges?.[index] ?? []).map((range) => text.slice(range.start, range.end)))
    : (block.boldRanges ?? []).map((range) => block.text.slice(range.start, range.end)));
  assert.deepEqual(emphasized, ["bold", "Bold italic.", "red", "and bold", "bold", "János 3:16", "wrapped"]);
  assert.ok(pages[0].includes("Italic stays normal."));
  assert.ok(pages[0].includes("Different family stays normal."));
  assert.deepEqual(detectScriptureReferences(pages).map((ref) => ref.osisStart), ["John.3.16"]);
});

test("hides only intersecting red and underlined PDF words, preserving lists and Bible references", async () => {
  const { article, pages } = await extractPdfDocument(createSpoilerFixturePdf());
  const hidden = article.blocks.flatMap((block) => block.type === "list"
    ? block.items.flatMap((text, index) => (block.itemSpoilerRanges?.[index] ?? []).map((range) => text.slice(range.start, range.end)))
    : (block.spoilerRanges ?? []).map((range) => block.text.slice(range.start, range.end)));
  assert.deepEqual(hidden, ["titkos valasz", "János 3:16", "titok", "titok"]);
  assert.ok(pages[0].includes("Részleges titok szoveg."));
  assert.deepEqual(parseStudyArticle(JSON.stringify(article)), article);
  assert.deepEqual(detectScriptureReferences(pages).map((r) => r.osisStart), ["John.3.16"]);
});
