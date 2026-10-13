CREATE TABLE IF NOT EXISTS canonical_chapters (
  book_code text NOT NULL REFERENCES canonical_books(code),
  chapter_number integer NOT NULL CHECK (chapter_number BETWEEN 1 AND 150),
  PRIMARY KEY (book_code, chapter_number)
);

CREATE TABLE IF NOT EXISTS canonical_verses (
  book_code text NOT NULL,
  chapter_number integer NOT NULL,
  verse_number integer NOT NULL CHECK (verse_number BETWEEN 1 AND 200),
  osis text GENERATED ALWAYS AS (book_code || '.' || chapter_number::text || '.' || verse_number::text) STORED UNIQUE,
  PRIMARY KEY (book_code, chapter_number, verse_number),
  FOREIGN KEY (book_code, chapter_number) REFERENCES canonical_chapters(book_code, chapter_number)
);

CREATE TABLE IF NOT EXISTS bible_translations (
  id text PRIMARY KEY,
  name text NOT NULL,
  abbreviation text NOT NULL,
  language text NOT NULL,
  edition_year integer NOT NULL,
  licence text NOT NULL,
  licence_url text NOT NULL,
  source_url text NOT NULL,
  source_commit text NOT NULL,
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[a-f0-9]{64}$'),
  text_sha256 text NOT NULL CHECK (text_sha256 ~ '^[a-f0-9]{64}$'),
  provenance jsonb NOT NULL,
  versification text NOT NULL,
  attribution text NOT NULL,
  chapter_count integer NOT NULL CHECK (chapter_count > 0),
  verse_count integer NOT NULL CHECK (verse_count > 0),
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bible_verses (
  translation_id text NOT NULL REFERENCES bible_translations(id),
  osis text NOT NULL REFERENCES canonical_verses(osis),
  text text NOT NULL CHECK (length(btrim(text)) > 0),
  PRIMARY KEY (translation_id, osis)
);

INSERT INTO content_migrations(version) VALUES ('010_bible_text') ON CONFLICT DO NOTHING;
