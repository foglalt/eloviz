import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { sha256 } from "./bible-import-core.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const sql = neon(process.env.DATABASE_URL);
const source = JSON.parse(await readFile(new URL("../data/bible/karoli-1908-source.json", import.meta.url), "utf8"));
const rows = await sql.query(`SELECT v.osis,c.book_code,c.chapter_number,c.verse_number,v.text
  FROM bible_verses v JOIN canonical_verses c ON c.osis=v.osis JOIN canonical_books b ON b.code=c.book_code
  WHERE translation_id=$1 ORDER BY b.canonical_order,c.chapter_number,c.verse_number`, [source.id]);
assert.equal(rows.length, source.verseCount);
assert.equal(sha256(JSON.stringify(rows)), source.textSha256);
assert.equal(new Set(rows.map((row) => row.book_code)).size, 66);
assert.equal(new Set(rows.map((row) => `${row.book_code}.${row.chapter_number}`)).size, 1189);
const byOsis = new Map(rows.map((row) => [row.osis, String(row.text)]));
assert.equal(byOsis.get("Gen.1.1"), "Kezdetben teremté Isten az eget és a földet.");
assert.match(byOsis.get("John.3.16") ?? "", /úgy szerette Isten e világot/);
assert.match(byOsis.get("Rev.22.17") ?? "", /vegye az élet vizét ingyen/);
for (const patch of source.supplement.verses) assert.ok(byOsis.get(patch.osis));
const uncovered = await sql.query(`SELECT r.osis_start,r.osis_end FROM study_scripture_references r
  JOIN studies s ON s.id=r.study_id AND s.published_document_id=r.document_id
  WHERE s.status='published' AND (NOT EXISTS(SELECT 1 FROM bible_verses v WHERE v.translation_id=$1 AND v.osis=r.osis_start)
    OR NOT EXISTS(SELECT 1 FROM bible_verses v WHERE v.translation_id=$1 AND v.osis=r.osis_end))`, [source.id]);
assert.deepEqual(uncovered, [], "Published study-reference endpoints must resolve in this edition.");
console.log("Full stored-text checksum, 66 books, 1189 chapters, 31171 verses, representative text and all current published study endpoints passed.");

function importAgain() {
  const directoryIndex = process.argv.indexOf("--source-directory");
  const argumentsList = ["--experimental-strip-types", "scripts/import-bible.ts"];
  if (directoryIndex >= 0) argumentsList.push("--source-directory", process.argv[directoryIndex + 1]);
  return spawnSync(process.execPath, argumentsList, { env: process.env, encoding: "utf8" });
}
const before = await sql.query("SELECT imported_at,provenance FROM bible_translations WHERE id=$1", [source.id]);
assert.equal(importAgain().status, 0, "Repeat import must succeed.");
assert.deepEqual(await sql.query("SELECT imported_at,provenance FROM bible_translations WHERE id=$1", [source.id]), before);
console.log("Idempotency passed: repeat import preserved provenance and import timestamp.");

if (process.argv.includes("--probe-rollback")) {
  const expectedHost = process.env.BIBLE_VERIFICATION_BRANCH_HOST;
  assert.ok(expectedHost, "Mutation probe requires an explicitly selected isolated branch.");
  assert.equal(new URL(process.env.DATABASE_URL).hostname, expectedHost);
  assert.notEqual(expectedHost.replace("-pooler.", "."), "ep-quiet-art-ag937ry6.c-2.eu-central-1.aws.neon.tech");
  const changedOsis = "Gen.1.1";
  const absentOsis = "Gen.1.2";
  try {
    await sql.transaction((transaction) => [
      transaction.query("UPDATE bible_verses SET text='Synthetic isolated-branch conflict' WHERE translation_id=$1 AND osis=$2", [source.id, changedOsis]),
      transaction.query("DELETE FROM bible_verses WHERE translation_id=$1 AND osis=$2", [source.id, absentOsis]),
    ]);
    assert.notEqual(importAgain().status, 0, "Corrupted existing text must cause the import to fail.");
    const absent = await sql.query("SELECT 1 FROM bible_verses WHERE translation_id=$1 AND osis=$2", [source.id, absentOsis]);
    assert.equal(absent.length, 0, "New rows must roll back with the failed import.");
    console.log("Rollback passed: mismatched stored text aborted the transaction and rolled back a newly inserted verse.");
  } finally {
    await sql.transaction((transaction) => [
      transaction.query("UPDATE bible_verses SET text=$3 WHERE translation_id=$1 AND osis=$2", [source.id, changedOsis, byOsis.get(changedOsis)]),
      transaction.query("INSERT INTO bible_verses(translation_id,osis,text) VALUES($1,$2,$3) ON CONFLICT(translation_id,osis) DO UPDATE SET text=EXCLUDED.text", [source.id, absentOsis, byOsis.get(absentOsis)]),
    ]);
  }
  assert.equal(importAgain().status, 0, "Restored branch must match the full source again.");
}
