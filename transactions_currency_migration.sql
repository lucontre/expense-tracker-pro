-- Migration: Add currency column to transactions table
-- Run this in your Supabase SQL editor

-- Add currency column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'MXN', 'GTQ', 'EUR'));

-- Test the setup
SELECT 'Transactions currency migration completed successfully!' as status;
SELECT 'currency column added to transactions table' as step1;
