import { bibleBookByCode, parseBibleLookup } from "./bible-core.ts";
import { formatOsisReference, type ScriptureReferenceRange } from "./scripture-references.ts";

export type BiblePassageRequest = ScriptureReferenceRange & { wholeChapter: boolean };
export type BiblePassage = {
  label: string;
  translation: string;
  attribution: string;
  sourceUrl: string;
  href: string;
  selectedStart: string;
  selectedEnd: string;
  chapters: { number: number; label: string; verses: { osis: string; number: number; text: string; selected: boolean }[] }[];
  previous: { label: string; query: string } | null;
  next: { label: string; query: string } | null;
};

export function parseBiblePassageRequest(params: URLSearchParams): BiblePassageRequest | null {
  const query = params.get("q");
  if (query !== null) {
    if (!query.trim() || query.length > 100) return null;
    const normalized = query.trim().replace(/(?<=\p{L})(?=\d)/gu, " ");
    const exact = parseBibleLookup(normalized);
    const range = exact ?? parseBibleLookup(`${normalized}:1`);
    return range && range.endChapter - range.startChapter < 10 ? { ...range, wholeChapter: !exact } : null;
  }
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? start;
  const pattern = /^([1-3]?[A-Za-z]+)\.([1-9]\d{0,2})\.([1-9]\d{0,2})$/;
  const a = pattern.exec(start);
  const b = pattern.exec(end);
  const displayLabel = formatOsisReference(start, end);
  if (!a || !b || !displayLabel || a[1] !== b[1] || !bibleBookByCode(a[1]) || Number(b[2]) - Number(a[2]) >= 10) return null;
  return { displayLabel, bookCode: a[1], startChapter: Number(a[2]), startVerse: Number(a[3]),
    endChapter: Number(b[2]), endVerse: Number(b[3]), osisStart: start, osisEnd: end, wholeChapter: false };
}
