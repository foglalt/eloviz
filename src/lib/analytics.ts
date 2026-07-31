import "server-only";
import { getSql } from "./db";

type AnalyticsRow = Record<string, unknown>;

export type AnalyticsRankingItem = {
  title: string;
  path: string;
  visitors: number;
  views: number;
};

export type AdminAnalyticsOverview = {
  allTimeVisitors: number;
  allTimeViews: number;
  recentVisitors: number;
  recentViews: number;
  topics: AnalyticsRankingItem[];
  studies: AnalyticsRankingItem[];
  videos: AnalyticsRankingItem[];
};

const EMPTY_ANALYTICS: AdminAnalyticsOverview = {
  allTimeVisitors: 0,
  allTimeViews: 0,
  recentVisitors: 0,
  recentViews: 0,
  topics: [],
  studies: [],
  videos: [],
};

function rankingItems(value: unknown): AnalyticsRankingItem[] {
  const rows = Array.isArray(value) ? value : [];
  return rows.map((item) => {
    const row = item as AnalyticsRow;
    return {
      title: String(row.title),
      path: String(row.path),
      visitors: Number(row.visitors ?? 0),
      views: Number(row.views ?? 0),
    };
  });
}

export async function recordAnalyticsPageView(visitorHash: string, path: string) {
  const sql = getSql();
  if (!sql) return false;

  const rows = await sql.query(`
    INSERT INTO analytics_page_views(visitor_hash, path, viewed_at)
    SELECT $1, $2, date_trunc('minute', now())
    WHERE $2 IN ('/', '/kereses', '/tanulmanyok', '/temak', '/videok')
      OR EXISTS (SELECT 1 FROM topics WHERE status = 'published' AND $2 = '/temak/' || slug)
      OR EXISTS (SELECT 1 FROM studies WHERE status = 'published' AND $2 = '/tanulmanyok/' || slug)
      OR EXISTS (SELECT 1 FROM videos WHERE status = 'published' AND $2 = '/videok/' || slug)
    ON CONFLICT (visitor_hash, path, viewed_at) DO NOTHING
    RETURNING id`, [visitorHash, path]);

  return rows.length > 0;
}

export async function getAdminAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
  const sql = getSql();
  if (!sql) return EMPTY_ANALYTICS;

  const rows = await sql.query(`
    WITH recent AS MATERIALIZED (
      SELECT visitor_hash, path
      FROM analytics_page_views
      WHERE viewed_at >= date_trunc('day', now()) - interval '29 days'
    )
    SELECT
      (SELECT count(DISTINCT visitor_hash)::int FROM analytics_page_views) AS all_time_visitors,
      (SELECT count(*)::int FROM analytics_page_views) AS all_time_views,
      (SELECT count(DISTINCT visitor_hash)::int FROM recent) AS recent_visitors,
      (SELECT count(*)::int FROM recent) AS recent_views,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'title', ranked.title, 'path', ranked.path,
          'visitors', ranked.visitors, 'views', ranked.views
        ) ORDER BY ranked.views DESC, ranked.visitors DESC, ranked.title)
        FROM (
          SELECT content.title, '/temak/' || content.slug AS path,
            count(DISTINCT view.visitor_hash)::int AS visitors,
            count(*)::int AS views
          FROM topics content
          JOIN recent view ON view.path = '/temak/' || content.slug
          WHERE content.status = 'published'
          GROUP BY content.id, content.title, content.slug
          ORDER BY views DESC, visitors DESC, content.title
          LIMIT 5
        ) ranked
      ), '[]'::jsonb) AS topics,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'title', ranked.title, 'path', ranked.path,
          'visitors', ranked.visitors, 'views', ranked.views
        ) ORDER BY ranked.views DESC, ranked.visitors DESC, ranked.title)
        FROM (
          SELECT content.title, '/tanulmanyok/' || content.slug AS path,
            count(DISTINCT view.visitor_hash)::int AS visitors,
            count(*)::int AS views
          FROM studies content
          JOIN recent view ON view.path = '/tanulmanyok/' || content.slug
          WHERE content.status = 'published'
          GROUP BY content.id, content.title, content.slug
          ORDER BY views DESC, visitors DESC, content.title
          LIMIT 5
        ) ranked
      ), '[]'::jsonb) AS studies,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'title', ranked.title, 'path', ranked.path,
          'visitors', ranked.visitors, 'views', ranked.views
        ) ORDER BY ranked.views DESC, ranked.visitors DESC, ranked.title)
        FROM (
          SELECT content.title, '/videok/' || content.slug AS path,
            count(DISTINCT view.visitor_hash)::int AS visitors,
            count(*)::int AS views
          FROM videos content
          JOIN recent view ON view.path = '/videok/' || content.slug
          WHERE content.status = 'published'
          GROUP BY content.id, content.title, content.slug
          ORDER BY views DESC, visitors DESC, content.title
          LIMIT 5
        ) ranked
      ), '[]'::jsonb) AS videos`);

  const row = rows[0] as AnalyticsRow | undefined;
  if (!row) return EMPTY_ANALYTICS;

  return {
    allTimeVisitors: Number(row.all_time_visitors ?? 0),
    allTimeViews: Number(row.all_time_views ?? 0),
    recentVisitors: Number(row.recent_visitors ?? 0),
    recentViews: Number(row.recent_views ?? 0),
    topics: rankingItems(row.topics),
    studies: rankingItems(row.studies),
    videos: rankingItems(row.videos),
  };
}
