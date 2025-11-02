-- Migration: Add terms_accepted column to users table
-- Run this in your Supabase SQL editor

-- Add terms_accepted column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

-- Add terms_accepted_at column to track when terms were accepted
ALTER TABLE users
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Test the setup
SELECT 'Terms acceptance migration completed successfully!' as status;
SELECT 'terms_accepted column added to users table' as step1;
SELECT 'terms_accepted_at column added to users table' as step2;
