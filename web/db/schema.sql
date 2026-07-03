-- ============================================================================
-- MonthlyAlerts — Neon Postgres schema
-- ============================================================================
-- A chat-first personal health coach: daily meal + exercise guidance,
-- invite-only leaderboards, and monthly progress summaries (the core product).
--
-- Apply with:  node scripts/migrate.mjs          (or --wipe to reset first)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS citext;

-- Shared trigger to keep updated_at columns current.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Users & profiles
-- ----------------------------------------------------------------------------

-- All accounts: coached users (kids 11+ and adults), parents, and admins.
CREATE TABLE users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              citext UNIQUE NOT NULL,
  password_hash      text,                          -- null for OAuth-only accounts
  auth_provider      text NOT NULL DEFAULT 'email'
                       CHECK (auth_provider IN ('email', 'apple', 'google')),
  apple_sub          text UNIQUE,                   -- Sign in with Apple subject
  google_sub         text UNIQUE,                   -- Google OAuth subject
  role               text NOT NULL DEFAULT 'user'
                       CHECK (role IN ('user', 'parent', 'admin')),
  parent_id          uuid REFERENCES users(id) ON DELETE SET NULL, -- set for minors
  date_of_birth      date,                          -- required for coached users (app-enforced)
  email_verified_at  timestamptz,
  last_active_at     timestamptz,                   -- drives leaderboard activity window
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

CREATE INDEX users_parent_id_idx ON users (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX users_last_active_idx ON users (last_active_at);

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Coaching profile, 1:1 with a coached user. Drives progressive overload
-- (age from DOB, gender-aware starting points) and monthly summaries.
CREATE TABLE profiles (
  user_id                  uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name             text NOT NULL,
  gender                   text CHECK (gender IN ('male', 'female', 'other')),
  height_cm                numeric(5,1),
  weight_kg                numeric(5,1),
  goal                     text CHECK (goal IN
                             ('lose_weight', 'build_strength', 'get_fit', 'build_habits')),
  daily_calorie_goal       integer,                       -- personal daily calorie target (null = auto-estimated)
  timezone                 text NOT NULL DEFAULT 'UTC',
  onboarding_completed_at  timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Weight history for monthly trend reporting (weight changes, if provided).
CREATE TABLE weight_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   numeric(5,1) NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX weight_entries_user_time_idx ON weight_entries (user_id, recorded_at);

-- ----------------------------------------------------------------------------
-- Auth: sessions, one-time tokens, parent-managed onboarding
-- ----------------------------------------------------------------------------

CREATE TABLE sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   text UNIQUE NOT NULL,
  ip           inet,
  user_agent   text,
  expires_at   timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_idx ON sessions (user_id);

-- One-time tokens for email verification and password reset.
CREATE TABLE auth_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    text NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_tokens_user_purpose_idx ON auth_tokens (user_id, purpose);

-- Under-16 onboarding: child enters parent email, parent receives a secure
-- setup link, fills the child profile, and sets the login credentials.
CREATE TABLE parent_invites (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email   citext NOT NULL,
  token_hash     text UNIQUE NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'completed', 'expired')),
  parent_user_id uuid REFERENCES users(id) ON DELETE SET NULL, -- created on completion
  child_user_id  uuid REFERENCES users(id) ON DELETE SET NULL, -- created on completion
  expires_at     timestamptz NOT NULL,
  completed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX parent_invites_email_idx ON parent_invites (parent_email);

-- ----------------------------------------------------------------------------
-- Chat (the main interface)
-- ----------------------------------------------------------------------------

-- Every entry in the coach chat feed. Users have no free-text input, so user
-- messages are structured actions ("Snap Meal", "I Did It").
CREATE TABLE chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender     text NOT NULL CHECK (sender IN ('coach', 'user')),
  kind       text NOT NULL CHECK (kind IN
               ('text',               -- coach guidance / feedback
                'meal_photo',         -- user snapped a meal
                'challenge_prompt',   -- coach issues the next challenge
                'challenge_complete', -- user tapped "I Did It"
                'calorie_summary',    -- coach reports remaining calories for the day
                'monthly_summary',    -- in-app monthly report card
                'system')),
  content    text,
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb, -- e.g. meal_log_id, challenge_id, summary_id
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_user_time_idx ON chat_messages (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Exercise system: sequential challenges + progressive overload
-- ----------------------------------------------------------------------------

-- Catalog of bodyweight and dumbbell exercises.
CREATE TABLE exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  description   text,
  equipment     text NOT NULL CHECK (equipment IN ('bodyweight', 'dumbbell')),
  unit          text NOT NULL CHECK (unit IN ('reps', 'seconds')),
  base_value    integer NOT NULL,      -- neutral starting target
  min_age       integer NOT NULL DEFAULT 11,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Per-user challenge sequence. Exactly one 'active' challenge at a time;
-- completing it immediately unlocks the next (created by the progression
-- engine using performance, age, gender, and DOB).
CREATE TABLE challenges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id     uuid NOT NULL REFERENCES exercises(id),
  sequence_number integer NOT NULL,    -- 1, 2, 3, ... per user
  target_value    integer NOT NULL,    -- reps or seconds
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'skipped')),
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sequence_number)
);

