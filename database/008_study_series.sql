CREATE TABLE IF NOT EXISTS study_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  author text,
  source_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_series_parts (
  study_id uuid PRIMARY KEY REFERENCES studies(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES study_series(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position BETWEEN 1 AND 10000),
  UNIQUE (series_id, position) DEFERRABLE INITIALLY DEFERRED
);

INSERT INTO content_migrations(version)
VALUES ('008_study_series')
ON CONFLICT DO NOTHING;
