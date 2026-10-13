import 'server-only';
import { cache } from 'react';
import { getSql } from './db';
import { publishedSeriesParts } from './study-series-core';

export type SeriesPart = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  position: number;
  status: 'draft' | 'published';
  hasPublishedDocument: boolean;
};
export type StudySeries = {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  sourceUrl: string;
  status: 'draft' | 'published';
  updatedAt: string;
  revision: string;
  parts: SeriesPart[];
};
export type SeriesStudyOption = SeriesPart & { seriesId: string | null; seriesTitle: string | null };
type Row = Record<string, unknown>;

function mapPart(row: Row): SeriesPart {
  return {
    id: String(row.id), slug: String(row.slug), title: String(row.title),
    summary: String(row.summary ?? ''), position: Number(row.position ?? 0),
    status: row.status === 'published' ? 'published' : 'draft',
    hasPublishedDocument: Boolean(row.has_published_document),
  };
}

const loadSeries = cache(async (publicOnly: boolean): Promise<StudySeries[]> => {
  const sql = getSql();
  if (!sql) return [];
  const [seriesRows, partRows] = await Promise.all([
    sql.query(`SELECT id::text, slug, title, description, author, source_url, status, updated_at, updated_at::text AS revision
      FROM study_series WHERE NOT $1::boolean OR status='published' ORDER BY title`, [publicOnly]),
    sql.query(`SELECT s.id::text, s.slug, s.title, s.summary, s.status,
      (s.published_document_id IS NOT NULL) AS has_published_document,
      p.series_id::text, p.position
      FROM study_series_parts p JOIN studies s ON s.id=p.study_id
      JOIN study_series series ON series.id=p.series_id
      WHERE NOT $1::boolean OR (series.status='published' AND s.status='published' AND s.published_document_id IS NOT NULL)
      ORDER BY p.position`, [publicOnly]),
  ]);
  return (seriesRows as Row[]).map((row) => {
    const parts = (partRows as Row[]).filter((part) => part.series_id === row.id).map(mapPart);
    return {
      id: String(row.id), slug: String(row.slug), title: String(row.title),
      description: String(row.description), author: String(row.author ?? ''),
      sourceUrl: String(row.source_url ?? ''), status: row.status === 'published' ? 'published' as const : 'draft' as const,
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
      revision: String(row.revision), parts: publicOnly ? publishedSeriesParts(parts) : parts,
    };
  }).filter((series) => !publicOnly || series.parts.length > 0);
});

export async function listPublicSeries() {
  try { return await loadSeries(true); }
  catch (error) {
    console.error('Unable to load public study series.', error);
    return [];
  }
}
export function listAdminSeries() { return loadSeries(false); }
export async function getPublicSeries(slug: string) {
  return (await listPublicSeries()).find((series) => series.slug === slug) ?? null;
}
export async function getAdminSeries(id: string) {
  return (await listAdminSeries()).find((series) => series.id === id) ?? null;
}
export async function getStudySeries(studyId: string) {
  return (await listPublicSeries()).find((series) => series.parts.some((part) => part.id === studyId)) ?? null;
}
export async function listSeriesStudyOptions(): Promise<SeriesStudyOption[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT s.id::text, s.slug, s.title, s.summary, s.status,
    (s.published_document_id IS NOT NULL) AS has_published_document,
    p.position, p.series_id::text, series.title AS series_title
    FROM studies s LEFT JOIN study_series_parts p ON p.study_id=s.id
    LEFT JOIN study_series series ON series.id=p.series_id ORDER BY s.title`);
  return (rows as Row[]).map((row) => ({
    ...mapPart(row), seriesId: row.series_id ? String(row.series_id) : null,
    seriesTitle: row.series_title ? String(row.series_title) : null,
  }));
}

export async function getSeriesDefaultTopicIds(seriesId: string) {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql.query(`SELECT topic_id::text FROM study_topics WHERE study_id=(
    SELECT study_id FROM study_series_parts WHERE series_id=$1 ORDER BY position DESC LIMIT 1
  ) ORDER BY sort_order`, [seriesId]);
  return rows.map((row) => String(row.topic_id));
}
