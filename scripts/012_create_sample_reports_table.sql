-- Create sample_reports table to store Sample MonthlyAlert PDFs
CREATE TABLE IF NOT EXISTS sample_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on uploaded_at for quick retrieval of latest report
CREATE INDEX IF NOT EXISTS idx_sample_reports_uploaded_at ON sample_reports(uploaded_at DESC);

