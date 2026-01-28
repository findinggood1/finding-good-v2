-- Add RLS policies for predictions table to allow users to manage their own predictions
-- This enables delete functionality that was being blocked by RLS

-- Enable RLS on predictions if not already enabled
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON predictions;

-- Create policies for predictions
-- View: Users can see their own predictions
CREATE POLICY "Users can view own predictions" ON predictions
  FOR SELECT USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

-- Insert: Users can create predictions for themselves
CREATE POLICY "Users can insert own predictions" ON predictions
  FOR INSERT WITH CHECK (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

-- Update: Users can update their own predictions
CREATE POLICY "Users can update own predictions" ON predictions
  FOR UPDATE USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

-- Delete: Users can delete their own predictions
CREATE POLICY "Users can delete own predictions" ON predictions
  FOR DELETE USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

-- Also add RLS policies for related tables

-- prediction_connections
ALTER TABLE prediction_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own prediction_connections" ON prediction_connections;
DROP POLICY IF EXISTS "Users can insert own prediction_connections" ON prediction_connections;
DROP POLICY IF EXISTS "Users can delete own prediction_connections" ON prediction_connections;

CREATE POLICY "Users can view own prediction_connections" ON prediction_connections
  FOR SELECT USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

CREATE POLICY "Users can insert own prediction_connections" ON prediction_connections
  FOR INSERT WITH CHECK (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

CREATE POLICY "Users can delete own prediction_connections" ON prediction_connections
  FOR DELETE USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

-- snapshots
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own snapshots" ON snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON snapshots;
DROP POLICY IF EXISTS "Users can update own snapshots" ON snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON snapshots;

CREATE POLICY "Users can view own snapshots" ON snapshots
  FOR SELECT USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

CREATE POLICY "Users can insert own snapshots" ON snapshots
  FOR INSERT WITH CHECK (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

CREATE POLICY "Users can update own snapshots" ON snapshots
  FOR UPDATE USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );

CREATE POLICY "Users can delete own snapshots" ON snapshots
  FOR DELETE USING (
    client_email = auth.jwt() ->> 'email'
    OR client_email = current_setting('request.jwt.claims', true)::json ->> 'email'
  );
