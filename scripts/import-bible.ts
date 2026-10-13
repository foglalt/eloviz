import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { completeKaroliText, parseKaroliOsis, sha256, validateBibleCanon } from "./bible-import-core.ts";

const source = JSON.parse(await readFile(new URL("../data/bible/karoli-1908-source.json", import.meta.url), "utf8"));
const books: [string, string, string][] = JSON.parse(await readFile(new URL("../data/canonical-books.json", import.meta.url), "utf8"));
const codes = books.map(([code]) => code);
const localIndex = process.argv.indexOf("--source-directory");
const localDirectory = localIndex >= 0 ? process.argv[localIndex + 1] : null;
async function verifiedSource(url: string, hash: string, filename: string) {
  let content: Uint8Array;
  if (localDirectory) {
    content = await readFile(`${localDirectory}/${filename}`);
  } else {
    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`Source download failed (${response.status}).`);
    content = new Uint8Array(await response.arrayBuffer());
  }
  if (sha256(content) !== hash) throw new Error(`Unexpected source checksum: ${filename}`);
  return new TextDecoder("utf-8", { fatal: true }).decode(content);
}
const xml = await verifiedSource(source.downloadUrl, source.sourceSha256, "hunkaroli_rev.osis.xml");
const supplemental = JSON.parse(await verifiedSource(source.supplement.downloadUrl, source.supplement.sourceSha256, "hunk.json"));
const verses = completeKaroliText(parseKaroliOsis(xml, codes), supplemental, source.supplement.verses, codes);
const chapters = validateBibleCanon(verses, codes, source.chapterCount, source.verseCount);
if (books.length !== source.bookCount) throw new Error("Unexpected canonical book count.");
const textHash = sha256(JSON.stringify(verses));
if (textHash !== source.textSha256) throw new Error("Normalized text differs from the reviewed edition.");
console.log(JSON.stringify({ translation: source.id, books: books.length, chapters: chapters.length, verses: verses.length, textSha256: textHash, supplementalVerses: source.supplement.verses.map((v: { osis: string }) => v.osis) }));
if (process.argv.includes("--validate-only")) process.exit(0);

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
// The HTTP driver preserves transaction atomicity. Migrations/imports use direct hosts.
const connection = new URL(process.env.DATABASE_URL);
connection.hostname = connection.hostname.replace("-pooler.", ".");
const sql = neon(connection.toString());
const existing = await sql.query("SELECT source_sha256, text_sha256 FROM bible_translations WHERE id=$1", [source.id]);
if (existing.length && (existing[0].source_sha256 !== source.sourceSha256 || existing[0].text_sha256 !== textHash)) {
  throw new Error("Existing translation differs. A reviewed version migration is required.");
}
const bookRows = books.map(([code, name_hu, testament], index) => ({ code, name_hu, testament, canonical_order: index + 1 }));
const points = verses.map((verse) => ({ book_code: verse.book_code, chapter_number: verse.chapter_number, verse_number: verse.verse_number }));
const textRows = JSON.stringify(verses.map(({ osis, text }) => ({ osis, text })));
await sql.transaction((transaction) => [
  transaction.query("SELECT pg_advisory_xact_lock(hashtext('eloviz-bible-import'))"),
  transaction.query(`INSERT INTO canonical_books(code,name_hu,testament,canonical_order)
    SELECT code,name_hu,testament,canonical_order FROM jsonb_to_recordset($1::jsonb)
    AS x(code text,name_hu text,testament text,canonical_order integer) ON CONFLICT (code) DO NOTHING`, [JSON.stringify(bookRows)]),
  transaction.query(`INSERT INTO canonical_chapters(book_code,chapter_number)
    SELECT book_code,chapter_number FROM jsonb_to_recordset($1::jsonb)
    AS x(book_code text,chapter_number integer) ON CONFLICT DO NOTHING`, [JSON.stringify(chapters)]),
  transaction.query(`INSERT INTO canonical_verses(book_code,chapter_number,verse_number)
    SELECT book_code,chapter_number,verse_number FROM jsonb_to_recordset($1::jsonb)
    AS x(book_code text,chapter_number integer,verse_number integer) ON CONFLICT DO NOTHING`, [JSON.stringify(points)]),
  transaction.query(`INSERT INTO bible_translations(id,name,abbreviation,language,edition_year,licence,licence_url,
    source_url,source_commit,source_sha256,text_sha256,provenance,versification,attribution,chapter_count,verse_count)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16)
    ON CONFLICT(id) DO NOTHING`, [source.id, source.name, source.abbreviation, source.language, source.editionYear,
    source.licence, source.licenceUrl, source.sourceUrl, source.sourceCommit, source.sourceSha256, textHash,
    JSON.stringify(source), source.versification, source.attribution, chapters.length, verses.length]),
  transaction.query(`INSERT INTO bible_verses(translation_id,osis,text)
    SELECT $1,osis,text FROM jsonb_to_recordset($2::jsonb) AS x(osis text,text text)
    ON CONFLICT(translation_id,osis) DO NOTHING`, [source.id, textRows]),
  // A mismatch raises inside the transaction, rolling back all newly inserted rows.
  transaction.query(`SELECT 1 / CASE WHEN
    EXISTS(SELECT 1 FROM bible_translations WHERE id=$1 AND source_sha256=$2 AND text_sha256=$3
      AND verse_count=$4 AND chapter_count=$5 AND provenance=$6::jsonb)
    AND (SELECT count(*) FROM bible_verses WHERE translation_id=$1)=$4
    AND NOT EXISTS(SELECT 1 FROM jsonb_to_recordset($7::jsonb) AS x(osis text,text text)
      LEFT JOIN bible_verses v ON v.translation_id=$1 AND v.osis=x.osis WHERE v.text IS DISTINCT FROM x.text)
    AND NOT EXISTS(SELECT 1 FROM jsonb_to_recordset($8::jsonb) AS x(code text,canonical_order integer)
      LEFT JOIN canonical_books b ON b.code=x.code WHERE b.canonical_order IS DISTINCT FROM x.canonical_order)
    THEN 1 ELSE 0 END AS verified`, [source.id, source.sourceSha256, textHash, verses.length, chapters.length,
    JSON.stringify(source), textRows, JSON.stringify(bookRows)]),
]);
// Read every stored row back to detect any pre-existing conflict or altered text.
const stored = await sql.query(`SELECT v.osis,c.book_code,c.chapter_number,c.verse_number,v.text
  FROM bible_verses v JOIN canonical_verses c ON c.osis=v.osis JOIN canonical_books b ON b.code=c.book_code
  WHERE translation_id=$1 ORDER BY b.canonical_order,c.chapter_number,c.verse_number`, [source.id]);
if (sha256(JSON.stringify(stored)) !== textHash) throw new Error("Stored text checksum does not match the validated source.");
console.log(`Imported and read-back verified ${stored.length} verses. Repeated imports preserve the existing translation.`);
