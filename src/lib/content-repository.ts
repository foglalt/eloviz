import "server-only";
import {
  CATALOG_SEARCH_LIMIT,
  foldCatalogSearchText,
  normalizeCatalogSearchQuery,
  searchBundledCatalog,
  type CatalogSearchItem,
  type CatalogSearchResults,
} from "./catalog-search";
import { defaultStudies, defaultTopics, defaultVideos } from "./content-defaults";
import type {
  ReferenceCandidate,
  ScriptureReference,
  StudyDetail,
  StudyDocumentAdmin,
  StudySummary,
  TopicDetail,
  TopicSummary,
  VideoDetail,
  VideoSummary,
} from "./content-types";
import { getSql } from "./db";

type Row = Record<string, unknown>;

function jsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try { return JSON.parse(value) as T[]; } catch { return []; }
  }
  return [];
}

function mapTopic(row: Row): TopicSummary {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    studyCount: Number(row.study_count ?? 0),
    videoCount: Number(row.video_count ?? 0),
  };
}

function mapReference(value: unknown): ScriptureReference {
  const row = value as Row;
  return {
    id: row.id ? String(row.id) : undefined,
    label: String(row.label ?? row.display_label ?? ""),
    osisStart: String(row.osisStart ?? row.osis_start ?? ""),
    osisEnd: String(row.osisEnd ?? row.osis_end ?? ""),
    bookCode: row.bookCode ? String(row.bookCode) : row.book_code ? String(row.book_code) : undefined,
    startChapter: row.startChapter ? Number(row.startChapter) : row.start_chapter ? Number(row.start_chapter) : undefined,
    startVerse: row.startVerse ? Number(row.startVerse) : row.start_verse ? Number(row.start_verse) : undefined,
    endChapter: row.endChapter ? Number(row.endChapter) : row.end_chapter ? Number(row.end_chapter) : undefined,
    endVerse: row.endVerse ? Number(row.endVerse) : row.end_verse ? Number(row.end_verse) : undefined,
  };
}

function mapStudy(row: Row): StudySummary {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    status: row.status === "draft" ? "draft" : "published",
    pdfUrl: row.document_id ? `/api/documents/${row.document_id}` : String(row.pdf_url ?? ""),
    pdfFilename: row.original_filename ? String(row.original_filename) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
    topics: jsonArray<Row>(row.topics).map(mapTopic),
    references: jsonArray<Row>(row.references).map(mapReference),
  };
}

function mapVideo(row: Row): VideoSummary {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    seoTitle: row.seo_title ? String(row.seo_title) : null,
    seoDescription: row.seo_description ? String(row.seo_description) : null,
    youtubeUrl: String(row.youtube_url),
    youtubeId: String(row.youtube_id),
    channelName: row.channel_name ? String(row.channel_name) : null,
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : `https://i.ytimg.com/vi/${row.youtube_id}/maxresdefault.jpg`,
    uploadDate: row.upload_date ? String(row.upload_date) : null,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order ?? 0),
    status: row.status === "draft" ? "draft" : "published",
    topics: jsonArray<Row>(row.topics).map(mapTopic),
  };
}

const studiesQuery = `
  SELECT s.id::text, s.slug, s.title, s.summary, s.seo_title, s.seo_description,
    s.status, s.featured, s.sort_order, s.updated_at, d.id::text AS document_id,
    d.original_filename,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id::text, 'slug', t.slug, 'title', t.title, 'description', t.description,
        'featured', t.featured, 'sort_order', t.sort_order
      ) ORDER BY st.sort_order, t.sort_order, t.title)
      FROM study_topics st JOIN topics t ON t.id = st.topic_id
      WHERE st.study_id = s.id AND t.status = 'published'
    ), '[]'::jsonb) AS topics,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id::text, 'label', r.display_label, 'osis_start', r.osis_start,
        'osis_end', r.osis_end, 'book_code', r.book_code, 'start_chapter', r.start_chapter,
        'start_verse', r.start_verse, 'end_chapter', r.end_chapter, 'end_verse', r.end_verse
      ) ORDER BY r.sort_order, r.created_at)
      FROM study_scripture_references r
      WHERE r.study_id = s.id AND r.document_id = s.published_document_id
    ), '[]'::jsonb) AS references
  FROM studies s
  JOIN study_documents d ON d.id = s.published_document_id
  WHERE s.status = 'published'
  ORDER BY s.sort_order, s.title`;

