import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required for seeding.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const seed = JSON.parse(await readFile(new URL("../data/seed-content.json", import.meta.url), "utf8"));
const books = JSON.parse(await readFile(new URL("../data/canonical-books.json", import.meta.url), "utf8"));

for (let index = 0; index < books.length; index += 1) {
  const [code, name, testament] = books[index];
  await sql.query(`INSERT INTO canonical_books (code, name_hu, testament, canonical_order)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (code) DO UPDATE SET name_hu = EXCLUDED.name_hu, testament = EXCLUDED.testament, canonical_order = EXCLUDED.canonical_order`,
    [code, name, testament, index + 1]);
}

for (const topic of seed.topics) {
  await sql.query(`INSERT INTO topics (id, slug, title, description, status, featured, sort_order, published_at)
    VALUES ($1, $2, $3, $4, 'published', $5, $6, now())
    ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title,
      description = EXCLUDED.description, featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order,
      updated_at = now()`,
    [topic.id, topic.slug, topic.title, topic.description, topic.featured, topic.sortOrder]);
}

for (const study of seed.studies) {
  await sql.query(`INSERT INTO studies (id, slug, title, summary, status, featured, sort_order, reference_reviewed, published_at)
    VALUES ($1, $2, $3, $4, 'published', $5, $6, true, now())
    ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, summary = EXCLUDED.summary,
      featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order, updated_at = now()`,
    [study.id, study.slug, study.title, study.summary, study.featured, study.sortOrder]);

  const pdfFile = new URL(`../public${study.pdfPath}`, import.meta.url);
  const pdfBuffer = await readFile(pdfFile);
  const pdfStat = await stat(pdfFile);
  const checksum = createHash("sha256").update(pdfBuffer).digest("hex");

  await sql.query(`INSERT INTO study_documents
      (id, study_id, version_number, original_filename, mime_type, byte_size, sha256,
       storage_kind, storage_key, extraction_status, extracted_text)
    VALUES ($1, $2, 1, $3, 'application/pdf', $4, $5, 'static', $6, 'complete', '')
    ON CONFLICT (id) DO UPDATE SET original_filename = EXCLUDED.original_filename,
      byte_size = EXCLUDED.byte_size, sha256 = EXCLUDED.sha256, storage_key = EXCLUDED.storage_key`,
    [study.documentId, study.id, `${study.slug}.pdf`, pdfStat.size, checksum, study.pdfPath]);

  await sql.query("UPDATE studies SET published_document_id = $1, reference_reviewed = true WHERE id = $2", [study.documentId, study.id]);
  await sql.query("DELETE FROM study_topics WHERE study_id = $1", [study.id]);
  for (let index = 0; index < study.topicIds.length; index += 1) {
    await sql.query("INSERT INTO study_topics (study_id, topic_id, sort_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [study.id, study.topicIds[index], index]);
  }

  await sql.query("DELETE FROM study_scripture_references WHERE study_id = $1 AND document_id = $2", [study.id, study.documentId]);
  for (let index = 0; index < study.references.length; index += 1) {
    const reference = study.references[index];
    const [bookCode, startChapter, startVerse] = reference.osisStart.split(".");
    const [, endChapter, endVerse] = reference.osisEnd.split(".");
    await sql.query(`INSERT INTO study_scripture_references
      (study_id, document_id, display_label, book_code, start_chapter, start_verse,
       end_chapter, end_verse, osis_start, osis_end, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [study.id, study.documentId, reference.label, bookCode, Number(startChapter), Number(startVerse), Number(endChapter), Number(endVerse), reference.osisStart, reference.osisEnd, index]);
  }
}

for (const video of seed.videos) {
  await sql.query(`INSERT INTO videos(id,slug,title,description,youtube_url,youtube_id,channel_name,status,featured,sort_order,published_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,'published',$8,$9,now())
    ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,title=EXCLUDED.title,description=EXCLUDED.description,
      youtube_url=EXCLUDED.youtube_url,youtube_id=EXCLUDED.youtube_id,channel_name=EXCLUDED.channel_name,
      featured=EXCLUDED.featured,sort_order=EXCLUDED.sort_order,updated_at=now()`,
    [video.id, video.slug, video.title, video.description, video.youtubeUrl, video.youtubeId, video.channelName, video.featured, video.sortOrder]);
  await sql.query("DELETE FROM video_topics WHERE video_id=$1", [video.id]);
  for (let index = 0; index < video.topicIds.length; index += 1) {
    await sql.query("INSERT INTO video_topics(video_id,topic_id,sort_order) VALUES($1,$2,$3)", [video.id, video.topicIds[index], index]);
  }
  for (let index = 0; index < video.relatedStudyIds.length; index += 1) {
    await sql.query("INSERT INTO study_videos(study_id,video_id,sort_order) VALUES($1,$2,$3) ON CONFLICT(study_id,video_id) DO UPDATE SET sort_order=EXCLUDED.sort_order", [video.relatedStudyIds[index], video.id, index]);
  }
}

console.log(`Seeded ${books.length} books, ${seed.topics.length} topics, ${seed.studies.length} studies and ${seed.videos.length} videos.`);
