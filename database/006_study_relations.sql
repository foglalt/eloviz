CREATE TABLE IF NOT EXISTS study_relations (
  study_a_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  study_b_id uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (study_a_id, study_b_id),
  CHECK (study_a_id < study_b_id)
);

CREATE INDEX IF NOT EXISTS study_relations_b_idx
  ON study_relations(study_b_id, sort_order);

INSERT INTO content_migrations(version)
VALUES ('006_study_relations')
ON CONFLICT DO NOTHING;