const videosQuery = `
  SELECT v.id::text, v.slug, v.title, v.description, v.youtube_url, v.youtube_id,
    v.channel_name, v.thumbnail_url, v.upload_date, v.seo_title, v.seo_description,
    v.status, v.featured, v.sort_order, v.updated_at,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id::text, 'slug', t.slug, 'title', t.title, 'description', t.description,
        'featured', t.featured, 'sort_order', t.sort_order
      ) ORDER BY vt.sort_order, t.sort_order, t.title)
      FROM video_topics vt JOIN topics t ON t.id = vt.topic_id
      WHERE vt.video_id = v.id AND t.status = 'published'
    ), '[]'::jsonb) AS topics
  FROM videos v
  WHERE v.status = 'published'
  ORDER BY v.sort_order, v.title`;

export async function listPublicTopics() {
  const sql = getSql();
  if (!sql) return defaultTopics;

  try {
    const rows = await sql.query(`
      SELECT t.id::text, t.slug, t.title, t.description, t.seo_title, t.seo_description, t.featured, t.sort_order,
        (SELECT count(*) FROM study_topics st JOIN studies s ON s.id = st.study_id
          WHERE st.topic_id = t.id AND s.status = 'published' AND s.published_document_id IS NOT NULL) AS study_count,
        (SELECT count(*) FROM video_topics vt JOIN videos v ON v.id = vt.video_id
          WHERE vt.topic_id = t.id AND v.status = 'published') AS video_count
      FROM topics t WHERE t.status = 'published'
      ORDER BY t.sort_order, t.title`);
    return (rows as Row[]).map(mapTopic);
  } catch (error) {
    console.error("Unable to load topics; using bundled content.", error);
    return defaultTopics;
  }
}

export async function listPublicStudies() {
  const sql = getSql();
  if (!sql) return defaultStudies;

  try {
    const rows = await sql.query(studiesQuery);
    return (rows as Row[]).map(mapStudy);
  } catch (error) {
    console.error("Unable to load studies; using bundled content.", error);
    return defaultStudies;
  }
}

export async function listPublicVideos() {
  const sql = getSql();
  if (!sql) return defaultVideos;

  try {
    const rows = await sql.query(videosQuery);
    return (rows as Row[]).map(mapVideo);
  } catch (error) {
    console.error("Unable to load videos; using bundled content.", error);
    return defaultVideos;
  }
}

const foldedSqlText = (value: string) =>
  `translate(lower(${value}), 'áéíóöőúüű', 'aeiooouuu')`;

function mapSearchItem(kind: CatalogSearchItem["kind"], row: Row): CatalogSearchItem {
  return {
    id: String(row.id),
    kind,
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    meta: row.meta ? String(row.meta) : null,
  };
}

