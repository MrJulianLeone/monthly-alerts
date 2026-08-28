-- MonthlyAlerts.com — multilingual construction checklists.
-- Applied idempotently by scripts/migrate.mjs (CREATE TABLE IF NOT EXISTS).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Users & auth (passwordless: magic links only)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text NOT NULL UNIQUE,          -- stored lowercased
  name               text,
  company            text,
  phone              text,
  preferred_language text NOT NULL DEFAULT 'en',    -- 'en' | 'it' (app-enforced)
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

-- One-time magic-link tokens. Logging in with one both authenticates and
-- confirms the email address.
CREATE TABLE IF NOT EXISTS login_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
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
