-- Create campaign_leads table to track campaign visits
CREATE TABLE IF NOT EXISTS campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_source TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaign_leads_source ON campaign_leads(campaign_source);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_visited_at ON campaign_leads(visited_at DESC);

