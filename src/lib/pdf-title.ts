import type { PdfArticleLine } from './study-article.ts';

function withoutLessonNumber(value: string) {
  return value.replace(/^\d+\s*\.\s*(?:lecke|melléklet|rész|fejezet)\b\s*(?:[–—:\-]\s*)?/iu, '').trim();
}

// Prefer a prominent first-page heading, never a filename or an arbitrary
// opening paragraph. Uncertain documents keep the editable title field empty.
export function titleFromPdfLines(input: readonly PdfArticleLine[]): string | null {
  const lines = input.filter((line) => /\p{L}/u.test(line.text) && line.y > 48)
    .toSorted((a, b) => b.y - a.y || a.x - b.x);
  if (!lines.length) return null;
  const sizes = lines.map((line) => line.fontSize).toSorted((a, b) => a - b);
  const bodySize = sizes[Math.floor(sizes.length / 2)];
  const start = lines.findIndex((line, index) => index < 8 && line.y > line.pageHeight * 0.55
    && (line.fontSize >= bodySize * 1.3 || /^\d+\s*\.\s*(?:lecke|melléklet|rész|fejezet)\b/iu.test(line.text)));
  if (start < 0) return null;
  const heading = [lines[start]];
  for (const line of lines.slice(start + 1, start + 4)) {
    const previous = heading.at(-1)!;
    if (Math.abs(line.fontSize - heading[0].fontSize) > 1 || previous.y - line.y > heading[0].fontSize * 1.8) break;
    heading.push(line);
  }
  const title = withoutLessonNumber(heading.map((line) => line.text).join(' ').replace(/\s+/gu, ' ').trim());
  return title.length >= 2 && title.length <= 160 && /\p{L}/u.test(title) ? title : null;
}
