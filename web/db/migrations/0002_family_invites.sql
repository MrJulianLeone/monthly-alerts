-- ============================================================================
-- Migration 0002 — family invites (with parent/guardian linkage)
-- ============================================================================
-- Idempotent. Safe to run against an existing database (schema.sql already
-- reflects these changes for fresh installs). Apply with any Postgres client:
--
--   psql "$DATABASE_URL" -f db/migrations/0002_family_invites.sql
--
-- Rationale: family invites now persist a secure token so the invitation can
-- be linked back to the inviter on accept. When a minor with no parent invites
-- an adult family member, the accepting adult is saved as that minor's parent.
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_invites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email   citext NOT NULL,
  relationship    text NOT NULL DEFAULT 'family'
                    CHECK (relationship IN ('family', 'parent')),
  token_hash      text UNIQUE NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invitee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at      timestamptz NOT NULL,
  responded_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_invites_inviter_idx ON family_invites (inviter_id);
CREATE INDEX IF NOT EXISTS family_invites_email_idx ON family_invites (invitee_email);
