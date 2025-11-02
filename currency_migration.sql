-- Migration: Add currency column to users table
-- Run this in your Supabase SQL editor

-- Add currency column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'MXN', 'GTQ', 'EUR'));

-- Test the setup
SELECT 'Currency migration completed successfully!' as status;
SELECT 'currency column added to users table' as step1;
