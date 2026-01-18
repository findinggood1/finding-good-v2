-- Recognized Entries table
-- Tracks when a user marks an entry as "seen/recognized"
-- Part of Together/Campfire rebuild - Jan 2026

CREATE TABLE IF NOT EXISTS recognized_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('priority', 'proof', 'share')),
  entry_id UUID NOT NULL,
  recognized_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_type, entry_id, recognized_by_email)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_recognized_entries_entry ON recognized_entries(entry_type, entry_id);
CREATE INDEX IF NOT EXISTS idx_recognized_entries_user ON recognized_entries(recognized_by_email);
