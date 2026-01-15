-- Create page views tracking table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) NOT NULL,
  view_count BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint on page_path
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- Insert initial row for home page
INSERT INTO page_views (page_path, view_count)
VALUES ('/', 0)
ON CONFLICT (page_path) DO NOTHING;
