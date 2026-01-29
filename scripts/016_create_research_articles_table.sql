-- Create research_articles table for AI-generated blog content
CREATE TABLE IF NOT EXISTS research_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  meta_description VARCHAR(320),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_research_articles_slug ON research_articles(slug);

-- Create index for ordering by publish date
CREATE INDEX IF NOT EXISTS idx_research_articles_published_at ON research_articles(published_at DESC);
