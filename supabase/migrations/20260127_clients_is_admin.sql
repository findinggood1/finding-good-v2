-- Add is_admin column to clients table for role-based access control
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
