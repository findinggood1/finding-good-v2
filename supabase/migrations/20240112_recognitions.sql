-- Create recognitions table for "Recognize Someone's Impact" feature
-- This stores when users name the impact someone else had on them

CREATE TABLE IF NOT EXISTS recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email TEXT NOT NULL,
  to_name TEXT NOT NULL,
  to_email TEXT,
  what_they_did TEXT NOT NULL,
  what_it_showed TEXT NOT NULL,
  how_it_affected TEXT NOT NULL,
  impact_line TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recognitions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own recognitions
CREATE POLICY "Users can insert own recognitions"
  ON recognitions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own recognitions (ones they created)
CREATE POLICY "Users can view own recognitions"
  ON recognitions
  FOR SELECT
  USING (from_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_recognitions_from_email ON recognitions(from_email);
CREATE INDEX IF NOT EXISTS idx_recognitions_to_email ON recognitions(to_email);