export async function searchPublicCatalog(rawQuery: string): Promise<CatalogSearchResults> {
  const query = normalizeCatalogSearchQuery(rawQuery);
  const foldedQuery = foldCatalogSearchText(query);
  const emptyResults = { query, topics: [], studies: [], videos: [], total: 0 };

  if (foldedQuery.length < 2) return emptyResults;

  const sql = getSql();
  if (!sql) {
    return searchBundledCatalog(query, defaultTopics, defaultStudies, defaultVideos);
  }

  try {
    const topicSearchText = foldedSqlText("concat_ws(' ', t.title, t.slug, t.description)");
    const studySearchText = foldedSqlText(
      "concat_ws(' ', s.title, s.slug, s.summary, topic_data.search_topics)",
    );
    const videoSearchText = foldedSqlText(
      "concat_ws(' ', v.title, v.slug, v.description, v.channel_name, topic_data.search_topics)",
    );

    const [topicRows, studyRows, videoRows] = await Promise.all([
      sql.query(`
        SELECT t.id::text, t.slug, t.title, t.description,
          concat(
            (SELECT count(*) FROM study_topics st JOIN studies s ON s.id = st.study_id
              WHERE st.topic_id = t.id AND s.status = 'published' AND s.published_document_id IS NOT NULL),
            ' tanulmány · ',
            (SELECT count(*) FROM video_topics vt JOIN videos v ON v.id = vt.video_id
              WHERE vt.topic_id = t.id AND v.status = 'published'),
            ' videó'
          ) AS meta
        FROM topics t
        WHERE t.status = 'published'
          AND position($1 in ${topicSearchText}) > 0
        ORDER BY
          CASE
            WHEN ${foldedSqlText("t.title")} = $1 THEN 0
            WHEN position($1 in ${foldedSqlText("t.title")}) = 1 THEN 1
            WHEN position($1 in ${foldedSqlText("t.title")}) > 0 THEN 2
            ELSE 3
          END,
          t.sort_order,
          t.title
        LIMIT $2
      `, [foldedQuery, CATALOG_SEARCH_LIMIT]),
      sql.query(`
        SELECT s.id::text, s.slug, s.title, s.summary AS description,
          COALESCE(topic_data.topic_names, 'PDF-tanulmány') AS meta
        FROM studies s
        JOIN study_documents d ON d.id = s.published_document_id
        LEFT JOIN LATERAL (
          SELECT
            string_agg(t.title, ' · ' ORDER BY st.sort_order, t.sort_order, t.title) AS topic_names,
            string_agg(concat_ws(' ', t.title, t.description), ' ') AS search_topics
          FROM study_topics st
          JOIN topics t ON t.id = st.topic_id AND t.status = 'published'
          WHERE st.study_id = s.id
        ) topic_data ON true
        WHERE s.status = 'published'
          AND position($1 in ${studySearchText}) > 0
        ORDER BY
          CASE
            WHEN ${foldedSqlText("s.title")} = $1 THEN 0
            WHEN position($1 in ${foldedSqlText("s.title")}) = 1 THEN 1
            WHEN position($1 in ${foldedSqlText("s.title")}) > 0 THEN 2
            ELSE 3
          END,
          s.sort_order,
          s.title
        LIMIT $2
      `, [foldedQuery, CATALOG_SEARCH_LIMIT]),
      sql.query(`
        SELECT v.id::text, v.slug, v.title, v.description,
          COALESCE(v.channel_name, 'Videóajánló') AS meta
        FROM videos v
        LEFT JOIN LATERAL (
          SELECT string_agg(concat_ws(' ', t.title, t.description), ' ') AS search_topics
          FROM video_topics vt
          JOIN topics t ON t.id = vt.topic_id AND t.status = 'published'
          WHERE vt.video_id = v.id
        ) topic_data ON true
        WHERE v.status = 'published'
          AND position($1 in ${videoSearchText}) > 0
        ORDER BY
          CASE
            WHEN ${foldedSqlText("v.title")} = $1 THEN 0
            WHEN position($1 in ${foldedSqlText("v.title")}) = 1 THEN 1
            WHEN position($1 in ${foldedSqlText("v.title")}) > 0 THEN 2
            ELSE 3
          END,
          v.sort_order,
          v.title
        LIMIT $2
      `, [foldedQuery, CATALOG_SEARCH_LIMIT]),
    ]);

    const topics = (topicRows as Row[]).map((row) => mapSearchItem("topic", row));
    const studies = (studyRows as Row[]).map((row) => mapSearchItem("study", row));
    const videos = (videoRows as Row[]).map((row) => mapSearchItem("video", row));
    return {
      query,
      topics,
      studies,
      videos,
      total: topics.length + studies.length + videos.length,
    };
  } catch (error) {
    console.error("Unable to search the catalogue; using bundled content.", error);
    return searchBundledCatalog(query, defaultTopics, defaultStudies, defaultVideos);
  }
}

export async function getTopicBySlug(slug: string): Promise<TopicDetail | null> {
  const [topics, studies, videos] = await Promise.all([listPublicTopics(), listPublicStudies(), listPublicVideos()]);
  const topic = topics.find((item) => item.slug === slug);
  if (!topic) return null;
  return {
    ...topic,
    studies: studies.filter((study) => study.topics.some((item) => item.id === topic.id)),
    videos: videos.filter((video) => video.topics.some((item) => item.id === topic.id)),
  };
}

export async function getStudyBySlug(slug: string): Promise<StudyDetail | null> {
  const [studies, videos] = await Promise.all([listPublicStudies(), listPublicVideos()]);
  const study = studies.find((item) => item.slug === slug);
  if (!study) return null;

  let relatedIds: string[] = [];
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql.query("SELECT video_id::text AS id FROM study_videos WHERE study_id = $1 ORDER BY sort_order", [study.id]);
      relatedIds = (rows as Row[]).map((row) => String(row.id));
    } catch { relatedIds = []; }
  }

  return {
    ...study,
    relatedVideos: relatedIds.length
      ? videos.filter((video) => relatedIds.includes(video.id))
      : videos.filter((video) => video.topics.some((topic) => study.topics.some((item) => item.id === topic.id))).slice(0, 3),
  };
}

