export const STUDY_ARTICLE_VERSION = "pdf-layout-v1";

export type StudyArticleBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "scripture"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

export type StudyArticle = {
  version: string;
  blocks: StudyArticleBlock[];
};

export type PdfArticleLine = {
  pageNumber: number;
  pageHeight: number;
  x: number;
  y: number;
  fontSize: number;
  text: string;
};

type RawBlock = {
  text: string;
  lines: PdfArticleLine[];
  pageNumber: number;
  fontSize: number;
  reference: boolean;
  largeHeading: boolean;
  likelySubheading: boolean;
};

const MAX_BLOCKS = 800;
const MAX_TEXT_LENGTH = 30_000;
const MAX_LIST_ITEMS = 200;

function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).toSorted((left, right) => left - right);
  if (!sorted.length) return 11;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function cleanText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?])(?=\d+\s)/g, "$1 ")
    .trim();
}

function normalizeComparable(value: string) {
  return cleanText(value).normalize("NFKC").toLocaleLowerCase("hu-HU");
}

function endsSentence(value: string) {
  return /[.!?…:;”"')\]]$/u.test(value.trim());
}

export function looksLikeScriptureReferenceStart(value: string) {
  const text = cleanText(value);
  return /^(?:\d{1,3}:\d|(?:(?:[1-5]|I{1,3})\s+)?[\p{L}][\p{L}.]*(?:\s+[\p{L}][\p{L}.]*){0,2}\s+\d{1,3}(?::|,)\d)/u.test(text);
}

function listItem(value: string) {
  const unordered = value.match(/^[•●▪◦*–-]\s+(.+)$/u);
  if (unordered) return { ordered: false, text: cleanText(unordered[1]) };
  const ordered = value.match(/^\d+[.)]\s+(.+)$/u);
  return ordered ? { ordered: true, text: cleanText(ordered[1]) } : null;
}

function joinLines(lines: readonly PdfArticleLine[]) {
  return cleanText(lines.reduce((result, line) => {
    const text = cleanText(line.text);
    if (!result) return text;
    if (/[-‐]$/u.test(result) && /^\p{Ll}/u.test(text)) return `${result.slice(0, -1)}${text}`;
    return `${result} ${text}`;
  }, ""));
}

function removeRepeatedPageFurniture(pages: readonly PdfArticleLine[][]) {
  const occurrences = new Map<string, Set<number>>();

  for (const lines of pages) {
    for (const line of lines) {
      const nearEdge = line.y < 48 || line.y > line.pageHeight - 48;
      const key = normalizeComparable(line.text);
      if (!nearEdge || !key || key.length > 160) continue;
      const pageNumbers = occurrences.get(key) ?? new Set<number>();
      pageNumbers.add(line.pageNumber);
      occurrences.set(key, pageNumbers);
    }
  }

  return pages.map((lines) => lines.filter((line) => {
    const nearEdge = line.y < 48 || line.y > line.pageHeight - 48;
    const repeated = (occurrences.get(normalizeComparable(line.text))?.size ?? 0) > 1;
    const barePageNumber = /^\d{1,4}$/.test(cleanText(line.text));
    return !(nearEdge && (repeated || barePageNumber));
  }));
}

function buildPageBlocks(lines: readonly PdfArticleLine[], bodyFontSize: number) {
  const blocks: RawBlock[] = [];
  const headingThreshold = bodyFontSize * 1.2;
  const paragraphGap = bodyFontSize * 1.9;
  let buffered: PdfArticleLine[] = [];

  function flush() {
    if (!buffered.length) return;
    const text = joinLines(buffered);
    blocks.push({
      text,
      lines: buffered,
      pageNumber: buffered[0].pageNumber,
      fontSize: Math.max(...buffered.map((line) => line.fontSize)),
      reference: looksLikeScriptureReferenceStart(text),
      largeHeading: Math.max(...buffered.map((line) => line.fontSize)) >= headingThreshold,
      likelySubheading: false,
    });
    buffered = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const previous = lines[index - 1];
    const next = lines[index + 1];
    const gapBefore = previous ? previous.y - line.y : Number.POSITIVE_INFINITY;
    const largeHeading = line.fontSize >= headingThreshold;
    const startsReference = looksLikeScriptureReferenceStart(line.text);
    const isolatedBeforeReference = Boolean(
      next
      && !endsSentence(line.text)
      && cleanText(line.text).length <= 180
      && looksLikeScriptureReferenceStart(next.text),
    );
    const bufferedText = joinLines(buffered);
    const isolatedStartsNewBlock = isolatedBeforeReference && (
      gapBefore >= paragraphGap
      || (looksLikeScriptureReferenceStart(bufferedText) && endsSentence(bufferedText))
    );
    const startsNewBlock = buffered.length > 0 && (
      gapBefore >= paragraphGap
      || largeHeading
      || startsReference
      || isolatedStartsNewBlock
    );

    if (startsNewBlock) flush();
    buffered.push(line);

    if (largeHeading || isolatedBeforeReference) flush();
  }

  flush();
  return blocks;
}

