import assert from "node:assert/strict";
import test from "node:test";
import {
  detectScriptureReferences,
  formatHungarianReference,
  formatOsisReference,
} from "./scripture-references.ts";

test("detects Hungarian references and ranges", () => {
  const references = detectScriptureReferences([
    "Olvassuk el: 2Mózes 12:1-28. A beteljesedéshez lásd 1Kor 5:7-8 és János 3,16.",
  ]);

  assert.deepEqual(
    references.map((reference) => [
      reference.displayLabel,
      reference.osisStart,
      reference.osisEnd,
    ]),
    [
      ["2Móz 12:1-28", "Exod.12.1", "Exod.12.28"],
      ["1Kor 5:7-8", "1Cor.5.7", "1Cor.5.8"],
      ["Jn 3:16", "John.3.16", "John.3.16"],
    ],
  );
});

test("deduplicates aliases and always uses the canonical Hungarian label", () => {
  const references = detectScriptureReferences(["Zsidók 5:8", "Zsid. 5,8", "Zsid 5:8"]);
  assert.equal(references.length, 1);
  assert.equal(references[0].pageNumber, 1);
  assert.equal(references[0].displayLabel, "Zsid 5:8");
  assert.equal(references[0].osisStart, "Heb.5.8");
});

test("formats single verses and ranges from OSIS data", () => {
  assert.equal(formatOsisReference("Heb.5.8"), "Zsid 5:8");
  assert.equal(formatOsisReference("John.3.16", "John.3.18"), "Jn 3:16-18");
  assert.equal(formatOsisReference("John.3.16", "John.4.2"), "Jn 3:16-4:2");
  assert.equal(formatHungarianReference("Phlm", 1, 4), "Filem 1:4");
  assert.equal(formatOsisReference("Heb.5.8", "John.3.16"), null);
  assert.equal(formatOsisReference("Unknown.1.1"), null);
});

test("recognizes books across the full canon", () => {
  const references = detectScriptureReferences([
    "1Krónikák 12:3; Jeremiás siralmai 2:1; Filemon 1:4; Júdás 1:2.",
  ]);
  assert.deepEqual(
    references.map((reference) => reference.displayLabel),
    ["1Krón 12:3", "JSir 2:1", "Filem 1:4", "Júd 1:2"],
  );
});