CREATE INDEX challenges_user_status_idx ON challenges (user_id, status);

-- Completion records ("I Did It"), feeding progressive overload.
CREATE TABLE challenge_logs (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id         uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_value      integer NOT NULL, -- actual reps/seconds achieved
  perceived_difficulty text CHECK (perceived_difficulty IN ('easy', 'right', 'hard')),
  completed_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX challenge_logs_user_time_idx ON challenge_logs (user_id, completed_at);

-- ----------------------------------------------------------------------------
-- Nutrition system: meal photos + AI feedback + streaks
-- ----------------------------------------------------------------------------

-- Meal photos are NOT retained. The image is sent to the vision model inline
-- for categorization and then discarded; only the structured result is kept.
-- photo_url is therefore nullable and unused for new logs (retained for any
-- historical rows created before this policy).
CREATE TABLE meal_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url   text,                                 -- deprecated: images are no longer stored
  meal_type   text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ai_feedback text,                                 -- short, useful coach feedback
  ai_analysis jsonb NOT NULL DEFAULT '{}'::jsonb,   -- structured vision output (balance, items)
  estimated_calories integer,                       -- coach's kcal estimate for this meal
  ai_model    text,                                 -- e.g. 'gpt-4o'
  logged_at   timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meal_logs_user_time_idx ON meal_logs (user_id, logged_at DESC);

-- Running daily calorie log, one row per user per calendar day (user timezone).
-- Accumulates calories from each logged meal so the coach can report the
-- remaining calories against the user's personal daily goal in real time.
CREATE TABLE daily_calorie_logs (
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date          date NOT NULL,                  -- calendar day in the user's timezone
  calories_consumed integer NOT NULL DEFAULT 0,     -- running total for the day
  meals_logged      integer NOT NULL DEFAULT 0,     -- meals counted toward the day
  calorie_goal      integer,                        -- goal snapshot the day was measured against
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, log_date)
);

CREATE INDEX daily_calorie_logs_user_date_idx ON daily_calorie_logs (user_id, log_date DESC);

