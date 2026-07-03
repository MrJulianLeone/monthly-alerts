-- ============================================================================
-- Migration 0003 — tokenized family invites
-- ============================================================================
-- Idempotent. Safe to run against an existing database (schema.sql already
-- reflects these changes for fresh installs). Apply with any Postgres client:
--
--   psql "$DATABASE_URL" -f db/migrations/0003_family_invites.sql
--
-- Rationale: family invite emails previously linked to the generic signup, so
-- invitees had to re-enter emails and inviters could be prompted to create a
-- duplicate account. Tokenized invites pre-fill the signup (and the parent
-- email for under-16 invitees) so no information is entered twice.
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_invites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email citext NOT NULL,
  token_hash    text UNIQUE NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'expired')),
  accepted_at   timestamptz,
  expires_at    timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_invites_inviter_idx ON family_invites (inviter_id);
CREATE INDEX IF NOT EXISTS family_invites_invitee_email_idx ON family_invites (invitee_email);
