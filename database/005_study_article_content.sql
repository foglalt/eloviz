ALTER TABLE study_documents
  ADD COLUMN IF NOT EXISTS article_content jsonb;

ALTER TABLE study_documents
  ADD COLUMN IF NOT EXISTS article_extraction_version text;

INSERT INTO content_migrations(version)
VALUES ('005_study_article_content')
ON CONFLICT DO NOTHING;
