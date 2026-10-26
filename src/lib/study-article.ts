import { detectScriptureReferences } from "./scripture-references.ts";
import { cleanEmphasizedText, concatEmphasizedText, sliceEmphasizedText, validBoldRanges, type BoldRange, type EmphasizedText } from "./text-emphasis.ts";

export const STUDY_ARTICLE_VERSION = "pdf-layout-v5";

export type StudyArticleBlock =
  | ({ type: "heading"; level: 2 | 3 } & EmphasizedText)
  | ({ type: "paragraph" } & EmphasizedText)
  | ({ type: "scripture" } & EmphasizedText)
  | { type: "list"; ordered: boolean; items: string[]; itemBoldRanges?: BoldRange[][]; itemSpoilerRanges?: BoldRange[][] };

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
  boldRanges?: BoldRange[];
  spoilerRanges?: BoldRange[];
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
  return cleanEmphasizedText({ text: value }).text;
}

function normalizeComparable(value: string) {
  return cleanText(value).normalize("NFKC").toLocaleLowerCase("hu-HU");
}

function endsSentence(value: string) {
  return /[.!?…:;”"')\]]$/u.test(value.trim());
}

export function looksLikeScriptureReferenceStart(value: string) {
  const text = cleanText(value);
  const reference = detectScriptureReferences([text])[0];
  return Boolean(reference && text.toLocaleLowerCase("hu-HU").startsWith(reference.rawText.toLocaleLowerCase("hu-HU")));
}

function looksLikeScriptureExcerpt(value: string) {
  const text = cleanText(value);
  if (!looksLikeScriptureReferenceStart(text)) return false;
  const reference = detectScriptureReferences([text])[0];
  const remainder = text.slice(reference.rawText.length).replace(/^[\s:–—\-„“”"']+/u, "");
  // A bare reference or a list of references is not a written Bible passage.
  return /\p{L}/u.test(remainder) && remainder.length >= 10
    && detectScriptureReferences([remainder]).length === 0;
}

function listItem(value: string) {
  const unordered = value.match(/^[•●▪◦*–-]\s+(.+)$/u);
  if (unordered) return { ordered: false, text: cleanText(unordered[1]) };
  const ordered = value.match(/^\d+[.)]\s+(.+)$/u);
  return ordered ? { ordered: true, text: cleanText(ordered[1]) } : null;
}

function joinLines(lines: readonly PdfArticleLine[]) {
  return joinFormattedLines(lines).text;
}

function joinFormattedLines(lines: readonly PdfArticleLine[]): EmphasizedText {
  return cleanEmphasizedText(lines.reduce<EmphasizedText>((result, line) => {
    const value = cleanEmphasizedText(line);
    if (!result.text) return value;
    if (/[-‐]$/u.test(result.text) && /^\p{Ll}/u.test(value.text)) return concatEmphasizedText(sliceEmphasizedText(result, 0, result.text.length - 1), value);
    return concatEmphasizedText(result, { text: " " }, value);
  }, { text: "" }));
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
      reference: looksLikeScriptureExcerpt(text),
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
    const startsReference = looksLikeScriptureExcerpt(line.text);
    const startsListItem = Boolean(listItem(cleanText(line.text)));
    const isolatedBeforeReference = Boolean(
      next
      && !endsSentence(line.text)
      && cleanText(line.text).length <= 180
      && looksLikeScriptureExcerpt(next.text),
    );
    const bufferedText = joinLines(buffered);
    const isolatedStartsNewBlock = isolatedBeforeReference && (
      gapBefore >= paragraphGap
      || (looksLikeScriptureReferenceStart(bufferedText) && endsSentence(bufferedText))
    );
    const startsNewBlock = buffered.length > 0 && (
      gapBefore >= paragraphGap
      || largeHeading
      || startsListItem
      || (startsReference && !listItem(bufferedText))
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
    const itemFormatting = cleanEmphasizedText(sliceEmphasizedText(block, block.text.length - item.text.length));
    if (previous?.type === "list" && previous.ordered === item.ordered) {
      if (itemFormatting.boldRanges && !previous.itemBoldRanges) previous.itemBoldRanges = previous.items.map(() => []);
      if (itemFormatting.spoilerRanges && !previous.itemSpoilerRanges) previous.itemSpoilerRanges = previous.items.map(() => []);
      previous.items.push(item.text);
      previous.itemBoldRanges?.push(itemFormatting.boldRanges ?? []);
      previous.itemSpoilerRanges?.push(itemFormatting.spoilerRanges ?? []);
    } else {
      combined.push({ type: "list", ordered: item.ordered, items: [item.text],
        ...(itemFormatting.boldRanges ? { itemBoldRanges: [itemFormatting.boldRanges] } : {}),
        ...(itemFormatting.spoilerRanges ? { itemSpoilerRanges: [itemFormatting.spoilerRanges] } : {}) });
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
    const value = joinFormattedLines(block.lines);
    if (block.largeHeading) return [{ type: "heading", level: 2, ...value }];
    if (block.likelySubheading) return [{ type: "heading", level: 3, ...value }];
    if (block.reference) return [{ type: "scripture", ...value }];
    return [{ type: "paragraph", ...value }];
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
    if (block.boldRanges !== undefined && (typeof block.text !== "string" || !validBoldRanges(block.boldRanges, block.text))) return null;
    if (block.spoilerRanges !== undefined && (typeof block.text !== "string" || !validBoldRanges(block.spoilerRanges, block.text))) return null;
    const emphasis = { ...(block.boldRanges ? { boldRanges: block.boldRanges as BoldRange[] } : {}),
      ...(block.spoilerRanges ? { spoilerRanges: block.spoilerRanges as BoldRange[] } : {}) };
    if (block.type === "heading" && (block.level === 2 || block.level === 3) && validText(block.text)) {
      blocks.push({ type: "heading", level: block.level, text: block.text as string, ...emphasis });
    } else if ((block.type === "paragraph" || block.type === "scripture") && validText(block.text)) {
      blocks.push({ type: block.type, text: block.text as string, ...emphasis });
    } else if (
      block.type === "list"
      && typeof block.ordered === "boolean"
      && Array.isArray(block.items)
      && block.items.length > 0
      && block.items.length <= MAX_LIST_ITEMS
      && block.items.every(validText)
    ) {
      if (block.itemBoldRanges !== undefined && (!Array.isArray(block.itemBoldRanges)
        || block.itemBoldRanges.length !== block.items.length
        || !block.itemBoldRanges.every((ranges, index) => validBoldRanges(ranges, (block.items as string[])[index])))) return null;
      if (block.itemSpoilerRanges !== undefined && (!Array.isArray(block.itemSpoilerRanges)
        || block.itemSpoilerRanges.length !== block.items.length
        || !block.itemSpoilerRanges.every((ranges, index) => validBoldRanges(ranges, (block.items as string[])[index])))) return null;
      blocks.push({ type: "list", ordered: block.ordered, items: block.items as string[],
        ...(block.itemBoldRanges ? { itemBoldRanges: block.itemBoldRanges as BoldRange[][] } : {}),
        ...(block.itemSpoilerRanges ? { itemSpoilerRanges: block.itemSpoilerRanges as BoldRange[][] } : {}) });
    } else {
      return null;
    }
  }

  return { version: candidate.version, blocks };
}
