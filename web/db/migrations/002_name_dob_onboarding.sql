-- Name+birthday-first onboarding: store the name on every account and carry
-- the child's identity on parent invites. Idempotent.
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE parent_invites ADD COLUMN IF NOT EXISTS child_name text;
ALTER TABLE parent_invites ADD COLUMN IF NOT EXISTS child_dob date;
-- Backfill names for existing coached users from their profiles.
UPDATE users u SET name = p.display_name
FROM profiles p WHERE p.user_id = u.id AND u.name IS NULL;
