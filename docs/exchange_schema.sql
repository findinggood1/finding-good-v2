-- Exchange Schema for Finding Good V2
-- Run via Supabase MCP or SQL Editor
-- Created: January 27, 2026

-- ============================================
-- Table: daily_reflections
-- Stores daily check-in answers from Home page
-- ============================================

CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  reflection_date DATE NOT NULL,
  question_shown TEXT NOT NULL,
  answer TEXT,
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  focus_items_completed INTEGER DEFAULT 0,
  focus_items_total INTEGER DEFAULT 0,
  completed_items JSONB,  -- Array of completed focus item names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One reflection per user per day
  UNIQUE(client_email, reflection_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_email ON daily_reflections(client_email);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_date ON daily_reflections(reflection_date DESC);

-- ============================================
-- Table: exchange_partnerships
-- Tracks who has invited whom to see their Influence page
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  visibility_level TEXT DEFAULT 'standard',  -- For future: 'standard', 'full', 'limited'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  invitation_message TEXT,
  
  -- Prevent duplicate invitations in same direction
  UNIQUE(inviter_email, invitee_email)
);

CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_inviter ON exchange_partnerships(inviter_email);
CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_invitee ON exchange_partnerships(invitee_email);
CREATE INDEX IF NOT EXISTS idx_exchange_partnerships_status ON exchange_partnerships(status);

-- ============================================
-- Function: get_exchange_partners
-- Returns all accepted partners for a user
-- ============================================

CREATE OR REPLACE FUNCTION get_exchange_partners(user_email TEXT)
RETURNS TABLE (
  partner_email TEXT,
  partner_name TEXT,
  relationship_direction TEXT,
  status TEXT,
  connected_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN ep.inviter_email = user_email THEN ep.invitee_email
      ELSE ep.inviter_email
    END as partner_email,
    c.name as partner_name,
    CASE 
      WHEN ep.inviter_email = user_email THEN 'invited'
      ELSE 'invited_by'
    END as relationship_direction,
    ep.status,
    COALESCE(ep.responded_at, ep.invited_at) as connected_at
  FROM exchange_partnerships ep
  LEFT JOIN clients c ON c.email = CASE 
    WHEN ep.inviter_email = user_email THEN ep.invitee_email
    ELSE ep.inviter_email
  END
  WHERE (ep.inviter_email = user_email OR ep.invitee_email = user_email)
    AND ep.status = 'accepted';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Add recipient_email to tool tables
-- Tracks who "others" mode entries are sent to
-- ============================================

ALTER TABLE priorities ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE validations ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Indexes for recipient queries
CREATE INDEX IF NOT EXISTS idx_priorities_recipient ON priorities(recipient_email);
CREATE INDEX IF NOT EXISTS idx_validations_recipient ON validations(recipient_email);
CREATE INDEX IF NOT EXISTS idx_predictions_recipient ON predictions(recipient_email);

-- ============================================
-- Optional: exchange_activity (caching table)
-- Caches mutual activity counts between partners
-- Can be populated by trigger or periodic job
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_email TEXT NOT NULL,
  user_b_email TEXT NOT NULL,
  a_to_b_count INTEGER DEFAULT 0,
  b_to_a_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user_a < user_b for deduplication
  CONSTRAINT user_order CHECK (user_a_email < user_b_email),
  UNIQUE(user_a_email, user_b_email)
);

CREATE INDEX IF NOT EXISTS idx_exchange_activity_users ON exchange_activity(user_a_email, user_b_email);

-- ============================================
-- RLS Policies (optional - enable as needed)
-- ============================================

-- Uncomment to enable RLS
-- ALTER TABLE exchange_partnerships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own partnerships
-- CREATE POLICY "Users can view their own partnerships"
-- ON exchange_partnerships
-- FOR SELECT
-- USING (
--   inviter_email = auth.jwt() ->> 'email' 
--   OR invitee_email = auth.jwt() ->> 'email'
-- );

-- Policy: Users can create invitations as inviter
-- CREATE POLICY "Users can create invitations"
-- ON exchange_partnerships
-- FOR INSERT
-- WITH CHECK (inviter_email = auth.jwt() ->> 'email');

-- Policy: Invitees can update status (accept/decline)
-- CREATE POLICY "Invitees can update status"
-- ON exchange_partnerships
-- FOR UPDATE
-- USING (invitee_email = auth.jwt() ->> 'email')
-- WITH CHECK (invitee_email = auth.jwt() ->> 'email');

-- Policy: Users can view their own reflections
-- CREATE POLICY "Users can view own reflections"
-- ON daily_reflections
-- FOR SELECT
-- USING (client_email = auth.jwt() ->> 'email');

-- Policy: Users can create their own reflections
-- CREATE POLICY "Users can create own reflections"
-- ON daily_reflections
-- FOR INSERT
-- WITH CHECK (client_email = auth.jwt() ->> 'email');

-- Policy: Users can update their own reflections
-- CREATE POLICY "Users can update own reflections"
-- ON daily_reflections
-- FOR UPDATE
-- USING (client_email = auth.jwt() ->> 'email');
