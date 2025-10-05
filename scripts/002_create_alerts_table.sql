-- Create alerts table to track sent monthly alerts
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipient_count INTEGER DEFAULT 0,
  created_by TEXT REFERENCES neon_auth.users_sync(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at DESC);
