-- Create campaigns table to store campaign metadata
CREATE TABLE IF NOT EXISTS campaigns (
  campaign_source TEXT PRIMARY KEY,
  campaign_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_name ON campaigns(campaign_name);

