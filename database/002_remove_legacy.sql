DROP TABLE IF EXISTS husvet_interest_contacts;
DROP TABLE IF EXISTS husvet_quiz_devices;
DROP TABLE IF EXISTS quiz_content;

INSERT INTO content_migrations (version)
VALUES ('002_remove_legacy')
ON CONFLICT DO NOTHING;
