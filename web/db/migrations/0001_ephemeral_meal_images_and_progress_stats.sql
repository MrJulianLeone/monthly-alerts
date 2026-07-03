-- ============================================================================
-- Migration 0001 — stop retaining meal images + add running progress summary
-- ============================================================================
-- Idempotent. Safe to run against an existing database (schema.sql already
-- reflects these changes for fresh installs). Apply with any Postgres client:
--
--   psql "$DATABASE_URL" -f db/migrations/0001_ephemeral_meal_images_and_progress_stats.sql
--
-- Rationale: meal photos are sent to the vision model for categorization and
-- then discarded — they are never stored. Progress is tracked cumulatively in
-- a single per-user row instead of by scanning (or retaining) history.
-- ============================================================================

-- 1. Meal photos are no longer stored: photo_url becomes optional.
ALTER TABLE meal_logs ALTER COLUMN photo_url DROP NOT NULL;

-- 2. Running, cumulative progress (one small row per user, O(1) updates).
CREATE TABLE IF NOT EXISTS progress_stats (
  user_id                    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_meals_logged         integer NOT NULL DEFAULT 0,
  meal_days                  integer NOT NULL DEFAULT 0,
  balanced_meals             integer NOT NULL DEFAULT 0,
  balance_breakdown          jsonb   NOT NULL DEFAULT '{}'::jsonb,
  last_meal_date             date,
  total_challenges_completed integer NOT NULL DEFAULT 0,
  total_challenge_volume     integer NOT NULL DEFAULT 0,
  first_activity_at          timestamptz,
  last_activity_at           timestamptz,
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS progress_stats_updated_at ON progress_stats;
CREATE TRIGGER progress_stats_updated_at BEFORE UPDATE ON progress_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Backfill progress_stats from existing history so continued review is
--    accurate from day one (skips users that already have a row). The per-label
--    balance_breakdown accumulates going forward from new logs.
INSERT INTO progress_stats (
  user_id, total_meals_logged, meal_days, balanced_meals,
  last_meal_date, total_challenges_completed, total_challenge_volume,
  first_activity_at, last_activity_at
)
SELECT
  u.id,
  COALESCE(m.total_meals, 0),
  COALESCE(m.meal_days, 0),
  COALESCE(m.balanced_meals, 0),
  m.last_meal_date,
  COALESCE(c.total_challenges, 0),
  COALESCE(c.total_volume, 0),
  LEAST(m.first_meal_at, c.first_challenge_at),
  GREATEST(m.last_meal_at, c.last_challenge_at)
FROM users u
LEFT JOIN (
  SELECT
    user_id,
    count(*)::int AS total_meals,
    count(DISTINCT logged_at::date)::int AS meal_days,
    count(*) FILTER (WHERE ai_analysis->>'balance' = 'balanced')::int AS balanced_meals,
    max(logged_at)::date AS last_meal_date,
    min(logged_at) AS first_meal_at,
    max(logged_at) AS last_meal_at
  FROM meal_logs
  GROUP BY user_id
) m ON m.user_id = u.id
LEFT JOIN (
  SELECT user_id,
         count(*)::int AS total_challenges,
         COALESCE(sum(completed_value), 0)::int AS total_volume,
         min(completed_at) AS first_challenge_at,
         max(completed_at) AS last_challenge_at
  FROM challenge_logs
  GROUP BY user_id
) c ON c.user_id = u.id
WHERE (m.user_id IS NOT NULL OR c.user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Meal images are no longer referenced anywhere; null out any retained
--    photo URLs so nothing points at stored image bytes.
UPDATE meal_logs SET photo_url = NULL WHERE photo_url IS NOT NULL;
