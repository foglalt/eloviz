import assert from "node:assert/strict";
import test from "node:test";
import { parseBiblePassageRequest } from "./bible-passage-core.ts";
import { detectScriptureReferences, findScriptureReferenceMentions } from "./scripture-references.ts";

test("reader mentions retain repeated references and precise Unicode offsets", () => {
  const text = "💧 Először Jn 3:16, később ismét Jn 3:16.";
  const mentions = findScriptureReferenceMentions(text);
  assert.deepEqual(mentions.map((item) => text.slice(item.start, item.end)), ["Jn 3:16", "Jn 3:16"]);
  assert.deepEqual(mentions.map((item) => item.osisStart), ["John.3.16", "John.3.16"]);
  assert.equal(detectScriptureReferences([text]).length, 1);
});

test("inherited verse lists have separate non-overlapping clickable fragments", () => {
  const text = "1 Mózes 2:23; 3:7, 21 és Jelenések 3:18; 7:14; 16:15";
  const mentions = findScriptureReferenceMentions(text);
  assert.deepEqual(mentions.map((item) => text.slice(item.start, item.end)), ["1 Mózes 2:23", "3:7", "21", "Jelenések 3:18", "7:14", "16:15"]);
  assert.deepEqual(mentions.map((item) => item.osisStart), ["Gen.2.23", "Gen.3.7", "Gen.3.21", "Rev.3.18", "Rev.7.14", "Rev.16.15"]);
  assert.ok(mentions.every((item, index) => !index || item.start >= mentions[index - 1].end));
});

test("reader handles single-chapter notation, parenthesized names and cross-chapter text", () => {
  const mentions = findScriptureReferenceMentions("Júdás 14-15; Teremtés (1 Mózes) 28:12-15; Mt 26:30-27:10");
  assert.deepEqual(mentions.map(({ osisStart, osisEnd }) => [osisStart, osisEnd]), [
    ["Jude.1.14", "Jude.1.15"], ["Gen.28.12", "Gen.28.15"], ["Matt.26.30", "Matt.27.10"],
  ]);
});

test("lookup supports an arbitrary compact verse, cross-chapter range and whole chapter", () => {
  assert.equal(parseBiblePassageRequest(new URLSearchParams({ q: "Jn3:16" }))?.osisStart, "John.3.16");
  const chapter = parseBiblePassageRequest(new URLSearchParams({ q: "János 3" }));
  assert.equal(chapter?.wholeChapter, true);
  assert.equal(chapter?.osisStart, "John.3.1");
  assert.equal(parseBiblePassageRequest(new URLSearchParams({ q: "Mt 26:30-27:10" }))?.osisEnd, "Matt.27.10");
});

test("passage requests reject cross-book, reverse, excessive or malformed intervals", () => {
  const invalidRequests: Record<string, string>[] = [
    { start: "John.3.16", end: "Rev.3.17" }, { start: "John.3.20", end: "John.3.10" },
    { start: "John.1.1", end: "John.11.1" }, { start: "John.03.16" },
    { start: "Unknown.1.1" }, { start: "John.3.201" }, { start: "John.3.16';DROP TABLE verses;" },
    { q: "Jn 1:1-11:1" }, { q: "Jn 3:16" + " ".repeat(100) }, { q: "" },
  ];
  for (const params of invalidRequests) assert.equal(parseBiblePassageRequest(new URLSearchParams(params)), null, JSON.stringify(params));
  assert.equal(parseBiblePassageRequest(new URLSearchParams({ start: "John.1.1", end: "John.10.1" }))?.endChapter, 10);
});
