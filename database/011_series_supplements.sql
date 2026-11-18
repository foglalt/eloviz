ALTER TABLE study_series_parts
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'lesson'
  CHECK (kind IN ('lesson', 'supplement'));

ALTER TABLE study_series_parts
  DROP CONSTRAINT IF EXISTS study_series_parts_series_id_position_key;

ALTER TABLE study_series_parts
  ADD CONSTRAINT study_series_parts_group_position_key
  UNIQUE (series_id, kind, position) DEFERRABLE INITIALLY DEFERRED;

INSERT INTO content_migrations(version)
VALUES ('011_series_supplements')
ON CONFLICT DO NOTHING;
