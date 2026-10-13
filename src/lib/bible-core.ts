import canonicalBooks from "../../data/canonical-books.json" with { type: "json" };
import { parseScriptureReferenceQuery } from "./scripture-references.ts";

export const BIBLE_TRANSLATION_ID = "karoli-1908";
export const BIBLE_TRANSLATION_NAME = "Károli 1908";
export const BIBLE_BOOKS = canonicalBooks.map(([code, name, testament], index) => ({
  code, name, testament, order: index + 1,
  slug: name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
}));

export function bibleBookBySlug(slug: string) { return BIBLE_BOOKS.find((book) => book.slug === slug) ?? null; }
export function bibleBookByCode(code: string) { return BIBLE_BOOKS.find((book) => book.code === code) ?? null; }
export function bibleBookPath(slug: string) { return `/biblia/${BIBLE_TRANSLATION_ID}/${slug}`; }
export function bibleChapterPath(slug: string, chapter: number) { return `${bibleBookPath(slug)}/${chapter}`; }
export function bibleVerseHref(osis: string) {
  const match = /^([1-3]?[A-Za-z]+)\.([1-9]\d{0,2})\.([1-9]\d{0,2})$/.exec(osis);
  const book = match ? bibleBookByCode(match[1]) : null;
  return book && match ? `${bibleChapterPath(book.slug, Number(match[2]))}#vers-${Number(match[3])}` : null;
}
export function parseBibleChapter(value: string) { return /^[1-9]\d{0,2}$/.test(value) ? Number(value) : null; }
export function parseBibleLookup(value: string) {
  const range = parseScriptureReferenceQuery(value.trim());
  return range && bibleBookByCode(range.bookCode) ? range : null;
}
export function bibleChapterNeighbours(bookSlug: string, chapter: number, counts: Map<string, number>) {
  const index = BIBLE_BOOKS.findIndex((book) => book.slug === bookSlug);
  const count = counts.get(bookSlug) ?? 0;
  if (index < 0 || chapter < 1 || chapter > count) return { previous: null, next: null };
  const previousBook = BIBLE_BOOKS[index - 1];
  const nextBook = BIBLE_BOOKS[index + 1];
  return {
    previous: chapter > 1 ? { slug: bookSlug, chapter: chapter - 1 }
      : previousBook && counts.has(previousBook.slug) ? { slug: previousBook.slug, chapter: counts.get(previousBook.slug)! } : null,
    next: chapter < count ? { slug: bookSlug, chapter: chapter + 1 }
      : nextBook && counts.has(nextBook.slug) ? { slug: nextBook.slug, chapter: 1 } : null,
  };
}
