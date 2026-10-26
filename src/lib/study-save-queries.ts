import type { NeonQueryFunctionInTransaction } from '@neondatabase/serverless';
import type { z } from 'zod';
import type { studyInputSchema } from './content-validation.ts';
import type { ExtractedPdfDocument } from './pdf-extract-core.ts';
import { canonicalStudyRelationPair } from './study-relations.ts';
import { SERIES_EDIT_LOCK, seriesMembershipQueries } from './study-series-editing.ts';
import { DETECTOR_VERSION, detectScriptureReferences, mergeScriptureReferenceRanges } from './scripture-references.ts';

export type StudyInput = z.infer<typeof studyInputSchema>;
export type PreparedStudyPdf = {
  buffer: Buffer;
  filename: string;
  hash: string;
  extraction: ExtractedPdfDocument;
  candidates: ReturnType<typeof detectScriptureReferences>;
  finalizedReferences: ReturnType<typeof mergeScriptureReferenceRanges>;
};
export type StoredStudyPdf = { storageKind: 'blob' | 'database'; storageKey: string; fileData: Buffer | null };

export function studyMetadataQueries(transaction: NeonQueryFunctionInTransaction<false, false>, studyId: string, data: StudyInput, status: 'draft' | 'published') {
  const relatedStudyPairs = [...new Set(data.relatedStudyIds)]
    .map((relatedStudyId) => canonicalStudyRelationPair(studyId, relatedStudyId))
    .filter((pair) => pair !== null);
  return [
    transaction.query(SERIES_EDIT_LOCK),
    data.id
      ? transaction.query(`UPDATE studies SET slug=$2,title=$3,summary=$4,seo_title=NULLIF($5,''),seo_description=NULLIF($6,''),status=$7,featured=$8,sort_order=$9,updated_at=now(),published_at=CASE WHEN $7='published' THEN COALESCE(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING id::text`, [studyId, data.slug, data.title, data.summary, data.seoTitle, data.seoDescription, status, data.featured, data.sortOrder])
      : transaction.query(`INSERT INTO studies(id,slug,title,summary,seo_title,seo_description,status,featured,sort_order,published_at) VALUES($1,$2,$3,$4,NULLIF($5,''),NULLIF($6,''),$7,$8,$9,CASE WHEN $7='published' THEN now() END) RETURNING id::text`, [studyId, data.slug, data.title, data.summary, data.seoTitle, data.seoDescription, status, data.featured, data.sortOrder]),
    transaction.query("DELETE FROM study_topics WHERE study_id=$1", [studyId]),
    ...data.topicIds.map((topicId, index) =>
      transaction.query("INSERT INTO study_topics(study_id,topic_id,sort_order) VALUES($1,$2,$3)", [studyId, topicId, index])),
    transaction.query("DELETE FROM study_videos WHERE study_id=$1", [studyId]),
    ...data.relatedVideoIds.map((videoId, index) =>
      transaction.query("INSERT INTO study_videos(study_id,video_id,sort_order) VALUES($1,$2,$3)", [studyId, videoId, index])),
    transaction.query("DELETE FROM study_relations WHERE study_a_id=$1 OR study_b_id=$1", [studyId]),
    ...relatedStudyPairs.map((pair, index) =>
      transaction.query(
        "INSERT INTO study_relations(study_a_id,study_b_id,sort_order) VALUES($1,$2,$3)",
        [pair.studyAId, pair.studyBId, index],
      )),
    ...seriesMembershipQueries(transaction, studyId, data.seriesId, data.seriesPosition),
  ];
}

export function studyPdfQueries(transaction: NeonQueryFunctionInTransaction<false, false>, studyId: string, documentId: string, version: number, prepared: PreparedStudyPdf, stored: StoredStudyPdf) {
  const { buffer, filename, hash, extraction, candidates, finalizedReferences } = prepared;
  const pages = extraction.pages;
  return [
    transaction.query(`INSERT INTO study_documents(id,study_id,version_number,original_filename,byte_size,sha256,storage_kind,storage_key,file_data,extraction_status,extraction_error,extracted_text,article_content,article_extraction_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'complete',NULL,$10,$11::jsonb,$12)`, [documentId, studyId, version, filename, buffer.length, hash, stored.storageKind, stored.storageKey, stored.fileData, pages.join("\n\n"), JSON.stringify(extraction.article), extraction.article.version]),
    ...candidates.map((candidate, index) => {
      const referenceValues = [documentId, candidate.rawText, candidate.displayLabel, candidate.bookCode, candidate.startChapter, candidate.startVerse, candidate.endChapter, candidate.endVerse, candidate.osisStart, candidate.osisEnd, candidate.pageNumber, candidate.contextSnippet, DETECTOR_VERSION, index];
      return transaction.query(`INSERT INTO study_reference_candidates(document_id,raw_text,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,page_number,context_snippet,detector_version,review_status,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'accepted',$14)`, referenceValues);
    }),
    ...finalizedReferences.map((reference, index) => transaction.query(`INSERT INTO study_scripture_references(study_id,document_id,display_label,book_code,start_chapter,start_verse,end_chapter,end_verse,osis_start,osis_end,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [studyId, documentId, reference.displayLabel, reference.bookCode, reference.startChapter, reference.startVerse, reference.endChapter, reference.endVerse, reference.osisStart, reference.osisEnd, index])),
    transaction.query("UPDATE studies SET published_document_id=$2,reference_reviewed=true,updated_at=now() WHERE id=$1", [studyId, documentId]),
  ];
}
