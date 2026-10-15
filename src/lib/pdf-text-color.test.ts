import assert from "node:assert/strict";
import test from "node:test";
import { attachTextColors, extractTextColors } from "./pdf-text-color.ts";

const ops = { save: 1, restore: 2, setFillRGBColor: 3, showText: 4, paintFormXObjectBegin: 5, paintFormXObjectEnd: 6 };
const glyphs = (text: string) => Array.from(text, (unicode) => ({ unicode }));

test("restores color after nested form objects and preserves ligature/whitespace normalization", () => {
  const colors = extractTextColors({
    fnArray: [3, 4, 5, 3, 4, 6, 4],
    argsArray: [["#000000"], [glyphs("Black")], [], ["#ff0000"], [glyphs("ﬁrst")], [], [glyphs("Black")]],
  }, ops);
  const result = attachTextColors([{ str: "Black " }, { str: "first" }, { str: " Black" }], colors);
  assert.equal(result[0].boldRanges, undefined);
  assert.deepEqual(result[1].boldRanges, [{ start: 0, end: 5 }]);
  assert.equal(result[2].boldRanges, undefined);
});

test("does not guess emphasis offsets when the extracted glyph and text streams disagree", () => {
  const colors = extractTextColors({ fnArray: [3, 4], argsArray: [["#ff0000"], [glyphs("Red")]] }, ops);
  assert.deepEqual(attachTextColors([{ str: "Different" }], colors), [{ str: "Different", text: "Different" }]);
});

test("keeps emphasis aligned after decomposed accented characters", () => {
  const colors = extractTextColors({ fnArray: [3, 4, 3, 4], argsArray: [["#ff0000"], [glyphs("é")], ["#000000"], [glyphs(" normal")]] }, ops);
  const [value] = attachTextColors([{ str: "e\u0301 normal" }], colors);
  assert.deepEqual(value.boldRanges, [{ start: 0, end: 2 }]);
});
