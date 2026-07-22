import assert from "node:assert/strict";
import test from "node:test";
import { detectScriptureReferences, parseOsisReferenceLine } from "./scripture-references.ts";

test("detects Hungarian references and ranges", () => {
  const references = detectScriptureReferences([
    "Olvassuk el: 2Mózes 12:1-28. A beteljesedéshez lásd 1Kor 5:7-8 és János 3,16.",
  ]);

  assert.deepEqual(
    references.map((reference) => [reference.osisStart, reference.osisEnd]),
    [["Exod.12.1", "Exod.12.28"], ["1Cor.5.7", "1Cor.5.8"], ["John.3.16", "John.3.16"]],
  );
});

test("deduplicates repeated references across pages", () => {
  const references = detectScriptureReferences(["Zsidók 4:15-16", "Zsid 4:15-16"]);
  assert.equal(references.length, 1);
  assert.equal(references[0].pageNumber, 1);
});

test("parses reviewed OSIS lines", () => {
  assert.deepEqual(parseOsisReferenceLine("János 3:16-18 | John.3.16-John.3.18"), {
    displayLabel: "János 3:16-18",
    bookCode: "John",
    startChapter: 3,
    startVerse: 16,
    endChapter: 3,
    endVerse: 18,
    osisStart: "John.3.16",
    osisEnd: "John.3.18",
  });
});
