import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { extractPdfDocument } from "../src/lib/pdf-extract-core.ts";
import { DETECTOR_VERSION, detectScriptureReferences, mergeScriptureReferenceRanges } from "../src/lib/scripture-references.ts";

const argument = (name: string) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const slug = argument("slug");
const documentId = argument("document");
const pdfPath = argument("pdf");
const articleOnly = process.argv.includes("--article-only");
if (!slug || !documentId || !pdfPath || !process.env.DATABASE_URL) {
  throw new Error("Supply DATABASE_URL and --slug, --document, --pdf. Dry-run is default; --apply writes with backup and stale-document guard.");
}
const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(`SELECT s.id::text AS study_id,s.title,s.slug,s.updated_at::text,s.published_at::text,s.status,
  s.published_document_id::text,d.id::text AS document_id,d.sha256,d.byte_size,
  d.article_content,d.article_extraction_version,d.extracted_text
  FROM studies s JOIN study_documents d ON d.id=s.published_document_id
  WHERE s.slug=$1 AND d.id=$2 AND d.extraction_status='complete'`, [slug,documentId]);
assert.equal(rows.length,1,"Expected exact current complete document");
const row = rows[0];
const bytes = await readFile(pdfPath);
assert.equal(bytes.length,Number(row.byte_size),"PDF size mismatch");
assert.equal(createHash("sha256").update(bytes).digest("hex"),row.sha256,"PDF checksum mismatch");
const extraction = await extractPdfDocument(bytes,String(row.title));
assert.ok(extraction.article.blocks.length,"No extracted content");
if (articleOnly) assert.equal(extraction.pages.join("\n\n"),row.extracted_text,"Article-only repair requires unchanged extracted text");
const candidates = detectScriptureReferences(extraction.pages);
const references = mergeScriptureReferenceRanges(candidates);
const quoteCount = extraction.article.blocks.filter((block) => block.type === "scripture").length;
if (process.argv.includes("--expect-no-quotes")) assert.equal(quoteCount,0,"Unexpected quotation styling");
console.log(JSON.stringify({slug,documentId,version:extraction.article.version,blocks:extraction.article.blocks.length,
  quotes:quoteCount,listItems:extraction.article.blocks.filter((block)=>block.type==="list").map((block)=>block.items.length),
  candidates:candidates.length,references:references.length,articleOnly,write:process.argv.includes("--apply")}));
if (process.argv.includes("--apply")) {
  const [oldCandidates,oldReferences] = await Promise.all([
    sql.query("SELECT * FROM study_reference_candidates WHERE document_id=$1 ORDER BY sort_order",[documentId]),
    sql.query("SELECT * FROM study_scripture_references WHERE document_id=$1 ORDER BY sort_order",[documentId]),
  ]);
  await mkdir("tmp/backups",{recursive:true});
  const backupPath = `tmp/backups/study-${documentId}-${Date.now()}.json`;
  await writeFile(backupPath,JSON.stringify({document:row,candidates:oldCandidates,references:oldReferences},null,2));
  await sql.transaction((transaction)=>[
    transaction.query("SELECT s.id FROM studies s JOIN study_documents d ON d.study_id=s.id WHERE s.id=$1 AND d.id=$2 FOR UPDATE OF s,d",[row.study_id,documentId]),
    // The transaction aborts before changes if an editor replaced/changed this snapshot.
    transaction.query(`SELECT 1 / CASE WHEN EXISTS (
      SELECT 1 FROM studies s JOIN study_documents d ON d.id=s.published_document_id
      WHERE s.id=$1 AND d.id=$2 AND s.updated_at=$3::timestamptz AND d.sha256=$4
      AND d.article_content IS NOT DISTINCT FROM $5::jsonb
    ) THEN 1 ELSE 0 END AS snapshot_guard`,[row.study_id,documentId,row.updated_at,row.sha256,JSON.stringify(row.article_content)]),
    ...(articleOnly ? [transaction.query("UPDATE study_documents SET article_content=$2::jsonb,article_extraction_version=$3 WHERE id=$1",[documentId,JSON.stringify(extraction.article),extraction.article.version])] : [
    transaction.query("UPDATE study_documents SET article_content=$2::jsonb,article_extraction_version=$3,extracted_text=$4 WHERE id=$1",[documentId,JSON.stringify(extraction.article),extraction.article.version,extraction.pages.join("\n\n")]),
    transaction.query("DELETE FROM study_reference_candidates WHERE document_id=$1",[documentId]),
    transaction.query("DELETE FROM study_scripture_references WHERE document_id=$1",[documentId]),
    ...candidates.map((r,index)=>transaction.query(`INSERT INTO study_reference_candidates(document_id,raw_text,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,page_number,context_snippet,detector_version,review_status,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'accepted',$14)`,[documentId,r.rawText,r.displayLabel,r.bookCode,r.startChapter,r.startVerse,r.endChapter,r.endVerse,r.osisStart,r.osisEnd,r.pageNumber,r.contextSnippet,DETECTOR_VERSION,index])),
    ...references.map((r,index)=>transaction.query(`INSERT INTO study_scripture_references(study_id,document_id,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,sort_order)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[row.study_id,documentId,r.displayLabel,r.bookCode,r.startChapter,r.startVerse,r.endChapter,r.endVerse,r.osisStart,r.osisEnd,index])),
    ]),
  ]);
  const readback = await sql.query(`SELECT d.article_content,d.sha256,s.published_document_id::text,s.published_at::text,s.updated_at::text
    FROM studies s JOIN study_documents d ON d.id=s.published_document_id WHERE s.id=$1`,[row.study_id]);
  assert.deepEqual(readback[0].article_content,extraction.article);
  assert.equal(readback[0].sha256,row.sha256);
  assert.equal(readback[0].published_document_id,documentId);
  assert.equal(String(readback[0].published_at),String(row.published_at));
  assert.equal(String(readback[0].updated_at),String(row.updated_at));
  if (articleOnly) {
    const [currentCandidates,currentReferences] = await Promise.all([
      sql.query("SELECT * FROM study_reference_candidates WHERE document_id=$1 ORDER BY sort_order",[documentId]),
      sql.query("SELECT * FROM study_scripture_references WHERE document_id=$1 ORDER BY sort_order",[documentId]),
    ]);
    assert.deepEqual(currentCandidates,oldCandidates,"Reference candidates changed during article-only repair");
    assert.deepEqual(currentReferences,oldReferences,"Scripture references changed during article-only repair");
  }
  console.log(`Regenerated only this current document; exact article/hash/publication read-back passed. Backup: ${backupPath}`);
}
