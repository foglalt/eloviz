import assert from "node:assert/strict";
import test from "node:test";
import {
  detectScriptureReferences,
  formatHungarianReference,
  formatOsisReference,
  mergeScriptureReferenceRanges,
  normalizeScriptureReferenceQuery,
  parseScriptureReferenceQuery,
  scriptureReferenceRangesOverlap,
  sortScriptureReferencesInBibleOrder,
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

test("merges contained, overlapping, and adjacent ranges without losing candidates", () => {
  const candidates = detectScriptureReferences([
    "Jn 3:1-5; Jn 3:2-6; Jn 3:4; Jn 3:6-8; Jn 3:10-11; Róm 3:4-5.",
  ]);
  const references = mergeScriptureReferenceRanges(candidates);

  assert.equal(candidates.length, 6);
  assert.deepEqual(
    references.map((reference) => [
      reference.displayLabel,
      reference.osisStart,
      reference.osisEnd,
    ]),
    [
      ["Jn 3:1-8", "John.3.1", "John.3.8"],
      ["Jn 3:10-11", "John.3.10", "John.3.11"],
      ["Róm 3:4-5", "Rom.3.4", "Rom.3.5"],
    ],
  );
});

test("keeps first-occurrence order while merging ranges detected out of order", () => {
  const references = mergeScriptureReferenceRanges(detectScriptureReferences([
    "Róm 8:1; Jn 3:6-8; Zsid 5:8; Jn 3:1-5.",
  ]));

  assert.deepEqual(
    references.map((reference) => reference.displayLabel),
    ["Róm 8:1", "Jn 3:1-8", "Zsid 5:8"],
  );
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

test("sorts references by canonical book, chapter, and verse order", () => {
  const references = [
    { label: "Jel 22:17", osisStart: "Rev.22.17" },
    { label: "Jn 3:16", osisStart: "John.3.16" },
    { label: "1Móz 1:1", osisStart: "Gen.1.1" },
    { label: "Jn 3:1", osisStart: "John.3.1" },
    { label: "Zsolt 23:1", osisStart: "Ps.23.1" },
    { label: "Ismeretlen", osisStart: "Unknown.1.1" },
  ];

  assert.deepEqual(
    sortScriptureReferencesInBibleOrder(references).map((reference) => reference.label),
    ["1Móz 1:1", "Zsolt 23:1", "Jn 3:1", "Jn 3:16", "Jel 22:17", "Ismeretlen"],
  );
  assert.equal(references[0].label, "Jel 22:17");
});

test("parses canonical Scripture search intervals and Hungarian aliases", () => {
  assert.equal(normalizeScriptureReferenceQuery("  János   3:16-4:2  "), "János 3:16-4:2");
  assert.deepEqual(parseScriptureReferenceQuery("János 3:16-4:2"), {
    displayLabel: "Jn 3:16-4:2",
    bookCode: "John",
    startChapter: 3,
    startVerse: 16,
    endChapter: 4,
    endVerse: 2,
    osisStart: "John.3.16",
    osisEnd: "John.4.2",
  });
  assert.equal(parseScriptureReferenceQuery("Jn 3"), null);
  assert.equal(parseScriptureReferenceQuery("Jn 4:2-3:16"), null);
});

test("matches overlapping Scripture intervals without treating adjacency as overlap", () => {
  const stored = { osisStart: "John.3.1", osisEnd: "John.3.5" };

  assert.equal(scriptureReferenceRangesOverlap(stored, {
    osisStart: "John.3.4",
    osisEnd: "John.3.8",
  }), true);
  assert.equal(scriptureReferenceRangesOverlap(stored, {
    osisStart: "John.2.1",
    osisEnd: "John.4.1",
  }), true);
  assert.equal(scriptureReferenceRangesOverlap(stored, {
    osisStart: "John.3.6",
    osisEnd: "John.3.8",
  }), false);
  assert.equal(scriptureReferenceRangesOverlap(stored, {
    osisStart: "Rom.3.4",
    osisEnd: "Rom.3.8",
  }), false);
  assert.equal(scriptureReferenceRangesOverlap({
    osisStart: "Exod.1.22",
    osisEnd: "Exod.2.10",
  }, {
    osisStart: "Exod.2.5",
    osisEnd: "Exod.2.5",
  }), true);
});