export async function getVideoBySlug(slug: string): Promise<VideoDetail | null> {
  const [videos, studies] = await Promise.all([listPublicVideos(), listPublicStudies()]);
  const video = videos.find((item) => item.slug === slug);
  if (!video) return null;

  let relatedIds: string[] = [];
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql.query("SELECT study_id::text AS id FROM study_videos WHERE video_id = $1 ORDER BY sort_order", [video.id]);
      relatedIds = (rows as Row[]).map((row) => String(row.id));
    } catch { relatedIds = []; }
  }

  return {
    ...video,
    relatedStudies: relatedIds.length
      ? studies.filter((study) => relatedIds.includes(study.id))
      : studies.filter((study) => study.topics.some((topic) => video.topics.some((item) => item.id === topic.id))).slice(0, 3),
  };
}

export type AdminTopic = TopicSummary & { status: "draft" | "published"; seoTitle: string; seoDescription: string };
export type AdminStudy = Omit<StudySummary, "pdfUrl"> & {
  seoTitle: string;
  seoDescription: string;
  publishedDocumentId: string | null;
  referenceReviewed: boolean;
  documents: StudyDocumentAdmin[];
  relatedVideoIds: string[];
};
export type AdminStudyIndexItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  documentCount: number;
  hasPublishedDocument: boolean;
  hasPendingDocument: boolean;
};
export type AdminStudyIndexPage = {
  items: AdminStudyIndexItem[];
  total: number;
  page: number;
  pageCount: number;
};
export type AdminStudyOption = {
  id: string;
  title: string;
  status: "draft" | "published";
};
export type AdminContentIndexItem = {
  id: string;
  title: string;
  meta: string;
  status: "draft" | "published";
};
export type AdminContentIndexPage = {
  items: AdminContentIndexItem[];
  total: number;
  page: number;
  pageCount: number;
};
export type AdminOverview = {
  topicCount: number;
  studyCount: number;
  videoCount: number;
  pendingStudies: { id: string; title: string }[];
};
export type AdminVideo = VideoSummary & { seoTitle: string; seoDescription: string; relatedStudyIds: string[] };

export const ADMIN_INDEX_PAGE_SIZE = 30;

type SimpleAdminIndexDefinition = {
  table: "topics" | "videos";
  metaExpression: string;
};

async function listSimpleAdminIndex(
  definition: SimpleAdminIndexDefinition,
  search = "",
  requestedPage = 1,
): Promise<AdminContentIndexPage> {
  const sql = getSql();
  if (!sql) return { items: [], total: 0, page: 1, pageCount: 1 };
  const normalizedSearch = search.trim().slice(0, 120);
  const countRows = await sql.query(`
    SELECT count(*)::int AS count
    FROM ${definition.table} content
    WHERE $1 = ''
      OR strpos(lower(content.title), lower($1)) > 0
      OR strpos(lower(content.slug), lower($1)) > 0`, [normalizedSearch]);
  const total = Number(countRows[0]?.count ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_INDEX_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  const rows = await sql.query(`
    SELECT content.id::text, content.title, content.status,
      ${definition.metaExpression} AS meta
    FROM ${definition.table} content
    WHERE $1 = ''
      OR strpos(lower(content.title), lower($1)) > 0
      OR strpos(lower(content.slug), lower($1)) > 0
    ORDER BY content.sort_order, content.title
    LIMIT $2 OFFSET $3`, [normalizedSearch, ADMIN_INDEX_PAGE_SIZE, (page - 1) * ADMIN_INDEX_PAGE_SIZE]);

  return {
    items: (rows as Row[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      meta: String(row.meta),
      status: row.status === "published" ? "published" : "draft",
    })),
    total,
    page,
    pageCount,
  };
}

