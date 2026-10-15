import { withBoldFlags, type EmphasizedText } from "./text-emphasis.ts";

type OperatorList = { fnArray: number[]; argsArray: unknown[][] };
type PaintState = { fill: boolean; stroke: boolean; mode: number };

function isRed(color: unknown): boolean {
  if (typeof color !== "string" || !/^#[0-9a-f]{6}$/iu.test(color)) return false;
  const [red, green, blue] = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16));
  // Red hues including dark red; exclude orange, magenta, greys and pale tints.
  return red >= 70 && red - Math.max(green, blue) >= 40
    && Math.abs(green - blue) <= (red - Math.min(green, blue)) / 3;
}

function normalizedCharacters(text: string) {
  return text.normalize("NFKC").replace(/\s/gu, "");
}

export function extractTextColors(operators: OperatorList, ops: Record<string, number>) {
  let state: PaintState = { fill: false, stroke: false, mode: 0 };
  const stack: PaintState[] = [];
  const glyphText: string[] = [];
  const flags: boolean[] = [];
  for (let index = 0; index < operators.fnArray.length; index += 1) {
    const op = operators.fnArray[index];
    const args = operators.argsArray[index];
    if (op === ops.save || op === ops.paintFormXObjectBegin || op === ops.beginGroup) stack.push({ ...state });
    else if (op === ops.restore || op === ops.paintFormXObjectEnd || op === ops.endGroup) state = stack.pop() ?? { fill: false, stroke: false, mode: 0 };
    else if (op === ops.setFillRGBColor) state.fill = isRed(args[0]);
    else if (op === ops.setStrokeRGBColor) state.stroke = isRed(args[0]);
    else if (op === ops.setFillColorN || op === ops.setFillTransparent) state.fill = false;
    else if (op === ops.setStrokeColorN || op === ops.setStrokeTransparent) state.stroke = false;
    else if (op === ops.setTextRenderingMode) state.mode = Number(args[0]);
    else if (op === ops.showText) {
      const mode = state.mode & 3;
      const red = ((mode === 0 || mode === 2) && state.fill) || ((mode === 1 || mode === 2) && state.stroke);
      for (const glyph of Array.isArray(args[0]) ? args[0] : []) {
        if (!glyph || typeof glyph !== "object" || typeof glyph.unicode !== "string") continue;
        const text = normalizedCharacters(glyph.unicode);
        glyphText.push(text);
        flags.push(...Array<boolean>(text.length).fill(red));
      }
    }
  }
  return { text: glyphText.join(""), flags };
}

export function attachTextColors<T extends { str: string }>(items: readonly T[], colors: ReturnType<typeof extractTextColors>): (T & EmphasizedText)[] {
  // PDF.js may normalize/omit glyphs or reorder unusual scripts. Require an exact
  // normalized page match rather than moving emphasis onto the wrong words.
  const matches = items.map((item) => normalizedCharacters(item.str)).join("") === colors.text;
  let cursor = 0;
  const graphemes = new Intl.Segmenter("hu", { granularity: "grapheme" });
  return items.map((item) => {
    const flags: boolean[] = [];
    for (const { segment: character } of graphemes.segment(item.str)) {
      const length = normalizedCharacters(character).length;
      const red = matches && length > 0 && colors.flags.slice(cursor, cursor + length).some(Boolean);
      flags.push(...Array<boolean>(character.length).fill(red));
      cursor += length;
    }
    return { ...item, ...withBoldFlags(item.str, flags) };
  });
}
