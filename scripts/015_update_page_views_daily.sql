-- Drop the old unique index
DROP INDEX IF EXISTS idx_page_views_page_path;

-- Drop the existing table to recreate with new schema
DROP TABLE IF EXISTS page_views;

-- Create page views tracking table with daily granularity
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) NOT NULL,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint on page_path and view_date (one record per page per day)
CREATE UNIQUE INDEX idx_page_views_page_date ON page_views(page_path, view_date);

-- Create index on view_date for efficient date queries
CREATE INDEX idx_page_views_date ON page_views(view_date);