function markSubheadings(blocks: RawBlock[], bodyFontSize: number) {
  return blocks.map((block, index) => {
    const next = blocks[index + 1];
    const previous = blocks[index - 1];
    const nextStartsReference = Boolean(next?.reference);
    const lineCount = block.lines.length;
    const gapBefore = previous && previous.pageNumber === block.pageNumber
      ? previous.lines.at(-1)!.y - block.lines[0].y
      : Number.POSITIVE_INFINITY;
    const gapAfter = next && next.pageNumber === block.pageNumber
      ? block.lines.at(-1)!.y - next.lines[0].y
      : Number.POSITIVE_INFINITY;
    const likelySubheading = !block.largeHeading
      && !block.reference
      && !listItem(block.text)
      && lineCount <= 2
      && block.text.length <= 180
      && !endsSentence(block.text)
      && (nextStartsReference || (gapBefore >= bodyFontSize * 1.9 && gapAfter >= bodyFontSize * 1.9));

    return { ...block, likelySubheading };
  });
}

function mergePageContinuations(blocks: RawBlock[]) {
  const merged: RawBlock[] = [];

  for (const block of blocks) {
    const previous = merged.at(-1);
    const continuesPreviousPage = previous
      && block.pageNumber === previous.pageNumber + 1
      && !previous.largeHeading
      && !previous.likelySubheading
      && !block.largeHeading
      && !block.likelySubheading
      && !block.reference
      && !endsSentence(previous.text);

    if (continuesPreviousPage) {
      previous.lines.push(...block.lines);
      previous.text = joinLines(previous.lines);
      continue;
    }

    merged.push({ ...block, lines: [...block.lines] });
  }

  return merged;
}

function combineLists(blocks: StudyArticleBlock[]) {
  const combined: StudyArticleBlock[] = [];

  for (const block of blocks) {
    if (block.type !== "paragraph") {
      combined.push(block);
      continue;
    }

    const item = listItem(block.text);
    if (!item) {
      combined.push(block);
      continue;
    }

    const previous = combined.at(-1);
    if (previous?.type === "list" && previous.ordered === item.ordered) {
      previous.items.push(item.text);
    } else {
      combined.push({ type: "list", ordered: item.ordered, items: [item.text] });
    }
  }

  return combined;
}

export function buildStudyArticle(
  inputPages: readonly PdfArticleLine[][],
  documentTitle?: string,
): StudyArticle {
  const pages = removeRepeatedPageFurniture(inputPages).map((lines) =>
    lines.filter((line) => cleanText(line.text)).toSorted((left, right) => (
      right.y - left.y || left.x - right.x
    )),
  );
  const bodyFontSize = median(pages.flat().map((line) => line.fontSize));
  const rawBlocks = pages.flatMap((lines) => buildPageBlocks(lines, bodyFontSize));
  const markedBlocks = markSubheadings(rawBlocks, bodyFontSize);
  const mergedBlocks = mergePageContinuations(markedBlocks);
  const comparableTitle = documentTitle ? normalizeComparable(documentTitle) : "";

  const blocks = mergedBlocks.flatMap<StudyArticleBlock>((block, index) => {
    if (!block.text) return [];
    const isDocumentTitle = index === 0 && (
      block.fontSize >= bodyFontSize * 1.7
      || (comparableTitle && normalizeComparable(block.text) === comparableTitle)
    );
    if (isDocumentTitle) return [];
    if (block.largeHeading) return [{ type: "heading", level: 2, text: block.text }];
    if (block.likelySubheading) return [{ type: "heading", level: 3, text: block.text }];
    if (block.reference) return [{ type: "scripture", text: block.text }];
    return [{ type: "paragraph", text: block.text }];
  });

  return { version: STUDY_ARTICLE_VERSION, blocks: combineLists(blocks) };
}

function validText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_TEXT_LENGTH;
}

export function parseStudyArticle(value: unknown): StudyArticle | null {
  if (typeof value === "string") {
    try {
      return parseStudyArticle(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;

  const candidate = value as { version?: unknown; blocks?: unknown };
  if (typeof candidate.version !== "string" || !Array.isArray(candidate.blocks)) return null;
  if (candidate.blocks.length === 0 || candidate.blocks.length > MAX_BLOCKS) return null;

  const blocks: StudyArticleBlock[] = [];
  for (const blockValue of candidate.blocks) {
    if (!blockValue || typeof blockValue !== "object") return null;
    const block = blockValue as Record<string, unknown>;
    if (block.type === "heading" && (block.level === 2 || block.level === 3) && validText(block.text)) {
      blocks.push({ type: "heading", level: block.level, text: block.text as string });
    } else if ((block.type === "paragraph" || block.type === "scripture") && validText(block.text)) {
      blocks.push({ type: block.type, text: block.text as string });
    } else if (
      block.type === "list"
      && typeof block.ordered === "boolean"
      && Array.isArray(block.items)
      && block.items.length > 0
      && block.items.length <= MAX_LIST_ITEMS
      && block.items.every(validText)
    ) {
      blocks.push({ type: "list", ordered: block.ordered, items: block.items as string[] });
    } else {
      return null;
    }
  }

  return { version: candidate.version, blocks };
}