async function listAdminOptions(table: "topics" | "studies" | "videos"): Promise<AdminStudyOption[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT id::text, title, status FROM ${table} ORDER BY sort_order, title`);
  return (rows as Row[]).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    status: row.status === "published" ? "published" : "draft",
  }));
}

export function listAdminTopicIndex(search = "", requestedPage = 1) {
  return listSimpleAdminIndex(
    { table: "topics", metaExpression: "'/' || content.slug" },
    search,
    requestedPage,
  );
}

export function listAdminVideoIndex(search = "", requestedPage = 1) {
  return listSimpleAdminIndex(
    { table: "videos", metaExpression: "COALESCE(NULLIF(content.channel_name, ''), 'Csatorna nélkül')" },
    search,
    requestedPage,
  );
}

export async function getAdminTopic(id: string): Promise<AdminTopic | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql.query(`
    SELECT id::text, slug, title, description, featured, sort_order, status,
      COALESCE(seo_title, '') AS seo_title,
      COALESCE(seo_description, '') AS seo_description
    FROM topics
    WHERE id = $1`, [id]);
  const row = (rows as Row[])[0];
  return row
    ? {
        ...mapTopic(row),
        status: row.status === "published" ? "published" : "draft",
        seoTitle: String(row.seo_title),
        seoDescription: String(row.seo_description),
      }
    : null;
}

export function listAdminTopicOptions() {
  return listAdminOptions("topics");
}

export async function getAdminStudy(id: string): Promise<AdminStudy | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql.query(`
    SELECT s.id::text, s.slug, s.title, s.summary, s.status, s.featured, s.sort_order,
      s.updated_at, s.published_document_id::text, s.reference_reviewed,
      COALESCE(s.seo_title, '') AS seo_title, COALESCE(s.seo_description, '') AS seo_description,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', t.id::text, 'slug', t.slug, 'title', t.title, 'description', t.description, 'featured', t.featured, 'sort_order', t.sort_order) ORDER BY t.sort_order) FROM study_topics st JOIN topics t ON t.id = st.topic_id WHERE st.study_id = s.id), '[]'::jsonb) AS topics,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', r.id::text, 'label', r.display_label, 'osis_start', r.osis_start, 'osis_end', r.osis_end) ORDER BY r.sort_order) FROM study_scripture_references r WHERE r.study_id = s.id AND r.document_id = s.published_document_id), '[]'::jsonb) AS references,
      COALESCE((SELECT jsonb_agg(video_id::text ORDER BY sort_order) FROM study_videos WHERE study_id = s.id), '[]'::jsonb) AS related_video_ids
    FROM studies s
    WHERE s.id = $1`, [id]);
  const row = (rows as Row[])[0];
  if (!row) return null;

  const documentRows = await sql.query(`
    SELECT d.id::text, d.version_number, d.original_filename, d.byte_size, d.extraction_status,
      d.extraction_error, d.created_at,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', c.id::text, 'raw_text', c.raw_text, 'label', c.display_label,
        'osis_start', c.osis_start, 'osis_end', c.osis_end, 'page_number', c.page_number,
        'context_snippet', c.context_snippet, 'review_status', c.review_status
      ) ORDER BY c.sort_order) FROM study_reference_candidates c WHERE c.document_id = d.id), '[]'::jsonb) AS candidates
    FROM study_documents d WHERE d.study_id = $1 ORDER BY d.version_number DESC`, [id]);
  const documents: StudyDocumentAdmin[] = (documentRows as Row[]).map((document) => ({
    id: String(document.id),
    versionNumber: Number(document.version_number),
    originalFilename: String(document.original_filename),
    byteSize: Number(document.byte_size),
    extractionStatus: document.extraction_status as StudyDocumentAdmin["extractionStatus"],
    extractionError: document.extraction_error ? String(document.extraction_error) : null,
    createdAt: String(document.created_at),
    candidates: jsonArray<Row>(document.candidates).map((candidate): ReferenceCandidate => ({
      ...mapReference(candidate),
      id: String(candidate.id),
      rawText: String(candidate.raw_text),
      pageNumber: candidate.page_number ? Number(candidate.page_number) : null,
      contextSnippet: candidate.context_snippet ? String(candidate.context_snippet) : null,
      reviewStatus: candidate.review_status as ReferenceCandidate["reviewStatus"],
    })),
  }));

  return {
    ...mapStudy({ ...row, document_id: row.published_document_id }),
    seoTitle: String(row.seo_title),
    seoDescription: String(row.seo_description),
    publishedDocumentId: row.published_document_id ? String(row.published_document_id) : null,
    referenceReviewed: Boolean(row.reference_reviewed),
    documents,
    relatedVideoIds: jsonArray<string>(row.related_video_ids),
  };
}

export async function listAdminStudyIndex(
  search = "",
  requestedPage = 1,
): Promise<AdminStudyIndexPage> {
  const sql = getSql();
  if (!sql) return { items: [], total: 0, page: 1, pageCount: 1 };
  const normalizedSearch = search.trim().slice(0, 120);
  const countRows = await sql.query(`
    SELECT count(*)::int AS count
    FROM studies s
    WHERE $1 = ''
      OR strpos(lower(s.title), lower($1)) > 0
      OR strpos(lower(s.slug), lower($1)) > 0`, [normalizedSearch]);
  const total = Number(countRows[0]?.count ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_INDEX_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  const rows = await sql.query(`
    SELECT s.id::text, s.title, s.slug, s.status,
      (SELECT count(*)::int FROM study_documents d WHERE d.study_id = s.id) AS document_count,
      (s.published_document_id IS NOT NULL) AS has_published_document,
      COALESCE((
        SELECT d.id IS DISTINCT FROM s.published_document_id
        FROM study_documents d
        WHERE d.study_id = s.id
        ORDER BY d.version_number DESC
        LIMIT 1
      ), false) AS has_pending_document
    FROM studies s
    WHERE $1 = ''
      OR strpos(lower(s.title), lower($1)) > 0
      OR strpos(lower(s.slug), lower($1)) > 0
    ORDER BY s.sort_order, s.title
    LIMIT $2 OFFSET $3`, [normalizedSearch, ADMIN_INDEX_PAGE_SIZE, (page - 1) * ADMIN_INDEX_PAGE_SIZE]);

  return {
    items: (rows as Row[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      slug: String(row.slug),
      status: row.status === "published" ? "published" : "draft",
      documentCount: Number(row.document_count ?? 0),
      hasPublishedDocument: Boolean(row.has_published_document),
      hasPendingDocument: Boolean(row.has_pending_document),
    })),
    total,
    page,
    pageCount,
  };
}

export async function listAdminStudyOptions(): Promise<AdminStudyOption[]> {
  return listAdminOptions("studies");
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const sql = getSql();
  if (!sql) return { topicCount: 0, studyCount: 0, videoCount: 0, pendingStudies: [] };
  const counts = await sql.query(`
    SELECT
      (SELECT count(*)::int FROM topics) AS topic_count,
      (SELECT count(*)::int FROM studies) AS study_count,
      (SELECT count(*)::int FROM videos) AS video_count`);
  const pendingRows = await sql.query(`
    SELECT s.id::text, s.title
    FROM studies s
    WHERE COALESCE((
      SELECT d.id IS DISTINCT FROM s.published_document_id
      FROM study_documents d
      WHERE d.study_id = s.id
      ORDER BY d.version_number DESC
      LIMIT 1
    ), false)
    ORDER BY s.updated_at DESC, s.title
    LIMIT 20`);

  return {
    topicCount: Number(counts[0]?.topic_count ?? 0),
    studyCount: Number(counts[0]?.study_count ?? 0),
    videoCount: Number(counts[0]?.video_count ?? 0),
    pendingStudies: (pendingRows as Row[]).map((row) => ({ id: String(row.id), title: String(row.title) })),
  };
}

export async function getAdminVideo(id: string): Promise<AdminVideo | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql.query(`
    SELECT v.*, v.id::text,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', t.id::text, 'slug', t.slug, 'title', t.title, 'description', t.description, 'featured', t.featured, 'sort_order', t.sort_order) ORDER BY t.sort_order) FROM video_topics vt JOIN topics t ON t.id = vt.topic_id WHERE vt.video_id = v.id), '[]'::jsonb) AS topics,
      COALESCE((SELECT jsonb_agg(study_id::text ORDER BY sort_order) FROM study_videos WHERE video_id = v.id), '[]'::jsonb) AS related_study_ids
    FROM videos v
    WHERE v.id = $1`, [id]);
  const row = (rows as Row[])[0];
  return row
    ? {
        ...mapVideo(row),
        seoTitle: String(row.seo_title ?? ""),
        seoDescription: String(row.seo_description ?? ""),
        relatedStudyIds: jsonArray<string>(row.related_study_ids),
      }
    : null;
}

export function listAdminVideoOptions() {
  return listAdminOptions("videos");
}
