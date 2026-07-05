-- ============================================================================
-- 0004 — Guest accounts (no-signup entry)
-- ============================================================================
-- Visitors can start chatting immediately. A guest account is a normal users
-- row with no email/password; identity is carried by the long-lived session
-- cookie. Goals and demographics are added later from Settings.

ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

ALTER TABLE users DROP CONSTRAINT users_auth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check
  CHECK (auth_provider IN ('email', 'apple', 'google', 'guest'));
