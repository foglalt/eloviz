CREATE TABLE IF NOT EXISTS analytics_page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_hash text NOT NULL CHECK (visitor_hash ~ '^[a-f0-9]{64}$'),
  path text NOT NULL CHECK (char_length(path) BETWEEN 1 AND 200),
  viewed_at timestamptz NOT NULL DEFAULT date_trunc('minute', CURRENT_TIMESTAMP),
  UNIQUE (visitor_hash, path, viewed_at)
);

CREATE INDEX IF NOT EXISTS analytics_page_views_viewed_at_idx
  ON analytics_page_views (viewed_at DESC);

CREATE INDEX IF NOT EXISTS analytics_page_views_path_viewed_at_idx
  ON analytics_page_views (path, viewed_at DESC);

INSERT INTO content_migrations(version)
VALUES ('004_content_analytics')
ON CONFLICT DO NOTHING;
