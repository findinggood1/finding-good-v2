-- Exchange Impacts table
-- Tracks user-reported impact when receiving content from others
-- Part of Together/Campfire rebuild - Jan 2026

CREATE TABLE IF NOT EXISTS exchange_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('priority', 'proof', 'recognition')),
  content_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('helpful', 'meaningful', 'high_impact')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_exchange_impacts_recipient ON exchange_impacts(recipient_email);
CREATE INDEX IF NOT EXISTS idx_exchange_impacts_sender ON exchange_impacts(sender_email);
CREATE INDEX IF NOT EXISTS idx_exchange_impacts_content ON exchange_impacts(content_type, content_id);
