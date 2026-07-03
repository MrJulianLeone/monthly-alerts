-- ============================================================================
-- Migration 0002 — daily calorie tracking
-- ============================================================================
-- Idempotent. Safe to run against an existing database (schema.sql already
-- reflects these changes for fresh installs). Apply with any Postgres client:
--
--   psql "$DATABASE_URL" -f db/migrations/0002_daily_calorie_tracking.sql
--
-- Rationale: after each meal is logged, the coach reports how many calories are
-- left for the day based on the user's personal daily goal and everything they
-- have already logged that day. A per-user/per-day running log backs this.
-- ============================================================================

-- 1. Personal daily calorie target (null = auto-estimated from profile).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_calorie_goal integer;

-- 2. Per-meal calorie estimate produced by the vision model.
ALTER TABLE meal_logs ADD COLUMN IF NOT EXISTS estimated_calories integer;

-- 3. Allow the coach's remaining-calories message as a chat message kind.
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_kind_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_kind_check
  CHECK (kind IN (
    'text',
    'meal_photo',
    'challenge_prompt',
    'challenge_complete',
    'calorie_summary',
    'monthly_summary',
    'system'
  ));

-- 4. Running daily calorie log: one row per user per calendar day.
CREATE TABLE IF NOT EXISTS daily_calorie_logs (
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date          date NOT NULL,
  calories_consumed integer NOT NULL DEFAULT 0,
  meals_logged      integer NOT NULL DEFAULT 0,
  calorie_goal      integer,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS daily_calorie_logs_user_date_idx
  ON daily_calorie_logs (user_id, log_date DESC);

DROP TRIGGER IF EXISTS daily_calorie_logs_updated_at ON daily_calorie_logs;
CREATE TRIGGER daily_calorie_logs_updated_at BEFORE UPDATE ON daily_calorie_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
