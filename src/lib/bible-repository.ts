import "server-only";
import { cache } from "react";
import { getSql } from "./db";
import { BIBLE_BOOKS, BIBLE_TRANSLATION_ID, bibleBookBySlug, parseBibleChapter } from "./bible-core";

export type BibleStudy = { id: string; slug: string; title: string };
export type BibleChapter = {
  book: typeof BIBLE_BOOKS[number]; chapter: number;
  verses: { osis: string; number: number; text: string; studies: BibleStudy[] }[];
};

export const getBibleEdition = cache(async () => {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql.query("SELECT name,attribution,licence_url,source_url,imported_at FROM bible_translations WHERE id=$1", [BIBLE_TRANSLATION_ID]);
  return rows[0] ? { name: String(rows[0].name), attribution: String(rows[0].attribution), licenceUrl: String(rows[0].licence_url), sourceUrl: String(rows[0].source_url), importedAt: String(rows[0].imported_at) } : null;
});

export const listBibleBooks = cache(async () => {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT c.book_code,max(c.chapter_number)::int AS chapters
    FROM canonical_verses c JOIN bible_verses v ON v.osis=c.osis WHERE v.translation_id=$1 GROUP BY c.book_code`, [BIBLE_TRANSLATION_ID]);
  const counts = new Map(rows.map((row) => [String(row.book_code), Number(row.chapters)]));
  return BIBLE_BOOKS.filter((book) => counts.has(book.code)).map((book) => ({ ...book, chapters: counts.get(book.code)! }));
});

export const getBibleChapter = cache(async (slug: string, rawChapter: string): Promise<BibleChapter | null> => {
  const book = bibleBookBySlug(slug);
  const chapter = parseBibleChapter(rawChapter);
  const sql = getSql();
  if (!book || !chapter || !sql) return null;
  const rows = await sql.query(`SELECT c.osis,c.verse_number,v.text,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('id',matched.id,'slug',matched.slug,'title',matched.title) ORDER BY matched.sort_order,matched.title)
      FROM (SELECT DISTINCT s.id::text,s.slug,s.title,s.sort_order
        FROM study_scripture_references r JOIN studies s ON s.id=r.study_id AND s.published_document_id=r.document_id
        JOIN study_documents d ON d.id=s.published_document_id AND d.study_id=s.id
        WHERE s.status='published' AND r.book_code=c.book_code
          AND (r.start_chapter,r.start_verse)<=(c.chapter_number,c.verse_number)
          AND (r.end_chapter,r.end_verse)>=(c.chapter_number,c.verse_number)) matched), '[]'::jsonb) AS studies
    FROM canonical_verses c JOIN bible_verses v ON v.osis=c.osis
    WHERE v.translation_id=$1 AND c.book_code=$2 AND c.chapter_number=$3 ORDER BY c.verse_number`, [BIBLE_TRANSLATION_ID, book.code, chapter]);
  return rows.length ? { book, chapter, verses: rows.map((row) => ({ osis: String(row.osis), number: Number(row.verse_number), text: String(row.text), studies: row.studies as BibleStudy[] })) } : null;
});

export async function readableBiblePoints(points: string[]) {
  const sql = getSql();
  if (!sql || !points.length) return new Set<string>();
  const rows = await sql.query("SELECT osis FROM bible_verses WHERE translation_id=$1 AND osis=ANY($2::text[])", [BIBLE_TRANSLATION_ID, [...new Set(points)]]);
  return new Set(rows.map((row) => String(row.osis)));
}

export const listBibleChapters = cache(async () => {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT DISTINCT c.book_code,c.chapter_number FROM canonical_verses c
    JOIN bible_verses v ON v.osis=c.osis WHERE v.translation_id=$1`, [BIBLE_TRANSLATION_ID]);
  return rows.flatMap((row) => {
    const book = BIBLE_BOOKS.find((book) => book.code === row.book_code);
    return book ? [{ slug: book.slug, chapter: Number(row.chapter_number) }] : [];
  });
});
