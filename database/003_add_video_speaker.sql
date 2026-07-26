ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS speaker text;

INSERT INTO content_migrations(version)
VALUES ('003_add_video_speaker')
ON CONFLICT DO NOTHING;
