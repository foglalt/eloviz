import assert from "node:assert/strict";
import test from "node:test";
import { attachTextSpoilers, extractPdfUnderlines } from "./pdf-text-underline.ts";

const ops = { save: 1, restore: 2, transform: 3, setLineWidth: 4, constructPath: 5, stroke: 6, fill: 7 };
const item = { text: "piros", width: 30, height: 12, transform: [12, 0, 0, 12, 20, 100], boldRanges: [{ start: 0, end: 5 }] };
test("matches transformed thin painted strokes/rectangles and restores graphics state", () => {
  const lines = extractPdfUnderlines({ fnArray: [1, 3, 4, 5, 2, 5, 5], argsArray: [[], [1, 0, 0, 1, 20, 0], [.5], [6, [], new Float32Array([0, 98, 30, 98])], [], [7, [], [20, 97.5, 50, 98]], [7, [], [20, 90, 50, 96]]] }, ops);
  assert.equal(lines.length, 2);
  assert.deepEqual(attachTextSpoilers([item], lines)[0].spoilerRanges, [{ start: 0, end: 5 }]);
  assert.equal(attachTextSpoilers([{ ...item, boldRanges: [] }], lines)[0].spoilerRanges, undefined);
});
test("underline annotations work but strikethrough, remote rules and rotated text do not", () => {
  const lines = extractPdfUnderlines({ fnArray: [], argsArray: [] }, ops, [
    { subtype: "Underline", quadPoints: new Float32Array([20, 110, 50, 110, 20, 98, 50, 98]) },
    { subtype: "StrikeOut", rect: [20, 98, 50, 110] },
  ]);
  assert.equal(lines.length, 1);
  assert.ok(attachTextSpoilers([item], lines)[0].spoilerRanges);
  for (const y of [105, 90]) assert.equal(attachTextSpoilers([item], [{ left: 20, right: 50, bottom: y, top: y + .5 }])[0].spoilerRanges, undefined);
  assert.equal(attachTextSpoilers([{ ...item, transform: [0, 12, -12, 0, 20, 100] }], lines)[0].spoilerRanges, undefined);
});
