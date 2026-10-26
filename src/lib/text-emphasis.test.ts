import assert from "node:assert/strict";
import test from "node:test";
import { cleanEmphasizedText, concatEmphasizedText, sliceEmphasizedText } from "./text-emphasis.ts";
import { buildStudyArticle, parseStudyArticle } from "./study-article.ts";

test("spoiler and bold offsets survive cleanup/slicing and merge across inserted whitespace", () => {
  const value = { text: "  titok   valasz . ", spoilerRanges: [{ start: 2, end: 7 }, { start: 10, end: 16 }], boldRanges: [{ start: 2, end: 7 }] };
  const cleaned = cleanEmphasizedText(value);
  assert.equal(cleaned.text, "titok valasz.");
  assert.deepEqual(cleaned.spoilerRanges, [{ start: 0, end: 12 }]);
  assert.deepEqual(sliceEmphasizedText(cleaned, 6).spoilerRanges, [{ start: 0, end: 6 }]);
  assert.deepEqual(concatEmphasizedText({ text: "elso", spoilerRanges: [{ start: 0, end: 4 }] }, { text: " " }, { text: "masodik", spoilerRanges: [{ start: 0, end: 7 }] }).spoilerRanges, [{ start: 0, end: 12 }]);
});
test("wrapped/list answers retain exact ranges and legacy articles remain valid", () => {
  const line = { pageNumber: 1, pageHeight: 800, x: 50, fontSize: 12 };
  const article = buildStudyArticle([[{ ...line, y: 700, text: "- elva-", spoilerRanges: [{ start: 2, end: 7 }] },
    { ...line, y: 685, text: "lasztas", spoilerRanges: [{ start: 0, end: 7 }] }, { ...line, y: 650, text: "- Masodik." }]]);
  const list = article.blocks.find((b) => b.type === "list");
  assert.ok(list?.type === "list");
  assert.equal(list.items[0], "elvalasztas");
  assert.deepEqual(list.itemSpoilerRanges, [[{ start: 0, end: 11 }], []]);
  assert.deepEqual(parseStudyArticle(JSON.stringify(article)), article);
  assert.ok(parseStudyArticle({ version: "pdf-layout-v4", blocks: [{ type: "paragraph", text: "Regi szoveg." }] }));
});
test("rejects malformed, overlapping, out-of-bounds or mismatched spoiler arrays", () => {
  for (const ranges of [[{ start: -1, end: 2 }], [{ start: 0, end: 99 }], [{ start: 0, end: 3 }, { start: 2, end: 4 }]]) {
    assert.equal(parseStudyArticle({ version: "pdf-layout-v5", blocks: [{ type: "paragraph", text: "Titok", spoilerRanges: ranges }] }), null);
  }
  assert.equal(parseStudyArticle({ version: "pdf-layout-v5", blocks: [{ type: "list", ordered: false, items: ["Titok"], itemSpoilerRanges: [] }] }), null);
});