CREATE TRIGGER daily_calorie_logs_updated_at BEFORE UPDATE ON daily_calorie_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Meal-logging streaks; consistent streaks accelerate exercise progression.
CREATE TABLE streaks (
  user_id          uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak   integer NOT NULL DEFAULT 0,
  longest_streak   integer NOT NULL DEFAULT 0,
  last_logged_date date,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- Running progress (cumulative, storage-efficient)
-- ----------------------------------------------------------------------------

-- A single always-current row per user that accumulates lifetime progress for
-- both diet goals and fitness challenges. Updated in O(1) on each meal log and
-- challenge completion, so continued review never has to scan (or retain) the
-- underlying history or any meal images. This is the "running summary" that
-- backs on-demand progress views and feeds the monthly narrative.
CREATE TABLE progress_stats (
  user_id                    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Diet goals
  total_meals_logged         integer NOT NULL DEFAULT 0,
  meal_days                  integer NOT NULL DEFAULT 0,   -- distinct calendar days a meal was logged
  balanced_meals             integer NOT NULL DEFAULT 0,   -- meals the coach categorized as "balanced"
  balance_breakdown          jsonb   NOT NULL DEFAULT '{}'::jsonb, -- running counts per balance label
  last_meal_date             date,                          -- for distinct-day accounting (user tz)
  -- Fitness challenges
  total_challenges_completed integer NOT NULL DEFAULT 0,
  total_challenge_volume     integer NOT NULL DEFAULT 0,   -- cumulative reps/seconds performed
  -- Bookkeeping
  first_activity_at          timestamptz,
  last_activity_at           timestamptz,
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER progress_stats_updated_at BEFORE UPDATE ON progress_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- Leaderboards & referrals (invite-only)
-- ----------------------------------------------------------------------------

CREATE TABLE leaderboards (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT 'My Leaderboard',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX leaderboards_owner_idx ON leaderboards (owner_id);

-- Membership (max 3 leaderboards per user is enforced in the API).
-- left_at supports "users can leave any leaderboard" while keeping history.
CREATE TABLE leaderboard_members (
  leaderboard_id uuid NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at      timestamptz NOT NULL DEFAULT now(),
  left_at        timestamptz,
  PRIMARY KEY (leaderboard_id, user_id)
);

CREATE INDEX leaderboard_members_user_idx ON leaderboard_members (user_id);

-- Refer-a-friend invitations; invitee must accept to join the leaderboard.
CREATE TABLE referrals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaderboard_id  uuid NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  invitee_email   citext NOT NULL,
  invitee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  token_hash      text UNIQUE NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at      timestamptz NOT NULL,
  responded_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX referrals_referrer_idx ON referrals (referrer_id);
CREATE INDEX referrals_invitee_email_idx ON referrals (invitee_email);

-- ----------------------------------------------------------------------------
-- Monthly summaries (the core deliverable)
-- ----------------------------------------------------------------------------

-- One report per user per calendar month: trends in meals logged, challenges
-- completed, streaks, weight changes, and overall improvement.
-- Delivered in-app (chat_messages kind = 'monthly_summary') and by email.
CREATE TABLE monthly_summaries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month         date NOT NULL,                       -- first day of the month
  stats         jsonb NOT NULL DEFAULT '{}'::jsonb,  -- meals_logged, challenges_completed,
                                                     -- best_streak, weight_delta_kg, etc.
  narrative     text,                                -- AI-written summary of the month
  email_sent_at timestamptz,                         -- Resend delivery (parent or user)
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

CREATE INDEX monthly_summaries_month_idx ON monthly_summaries (month);

-- ----------------------------------------------------------------------------
-- Monetization: Stripe monthly subscriptions (first 30 days free)
-- ----------------------------------------------------------------------------

CREATE TABLE subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id     text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status                 text NOT NULL DEFAULT 'trialing'
                           CHECK (status IN
                             ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  trial_ends_at          timestamptz,              -- ~30 days after signup
  billing_prompt_sent_at timestamptz,              -- subscription email after active trial
  current_period_end     timestamptz,
  canceled_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- Push notifications (max 2–3 smart nudges per day)
-- ----------------------------------------------------------------------------

CREATE TABLE push_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token text UNIQUE NOT NULL,
  platform        text NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_used_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX push_tokens_user_idx ON push_tokens (user_id);

-- Sent-notification log; used to enforce the daily cap per user.
CREATE TABLE notification_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL CHECK (kind IN ('meal_nudge', 'challenge', 'evening_checkin')),
  sent_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notification_logs_user_day_idx ON notification_logs (user_id, sent_at);

-- ----------------------------------------------------------------------------
-- Admin analytics (IP-based geolocation, admin dashboard only)
-- ----------------------------------------------------------------------------

CREATE TABLE analytics_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  event      text NOT NULL,             -- e.g. 'signup', 'app_open', 'page_view'
  path       text,
  ip         inet,
  country    text,
  region     text,
  city       text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_time_idx ON analytics_events (created_at);
CREATE INDEX analytics_events_event_idx ON analytics_events (event, created_at);

-- ============================================================================
-- Seed data: starter exercise catalog (bodyweight + dumbbell)
-- ============================================================================

INSERT INTO exercises (slug, name, description, equipment, unit, base_value, min_age) VALUES
  ('pushups',          'Push-Ups',           'Standard push-ups, chest to just above the floor.',      'bodyweight', 'reps',    8,  11),
  ('squats',           'Bodyweight Squats',  'Feet shoulder-width apart, thighs to parallel.',         'bodyweight', 'reps',    12, 11),
  ('plank',            'Plank Hold',         'Forearm plank, straight line from head to heels.',       'bodyweight', 'seconds', 30, 11),
  ('lunges',           'Alternating Lunges', 'Step forward, back knee just above the floor.',          'bodyweight', 'reps',    10, 11),
  ('situps',           'Sit-Ups',            'Controlled sit-ups, feet flat on the floor.',            'bodyweight', 'reps',    10, 11),
  ('jumping-jacks',    'Jumping Jacks',      'Full-range jumping jacks at a steady pace.',             'bodyweight', 'reps',    20, 11),
  ('wall-sit',         'Wall Sit',           'Back flat against the wall, thighs parallel.',           'bodyweight', 'seconds', 25, 11),
  ('glute-bridges',    'Glute Bridges',      'Hips up, squeeze at the top, lower with control.',       'bodyweight', 'reps',    12, 11),
  ('db-curls',         'Dumbbell Curls',     'Standing curls, both arms, controlled tempo.',           'dumbbell',   'reps',    10, 13),
  ('db-shoulder-press','Dumbbell Shoulder Press', 'Seated or standing overhead press.',                'dumbbell',   'reps',    8,  13),
  ('db-rows',          'Dumbbell Rows',      'One-arm rows, flat back, pull to the hip.',              'dumbbell',   'reps',    10, 13),
  ('db-goblet-squats', 'Goblet Squats',      'Hold one dumbbell at the chest, squat to parallel.',     'dumbbell',   'reps',    10, 13);
