-- Add question column to predictions table
-- Stores user's core question (editable over time)
-- Part of Together/Campfire rebuild - Jan 2026

ALTER TABLE predictions ADD COLUMN IF NOT EXISTS question TEXT;
