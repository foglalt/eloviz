ALTER TABLE newsletter_subscribers DROP CONSTRAINT newsletter_subscribers_status_check;
ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_status_check CHECK (status IN ('pending', 'subscribed', 'unsubscribed'));
ALTER TABLE newsletter_subscribers ADD COLUMN confirmed_at timestamptz;
ALTER TABLE newsletter_subscribers ADD COLUMN confirmation_hash text;
ALTER TABLE newsletter_subscribers ADD COLUMN confirmation_expires_at timestamptz;
ALTER TABLE newsletter_subscribers ADD COLUMN confirmation_requested_at timestamptz;
ALTER TABLE newsletter_subscribers ADD COLUMN resend_contact_id text;
ALTER TABLE newsletter_subscribers ADD COLUMN provider_event_at timestamptz;
UPDATE newsletter_subscribers SET confirmed_at = consented_at WHERE status = 'subscribed';
-- Keep the previous default compatible with the currently deployed collector.
-- The confirmation-based application explicitly inserts pending subscriptions.
CREATE UNIQUE INDEX newsletter_confirmation_hash_idx ON newsletter_subscribers (confirmation_hash) WHERE confirmation_hash IS NOT NULL;
CREATE TABLE newsletter_request_limits (
  bucket text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE newsletter_digest_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  period_end timestamptz NOT NULL UNIQUE,
  period_start timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('preparing', 'creating', 'draft', 'sending', 'sent', 'skipped', 'failed', 'review')),
  items jsonb NOT NULL DEFAULT '[]',
  broadcast_id text,
  lease_id text,
  lease_until timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO content_migrations(version) VALUES ('009_newsletter_delivery') ON CONFLICT DO NOTHING;
