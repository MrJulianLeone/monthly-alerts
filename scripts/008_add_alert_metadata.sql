-- Add metadata columns to alerts table for better tracking and display
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS ticker VARCHAR(10),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS price VARCHAR(50),
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20);

-- Create index for faster ticker lookups
CREATE INDEX IF NOT EXISTS idx_alerts_ticker ON alerts(ticker);

