CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canonical_books (
  code text PRIMARY KEY,
  name_hu text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('OT', 'NT')),
  canonical_order integer NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  seo_title text,
  seo_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL,
  seo_title text,
  seo_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published_document_id uuid,
  reference_reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS study_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  byte_size integer NOT NULL CHECK (byte_size > 0),
  sha256 text NOT NULL,
  storage_kind text NOT NULL CHECK (storage_kind IN ('static', 'blob', 'database')),
  storage_key text NOT NULL,
  file_data bytea,
  extraction_status text NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'complete', 'manual_required', 'failed')),
  extraction_error text,
  extracted_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, version_number),
  UNIQUE (study_id, sha256)
);

ALTER TABLE studies DROP CONSTRAINT IF EXISTS studies_published_document_fk;
ALTER TABLE studies
  ADD CONSTRAINT studies_published_document_fk
  FOREIGN KEY (published_document_id) REFERENCES study_documents(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  channel_name text,
  thumbnail_url text,
  duration_seconds integer,
  upload_date date,
  seo_title text,
  seo_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS study_topics (
  study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (study_id, topic_id)
);

CREATE TABLE IF NOT EXISTS video_topics (
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (video_id, topic_id)
);

CREATE TABLE IF NOT EXISTS study_videos (
  study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  relation_note text,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (study_id, video_id)
);

CREATE TABLE IF NOT EXISTS study_reference_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES study_documents(id) ON DELETE CASCADE,
  raw_text text NOT NULL,
  display_label text NOT NULL,
  book_code text NOT NULL REFERENCES canonical_books(code),
  start_chapter integer NOT NULL,
  start_verse integer NOT NULL,
  end_chapter integer NOT NULL,
  end_verse integer NOT NULL,
  osis_start text NOT NULL,
  osis_end text NOT NULL,
  page_number integer,
  context_snippet text,
  detector_version text NOT NULL,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected', 'edited')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_scripture_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES study_documents(id) ON DELETE CASCADE,
  display_label text NOT NULL,
  book_code text NOT NULL REFERENCES canonical_books(code),
  start_chapter integer NOT NULL,
  start_verse integer NOT NULL,
  end_chapter integer NOT NULL,
  end_verse integer NOT NULL,
  osis_start text NOT NULL,
  osis_end text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (study_id, document_id, osis_start, osis_end)
);

CREATE INDEX IF NOT EXISTS topics_public_order_idx ON topics(status, sort_order, title);
CREATE INDEX IF NOT EXISTS studies_public_order_idx ON studies(status, sort_order, title);
CREATE INDEX IF NOT EXISTS videos_public_order_idx ON videos(status, sort_order, title);
CREATE INDEX IF NOT EXISTS study_documents_study_idx ON study_documents(study_id, version_number DESC);
CREATE INDEX IF NOT EXISTS study_candidates_document_idx ON study_reference_candidates(document_id, sort_order);
CREATE INDEX IF NOT EXISTS study_references_lookup_idx
  ON study_scripture_references(book_code, start_chapter, start_verse, end_chapter, end_verse);

INSERT INTO content_migrations (version) VALUES ('001_content_platform') ON CONFLICT DO NOTHING;
