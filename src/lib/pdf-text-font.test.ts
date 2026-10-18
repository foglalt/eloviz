import assert from "node:assert/strict";
import test from "node:test";
import { attachTextFontWeight, isBoldPdfFont } from "./pdf-text-font.ts";

test("recognizes PDF bold weight metadata and embedded bold face names", () => {
  for (const font of [{ bold: true }, { black: true }, { cssFontInfo: { fontWeight: "700" } },
    { cssFontInfo: { fontWeight: 600 } }, { cssFontInfo: { fontWeight: "bold" } },
    { name: "ABCDEF+Georgia-Bold" }, { name: "Arial-BoldMT" }, { name: "Times-BoldItalic" },
    { name: "Calibri-SemiBold" }, { name: "Arial-Black" }, { name: "Example-Heavy" }]) assert.equal(isBoldPdfFont(font), true, JSON.stringify(font));
  for (const font of [undefined, {}, { name: "Helvetica" }, { name: "Helvetica-Oblique" },
    { name: "BlackadderITC" }, { cssFontInfo: { fontWeight: 400 } }]) {
    assert.equal(isBoldPdfFont(font), false, JSON.stringify(font));
  }
});

test("combines native font weight with red emphasis without mutating source items", () => {
  const items = [
    { text: "Normal piros", fontName: "regular", boldRanges: [{ start: 7, end: 12 }] },
    { text: "Félkövér", fontName: "bold" },
    { text: "Ismeretlen", fontName: "missing" },
  ];
  const before = structuredClone(items);
  const result = attachTextFontWeight(items, new Map([["regular", { name: "Helvetica" }], ["bold", { name: "ABCDEF+Helvetica-Bold" }]]));
  assert.deepEqual(result[0].boldRanges, [{ start: 7, end: 12 }]);
  assert.deepEqual(result[1].boldRanges, [{ start: 0, end: 8 }]);
  assert.equal(result[2].boldRanges, undefined);
  assert.deepEqual(items, before);
});
