-- Share Visibility table
-- Tracks who can see whose shares (connections between users)
-- A connection is created when User A sends an ask and User B responds
CREATE TABLE IF NOT EXISTS share_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_email TEXT NOT NULL,
  user_b_email TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'one_way' CHECK (connection_type IN ('one_way', 'mutual')),
  created_via TEXT NOT NULL CHECK (created_via IN ('ask_response', 'priority_share', 'proof_request')),
  notes TEXT,
  support_description TEXT,
  muted_at TIMESTAMPTZ,
  mute_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_a_email, user_b_email)
);

CREATE INDEX IF NOT EXISTS idx_share_visibility_user_a ON share_visibility(user_a_email);
CREATE INDEX IF NOT EXISTS idx_share_visibility_user_b ON share_visibility(user_b_email);

-- Inspiration Shares table
-- Stores priorities and proofs that users have opted to share to Campfire
CREATE TABLE IF NOT EXISTS inspiration_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('priority', 'proof')),
  source_id UUID NOT NULL,
  share_text TEXT NOT NULL,
  fires_extracted JSONB DEFAULT '[]',
  prediction_id UUID,
  hidden_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspiration_shares_client ON inspiration_shares(client_email);
CREATE INDEX IF NOT EXISTS idx_inspiration_shares_type ON inspiration_shares(content_type);
CREATE INDEX IF NOT EXISTS idx_inspiration_shares_created ON inspiration_shares(created_at DESC);

-- Integrity Maps table
-- Weekly AI-generated snapshots of clarity and confidence
CREATE TABLE IF NOT EXISTS integrity_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  summary TEXT,
  predictions_data JSONB DEFAULT '[]',
  fires_patterns JSONB DEFAULT '{}',
  connection_activity JSONB DEFAULT '[]',
  wins JSONB DEFAULT '[]',
  focus_next JSONB DEFAULT '[]',
  coach_layer JSONB,
  shared_with JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_maps_client ON integrity_maps(client_email);
CREATE INDEX IF NOT EXISTS idx_integrity_maps_created ON integrity_maps(created_at DESC);

-- RLS Policies for share_visibility
ALTER TABLE share_visibility ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections they're part of"
  ON share_visibility FOR SELECT
  USING (auth.jwt() ->> 'email' = user_a_email OR auth.jwt() ->> 'email' = user_b_email);

CREATE POLICY "Users can create connections they initiate"
  ON share_visibility FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_a_email);

CREATE POLICY "Users can update connections they created"
  ON share_visibility FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_a_email);

-- RLS Policies for inspiration_shares
ALTER TABLE inspiration_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
  ON inspiration_shares FOR SELECT
  USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can view connected users shares"
  ON inspiration_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM share_visibility
      WHERE (
        (user_a_email = auth.jwt() ->> 'email' AND user_b_email = inspiration_shares.client_email)
        OR (user_b_email = auth.jwt() ->> 'email' AND user_a_email = inspiration_shares.client_email)
      )
      AND muted_at IS NULL
    )
  );

CREATE POLICY "Users can create own shares"
  ON inspiration_shares FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can update own shares"
  ON inspiration_shares FOR UPDATE
  USING (auth.jwt() ->> 'email' = client_email);

-- RLS Policies for integrity_maps
ALTER TABLE integrity_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maps"
  ON integrity_maps FOR SELECT
  USING (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can create own maps"
  ON integrity_maps FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = client_email);

CREATE POLICY "Users can update own maps"
  ON integrity_maps FOR UPDATE
  USING (auth.jwt() ->> 'email' = client_email);

-- Updated at trigger for share_visibility
CREATE OR REPLACE FUNCTION update_share_visibility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS share_visibility_updated_at ON share_visibility;
CREATE TRIGGER share_visibility_updated_at
  BEFORE UPDATE ON share_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_share_visibility_updated_at();
