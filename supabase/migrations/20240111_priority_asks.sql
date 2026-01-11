-- Priority Asks table
-- Stores requests for external perspectives on what matters most
CREATE TABLE IF NOT EXISTS priority_asks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  relationship TEXT,
  personal_message TEXT,
  linked_prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  custom_question TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Priority Responses table
-- Stores anonymous responses to asks
CREATE TABLE IF NOT EXISTS priority_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ask_id UUID NOT NULL REFERENCES priority_asks(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_priority_asks_user_id ON priority_asks(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_asks_token ON priority_asks(token);
CREATE INDEX IF NOT EXISTS idx_priority_asks_status ON priority_asks(status);
CREATE INDEX IF NOT EXISTS idx_priority_asks_linked_prediction ON priority_asks(linked_prediction_id);
CREATE INDEX IF NOT EXISTS idx_priority_responses_ask_id ON priority_responses(ask_id);

-- RLS Policies for priority_asks
ALTER TABLE priority_asks ENABLE ROW LEVEL SECURITY;

-- Users can view their own asks
CREATE POLICY "Users can view own asks"
  ON priority_asks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create asks
CREATE POLICY "Users can create asks"
  ON priority_asks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own asks
CREATE POLICY "Users can update own asks"
  ON priority_asks FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone can view asks by token (for respond page) - no auth required
CREATE POLICY "Anyone can view asks by token"
  ON priority_asks FOR SELECT
  USING (true);

-- RLS Policies for priority_responses
ALTER TABLE priority_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can create responses (anonymous)
CREATE POLICY "Anyone can create responses"
  ON priority_responses FOR INSERT
  WITH CHECK (true);

-- Users can view responses to their asks
CREATE POLICY "Users can view responses to own asks"
  ON priority_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM priority_asks
      WHERE priority_asks.id = priority_responses.ask_id
      AND priority_asks.user_id = auth.uid()
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_priority_asks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS priority_asks_updated_at ON priority_asks;
CREATE TRIGGER priority_asks_updated_at
  BEFORE UPDATE ON priority_asks
  FOR EACH ROW
  EXECUTE FUNCTION update_priority_asks_updated_at();
