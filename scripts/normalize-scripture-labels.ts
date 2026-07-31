import { neon } from "@neondatabase/serverless";
import {
  DETECTOR_VERSION,
  formatOsisReference,
  mergeScriptureReferenceRanges,
} from "../src/lib/scripture-references.ts";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const sql = neon(databaseUrl);

type ReferenceRow = {
  id: string;
  display_label: string;
  osis_start: string;
  osis_end: string;
};

const candidateRows = await sql.query(
  "SELECT id::text, display_label, osis_start, osis_end FROM study_reference_candidates",
) as ReferenceRow[];
const finalizedRows = await sql.query(
  "SELECT id::text, display_label, osis_start, osis_end FROM study_scripture_references",
) as ReferenceRow[];

const labelUpdates = [
  ...candidateRows.flatMap((row) => {
    const label = formatOsisReference(row.osis_start, row.osis_end);
    return label && label !== row.display_label
      ? [sql.query(
          "UPDATE study_reference_candidates SET display_label=$2 WHERE id=$1",
          [row.id, label],
        )]
      : [];
  }),
  ...finalizedRows.flatMap((row) => {
    const label = formatOsisReference(row.osis_start, row.osis_end);
    return label && label !== row.display_label
      ? [sql.query(
          "UPDATE study_scripture_references SET display_label=$2 WHERE id=$1",
          [row.id, label],
        )]
      : [];
  }),
];

if (labelUpdates.length > 0) await sql.transaction(labelUpdates);

const pendingDocuments = await sql.query(`
  SELECT d.id::text, d.study_id::text
  FROM study_documents d
  JOIN studies s ON s.id = d.study_id
  WHERE d.extraction_status = 'complete'
    AND d.id = (
      SELECT latest.id
      FROM study_documents latest
      WHERE latest.study_id = d.study_id
      ORDER BY latest.version_number DESC
      LIMIT 1
    )
    AND d.id IS DISTINCT FROM s.published_document_id
`) as { id: string; study_id: string }[];

let finalizedDocumentCount = 0;
let finalizedReferenceCount = 0;

for (const document of pendingDocuments) {
  const candidates = await sql.query(`
    SELECT display_label, book_code, start_chapter, start_verse, end_chapter, end_verse,
      osis_start, osis_end, sort_order
    FROM study_reference_candidates
    WHERE document_id=$1
    ORDER BY sort_order
  `, [document.id]) as Array<{
    display_label: string;
    book_code: string;
    start_chapter: number;
    start_verse: number;
    end_chapter: number;
    end_verse: number;
    osis_start: string;
    osis_end: string;
    sort_order: number;
  }>;
  const finalizedReferences = mergeScriptureReferenceRanges(candidates.map((candidate) => ({
    displayLabel: candidate.display_label,
    bookCode: candidate.book_code,
    startChapter: candidate.start_chapter,
    startVerse: candidate.start_verse,
    endChapter: candidate.end_chapter,
    endVerse: candidate.end_verse,
    osisStart: candidate.osis_start,
    osisEnd: candidate.osis_end,
  })));

  await sql.transaction((transaction) => [
    transaction.query(
      "UPDATE study_reference_candidates SET review_status='accepted', detector_version=$2 WHERE document_id=$1",
      [document.id, DETECTOR_VERSION],
    ),
    transaction.query(
      "DELETE FROM study_scripture_references WHERE study_id=$1 AND document_id=$2",
      [document.study_id, document.id],
    ),
    ...finalizedReferences.map((reference, index) => transaction.query(`
      INSERT INTO study_scripture_references(
        study_id,document_id,display_label,book_code,start_chapter,start_verse,
        end_chapter,end_verse,osis_start,osis_end,sort_order
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [
      document.study_id,
      document.id,
      reference.displayLabel,
      reference.bookCode,
      reference.startChapter,
      reference.startVerse,
      reference.endChapter,
      reference.endVerse,
      reference.osisStart,
      reference.osisEnd,
      index,
    ])),
    transaction.query(
      "UPDATE studies SET published_document_id=$2,reference_reviewed=true,updated_at=now() WHERE id=$1",
      [document.study_id, document.id],
    ),
  ]);

  finalizedDocumentCount += 1;
  finalizedReferenceCount += finalizedReferences.length;
}

console.log(JSON.stringify({
  normalizedLabels: labelUpdates.length,
  finalizedDocuments: finalizedDocumentCount,
  finalizedReferences: finalizedReferenceCount,
}));
