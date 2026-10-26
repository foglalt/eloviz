import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {neon} from '@neondatabase/serverless';
import {studyMetadataQueries,studyPdfQueries,type StudyInput,type PreparedStudyPdf} from '../src/lib/study-save-queries.ts';
import {extractPdfDocument} from '../src/lib/pdf-extract-core.ts';
import {detectScriptureReferences,mergeScriptureReferenceRanges} from '../src/lib/scripture-references.ts';
import {resolveStudyPublicationStatus} from '../src/lib/study-publication.ts';

// Every mutating probe ends in a deliberate exception in the SAME transaction.
// No fixture is ever committed or made visible to public readers.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
const sql=neon(process.env.DATABASE_URL);
const buffer=await readFile('public/studies/hogy-el-ne-fogyatkozzon-a-te-hited.pdf');
const extraction=await extractPdfDocument(buffer,'Hogy el ne fogyatkozzon a te hited');
const candidates=detectScriptureReferences(extraction.pages);
const prepared:PreparedStudyPdf={buffer,filename:'ellenorzes.pdf',hash:createHash('sha256').update(buffer).digest('hex'),extraction,candidates,finalizedReferences:mergeScriptureReferenceRanges(candidates)};
const stored={storageKind:'database' as const,storageKey:'rollback-only.pdf',fileData:buffer};
const topic=String((await sql.query('SELECT id::text FROM topics ORDER BY id LIMIT 1'))[0].id);
const video=String((await sql.query('SELECT id::text FROM videos ORDER BY id LIMIT 1'))[0].id);
const related=String((await sql.query('SELECT id::text FROM studies ORDER BY id LIMIT 1'))[0].id);
for (const scenario of ['published-pdf','draft-pdf','draft-only','missing-topic','duplicate-slug','duplicate-revision']) {
 const id=randomUUID(),documentId=randomUUID(),seriesId=randomUUID();
 const slug=`creation-probe-${randomUUID()}`;
 const data:StudyInput={title:'Elkülönített mentési ellenőrzés',slug,summary:'Ellenőrzési szöveg, amelyet minden esetben visszagörgetünk.',status:scenario==='draft-pdf'?'draft':'published',featured:false,sortOrder:0,topicIds:[scenario==='missing-topic'?randomUUID():topic],relatedVideoIds:[video],relatedStudyIds:[related],seriesId,seriesPosition:1,seoTitle:'',seoDescription:''};
 const hasPdf=scenario!=='draft-only';
 const status=resolveStudyPublicationStatus(data.status,hasPdf).status;
 let reachedEnd=false;
 try {
  await sql.transaction(tx=>[
   tx.query("INSERT INTO study_series(id,slug,title,description,status) VALUES($1,$2,'Ellenőrzés','Visszagörgetett ellenőrzési sorozat','draft')",[seriesId,slug]),
   ...studyMetadataQueries(tx,id,data,status),
   ...(hasPdf?studyPdfQueries(tx,id,documentId,1,prepared,stored):[]),
   ...(scenario==='duplicate-slug'?[tx.query('INSERT INTO studies(slug,title,summary,status) VALUES($1,$2,$3,$4)',[slug,data.title,data.summary,'draft'])]:[]),
   ...(scenario==='duplicate-revision'?studyPdfQueries(tx,id,randomUUID(),2,prepared,stored):[]),
   tx.query(`SELECT 1 / CASE WHEN EXISTS(SELECT 1 FROM studies s WHERE s.id=$1 AND s.status=$2 AND (s.published_at IS NOT NULL)=($2='published') AND (s.published_document_id IS NOT NULL)=$3::boolean)
    AND EXISTS(SELECT 1 FROM study_topics WHERE study_id=$1 AND topic_id=$4)
    AND EXISTS(SELECT 1 FROM study_videos WHERE study_id=$1 AND video_id=$5)
    AND EXISTS(SELECT 1 FROM study_relations WHERE study_a_id=$1 OR study_b_id=$1)
    AND EXISTS(SELECT 1 FROM study_series_parts WHERE study_id=$1 AND series_id=$6 AND position=1)
    AND (NOT $3::boolean OR EXISTS(SELECT 1 FROM study_documents WHERE id=$7 AND extraction_status='complete' AND article_content=$8::jsonb))
    AND (SELECT count(*) FROM study_scripture_references WHERE study_id=$1)=$9
    AND (SELECT count(*) FROM study_reference_candidates WHERE document_id=$7 AND review_status='accepted')=$10
    THEN 1 ELSE 0 END AS verification_guard`,[id,status,hasPdf,topic,video,seriesId,documentId,JSON.stringify(extraction.article),hasPdf?prepared.finalizedReferences.length:0,hasPdf?candidates.length:0]),
   tx.query("DO $$ BEGIN RAISE EXCEPTION 'study_creation_probe_passed'; END $$"),
  ]);
  throw new Error('Probe unexpectedly committed');
 } catch(error) {
  const code=(error as {code?:string}).code;
  if(scenario==='missing-topic') assert.equal(code,'23503');
  else if(scenario==='duplicate-slug'||scenario==='duplicate-revision') assert.equal(code,'23505');
  else {assert.match(String((error as Error).message),/study_creation_probe_passed/);reachedEnd=true;}
 }
 assert.equal((await sql.query('SELECT 1 FROM studies WHERE id=$1',[id])).length,0);
 assert.equal((await sql.query('SELECT 1 FROM study_documents WHERE study_id=$1',[id])).length,0);
 assert.equal((await sql.query('SELECT 1 FROM study_series WHERE id=$1',[seriesId])).length,0);
 console.log(`PASS ${scenario}: ${reachedEnd?'full metadata/document/article/reference/relations verified':'constraint failure verified'}; rollback confirmed`);
}
