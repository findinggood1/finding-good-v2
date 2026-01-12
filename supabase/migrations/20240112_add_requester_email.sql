-- Add requester_email to priority_asks for easier lookup
ALTER TABLE priority_asks ADD COLUMN IF NOT EXISTS requester_email TEXT;

-- Backfill existing rows from auth.users if possible
UPDATE priority_asks pa
SET requester_email = (
  SELECT email FROM auth.users WHERE id = pa.user_id
)
WHERE requester_email IS NULL;
