import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdsgkddrnqhhtncfeqxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2drZGRybnFoaHRuY2ZlcXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI5NDgxNiwiZXhwIjoyMDgyODcwODE2fQ.b8fZ1eboAezw1GU46iGz2AUlP6ZWMOVtlL22LBNp_v8'
);

// Try to insert and see what happens - this tests if table exists
const { data, error } = await supabase
  .from('outcome_predictions')
  .select('id')
  .limit(1);

if (error && error.code === 'PGRST205') {
  console.log('Table does not exist - needs to be created in Supabase Dashboard');
  console.log('\nRun this SQL in Supabase SQL Editor:');
  console.log(`
CREATE TABLE outcome_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email TEXT NOT NULL,
  validation_id UUID REFERENCES validations(id),
  engagement_id UUID,
  prediction_text TEXT NOT NULL,
  action_text TEXT,
  timeframe TEXT,
  outcome TEXT,
  outcome_text TEXT,
  outcome_accuracy INTEGER,
  learning TEXT,
  week_of DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'reviewed')),
  checked_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_outcome_pred_client ON outcome_predictions(client_email);
CREATE INDEX idx_outcome_pred_status ON outcome_predictions(status);
  `);
} else if (error) {
  console.log('Other error:', error);
} else {
  console.log('Table exists! Data:', data);
}
