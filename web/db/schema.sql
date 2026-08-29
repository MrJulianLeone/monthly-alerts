-- MonthlyAlerts.com — multilingual construction checklists.
-- Applied idempotently by scripts/migrate.mjs (CREATE TABLE IF NOT EXISTS).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users & auth (passwordless: magic links only)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text NOT NULL UNIQUE,          -- stored lowercased
  password_hash      text,                          -- scrypt; null until the user sets one
  email_verified_at  timestamptz,                   -- set by the emailed confirmation link
  name               text,
  company            text,
  phone              text,
  preferred_language text NOT NULL DEFAULT 'en',    -- 'en' | 'it' | 'es' (app-enforced)
  onboarded_at       timestamptz,                   -- profile + language collected
  email_opt_out      boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

CREATE TABLE IF NOT EXISTS sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  ip         text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One-time emailed tokens: email confirmation ('verify') and password reset
-- ('reset'). Using one proves control of the email address.
CREATE TABLE IF NOT EXISTS login_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  purpose    text NOT NULL DEFAULT 'verify',        -- 'verify' | 'reset'
  token_hash text NOT NULL UNIQUE,
  redirect   text,                                  -- post-login destination
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Projects & membership
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS projects (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  name_lang         text NOT NULL DEFAULT 'en',
  address           text,
  description       text,
  owner_id          uuid NOT NULL REFERENCES users(id),
  currency          text NOT NULL DEFAULT 'USD',    -- for section budgets
  paid_at           timestamptz,                    -- null while billing is disabled
  stripe_session_id text,
  archived_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- role: 'owner' | 'editor' | 'commenter'
--   commenter: view + comment
--   editor:    + add/edit items & sections, change status, upload photos
--   owner:     + delete anything, manage members, project settings
CREATE TABLE IF NOT EXISTS project_members (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'commenter',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS invites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email      text NOT NULL,                         -- stored lowercased
  role       text NOT NULL DEFAULT 'commenter',     -- 'editor' | 'commenter'
  language   text NOT NULL DEFAULT 'en',            -- owner-selected invite language
  token_hash text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Checklist content. Every text column that users write is stored in the
-- author's language, with that language recorded alongside it; viewers in
-- other languages read from the translations cache.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       text NOT NULL,
  name_lang  text NOT NULL DEFAULT 'en',
  budget     numeric(14,2),                         -- owner-set, per category
  actual     numeric(14,2),                         -- owner-set, per category
  position   int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id   uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  source_lang  text NOT NULL DEFAULT 'en',          -- language title/description are written in
  status       text NOT NULL DEFAULT 'open',        -- 'open' | 'in_progress' | 'done'
  assignee_id  uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date     date,
  position     int NOT NULL DEFAULT 0,
  created_by   uuid REFERENCES users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES users(id),
  body        text NOT NULL,
  source_lang text NOT NULL DEFAULT 'en',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url          text NOT NULL,
  pathname     text NOT NULL,                       -- blob store path, for deletion
  content_type text,
  size_bytes   int,
  caption      text,
  caption_lang text,
  uploaded_by  uuid REFERENCES users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Fixed-window rate limiting for auth endpoints (key = bucket:ip).
CREATE TABLE IF NOT EXISTS rate_limits (
  key          text PRIMARY KEY,
  count        int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Translation cache. Content-addressed: the key is a hash of the source
-- language + source text, so an edit produces a new hash and stale
-- translations simply stop being referenced (no invalidation logic needed),
-- and identical strings across projects share one cached translation.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS translations (
  source_hash text NOT NULL,                        -- sha256(source_lang + '\n' + text)
  target_lang text NOT NULL,
  translated  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_hash, target_lang)
);

-- ---------------------------------------------------------------------------
-- Support inbox. Inbound mail to support@monthlyalerts.com arrives via the
-- Resend email.received webhook; outbound rows are replies/messages sent from
-- the admin inbox. A "thread" is the set of rows sharing thread_key: replies
-- inherit it via the In-Reply-To header, with a counterparty + normalized
-- subject fallback (Resend assigns its own Message-ID to outbound sends, so
-- customer replies to us can only be matched by that fallback).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction          text NOT NULL,                 -- 'inbound' | 'outbound'
  resend_id          text UNIQUE,                   -- Resend email id (dedupes webhook retries)
  message_id         text,                          -- RFC 5322 Message-ID header (inbound only)
  in_reply_to        text,                          -- Message-ID being replied to
  thread_key         text NOT NULL,                 -- conversation grouping key
  counterparty_email text NOT NULL,                 -- the non-support party (stored lowercased)
  from_email         text NOT NULL,
  from_name          text,
  to_email           text NOT NULL,
  subject            text,
  text_body          text,
  html_body          text,
  attachments        jsonb NOT NULL DEFAULT '[]',   -- [{filename, content_type, size}]
  read_at            timestamptz,                   -- inbound only; null = unread
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- In-place upgrades for databases created before these columns existed
-- (CREATE TABLE IF NOT EXISTS skips existing tables, so alter idempotently).
-- ---------------------------------------------------------------------------

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE login_tokens ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'verify';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';
ALTER TABLE sections ADD COLUMN IF NOT EXISTS budget numeric(14,2);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS actual numeric(14,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amount_paid_cents int;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expiry_warned_at timestamptz;

-- Paid storage extensions: each purchase adds years to the project's
-- retention. extended_years on projects is the denormalized sum used in
-- expiry math; this table is the per-purchase audit trail.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS extended_years int NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS project_extensions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,            -- idempotency (webhook + success page)
  amount_paid_cents int,
  years             int NOT NULL,
  purchased_by      uuid REFERENCES users(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Support inbox: spam folder + AI autoresponder bookkeeping.
-- folder: 'inbox' | 'spam' (moves apply to the whole thread; a thread shows
-- in the folder of its latest message). ai_verdict on inbound rows records
-- what the autoresponder did: 'spam' | 'responded' | 'needs_info' | 'skipped'
-- (null = not classified, e.g. AI unavailable). auto marks outbound rows the
-- autoresponder sent (replies and admin notifications).
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS folder text NOT NULL DEFAULT 'inbox';
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS ai_verdict text;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS ai_note text;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS auto boolean NOT NULL DEFAULT false;

-- Accounts created in the magic-link era proved their email by logging in;
-- new password signups have a password_hash and stay unverified until the
-- confirmation link is used, so this backfill never touches them.
UPDATE users SET email_verified_at = created_at
WHERE email_verified_at IS NULL AND password_hash IS NULL;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_tokens_email  ON login_tokens(email);
CREATE INDEX IF NOT EXISTS idx_members_user        ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_project     ON invites(project_id);
CREATE INDEX IF NOT EXISTS idx_invites_email       ON invites(email);
CREATE INDEX IF NOT EXISTS idx_sections_project    ON sections(project_id);
CREATE INDEX IF NOT EXISTS idx_items_project       ON items(project_id);
CREATE INDEX IF NOT EXISTS idx_items_section       ON items(section_id);
CREATE INDEX IF NOT EXISTS idx_comments_item       ON comments(item_id);
CREATE INDEX IF NOT EXISTS idx_photos_item         ON photos(item_id);
CREATE INDEX IF NOT EXISTS idx_support_thread      ON support_messages(thread_key, created_at);
CREATE INDEX IF NOT EXISTS idx_support_message_id  ON support_messages(message_id);
