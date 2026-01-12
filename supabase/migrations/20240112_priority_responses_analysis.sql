-- Update priority_responses table to store AI analysis results
-- This allows responses to have the same structured output as self-entries

ALTER TABLE priority_responses 
  ADD COLUMN IF NOT EXISTS proof_line TEXT,
  ADD COLUMN IF NOT EXISTS fires_extracted JSONB;

-- Add comment explaining the columns
COMMENT ON COLUMN priority_responses.proof_line IS 'AI-generated proof line summarizing the response';
COMMENT ON COLUMN priority_responses.fires_extracted IS 'FIRES elements extracted from the response by AI';
