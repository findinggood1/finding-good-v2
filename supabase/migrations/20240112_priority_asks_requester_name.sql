-- Add requester_name column to priority_asks table
-- This stores the name of the person who created the ask (to display on results)

ALTER TABLE priority_asks
ADD COLUMN IF NOT EXISTS requester_name TEXT;

-- Update existing asks to use a default value (optional)
-- UPDATE priority_asks SET requester_name = 'A friend' WHERE requester_name IS NULL;
