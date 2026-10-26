import { textBoldFlags, withSpoilerFlags, type EmphasizedText } from "./text-emphasis.ts";

type Operators = { fnArray: number[]; argsArray: unknown[][] };
type Matrix = [number, number, number, number, number, number];
type Underline = { left: number; right: number; bottom: number; top: number; annotation?: boolean };
type Annotation = { subtype?: string; quadPoints?: ArrayLike<number> | null; rect?: number[] };
const identity = (): Matrix => [1, 0, 0, 1, 0, 0];
function numbers(value: unknown): number[] {
  return Array.isArray(value) || ArrayBuffer.isView(value) ? Array.from(value as ArrayLike<number>, Number) : [];
}
function multiply(a: Matrix, b: number[]): Matrix {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}

export function extractPdfUnderlines(operators: Operators, ops: Record<string, number>, annotations: Annotation[] = []): Underline[] {
  let matrix = identity();
  let lineWidth = 1;
  const stack: { matrix: Matrix; lineWidth: number }[] = [];
  const lines: Underline[] = [];
  const painted = new Set([ops.stroke, ops.closeStroke, ops.fill, ops.eoFill, ops.fillStroke, ops.eoFillStroke, ops.closeFillStroke, ops.closeEOFillStroke].filter((op) => op !== undefined));
  for (let i = 0; i < operators.fnArray.length; i += 1) {
    const op = operators.fnArray[i];
    const args = operators.argsArray[i];
    if (op === ops.save || op === ops.paintFormXObjectBegin) {
      stack.push({ matrix: [...matrix], lineWidth });
      if (op === ops.paintFormXObjectBegin && numbers(args[0]).length === 6) matrix = multiply(matrix, numbers(args[0]));
    } else if (op === ops.restore || op === ops.paintFormXObjectEnd) {
      const previous = stack.pop();
      matrix = previous?.matrix ?? identity(); lineWidth = previous?.lineWidth ?? 1;
    } else if (op === ops.transform && numbers(args).length === 6) matrix = multiply(matrix, numbers(args));
    else if (op === ops.setLineWidth) lineWidth = Math.abs(Number(args[0]));
    else if (op === ops.constructPath && painted.has(Number(args[0]))) {
      const box = numbers(args[2]);
      if (box.length !== 4 || !box.every(Number.isFinite)) continue;
      // PDF.js6 supplies the bounds of each painted path. Reject tall paths,
      // rules and rotated text rather than interpreting them as underlines.
      const points = [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]]]
        .map(([x, y]) => [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]]);
      const left = Math.min(...points.map(([x]) => x)); const right = Math.max(...points.map(([x]) => x));
      const bottom = Math.min(...points.map(([, y]) => y)); const top = Math.max(...points.map(([, y]) => y));
      const stroke = args[0] === ops.stroke || args[0] === ops.closeStroke;
      const thickness = Math.max(top - bottom, stroke ? lineWidth * Math.hypot(matrix[2], matrix[3]) : 0);
      if (right - left >= 2 && thickness <= 2) lines.push({ left, right, bottom: (top + bottom - thickness) / 2, top: (top + bottom + thickness) / 2 });
    }
  }
  for (const annotation of annotations) {
    if (annotation.subtype !== "Underline") continue;
    const quads = numbers(annotation.quadPoints);
    const boxes: number[][] = [];
    if (quads.length && quads.length % 8 === 0) {
      for (let i = 0; i < quads.length; i += 8) {
        const q = quads.slice(i, i + 8);
        boxes.push([Math.min(q[0], q[2], q[4], q[6]), Math.min(q[1], q[3], q[5], q[7]), Math.max(q[0], q[2], q[4], q[6]), Math.max(q[1], q[3], q[5], q[7])]);
      }
    } else if (annotation.rect?.length === 4) boxes.push(annotation.rect);
    for (const [left, bottom, right, top] of boxes) if ([left, bottom, right, top].every(Number.isFinite)) lines.push({ left, right, bottom, top, annotation: true });
  }
  return lines;
}

export function attachTextSpoilers<T extends EmphasizedText & { transform: number[]; width: number; height: number; pdfCharacterWidths?: number[] }>(items: readonly T[], underlines: readonly Underline[]): (T & EmphasizedText)[] {
  return items.map((item) => {
    const red = textBoldFlags(item); // Called before native bold weight is added.
    if (!red.some(Boolean) || Math.abs(item.transform[1]) > .01 || item.width <= 0) return item;
    const [x, y] = item.transform.slice(4);
    const size = item.height || Math.abs(item.transform[3]);
    const lines = underlines.filter((line) => line.right > x && line.left < x + item.width
      && (line.annotation ? y >= line.bottom - 1 && y <= line.top : y - line.top >= 0 && y - line.bottom <= size * .3)
      && (line.annotation || line.top - line.bottom <= Math.max(1, size * .13)));
    if (!lines.length) return item;
    const rawWidths = item.pdfCharacterWidths ?? Array<number>(item.text.length).fill(1);
    const average = rawWidths.reduce((sum, width) => sum + width, 0) / Math.max(1, rawWidths.filter(Boolean).length);
    const widths = rawWidths.map((width) => width || average * .5);
    const total = widths.reduce((sum, width) => sum + width, 0);
    let cursor = x;
    const flags = widths.map((width, index) => {
      const end = cursor + width / total * item.width;
      const center = (cursor + end) / 2; cursor = end;
      return red[index] && lines.some((line) => center >= line.left - .3 && center <= line.right + .3);
    });
    return { ...item, ...withSpoilerFlags(item.text, flags) };
  });
}
