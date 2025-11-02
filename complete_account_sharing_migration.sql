-- Complete Account Sharing Migration
-- Run this in your Supabase SQL editor

-- Step 1: Create account_sharing table
CREATE TABLE IF NOT EXISTS account_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sharing_code TEXT UNIQUE NOT NULL,
  permissions TEXT DEFAULT 'read_write' CHECK (permissions IN ('read_only', 'read_write')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only be shared with once
  UNIQUE(primary_user_id, shared_user_id)
);

-- Step 2: Add created_by_user_id columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE savings_goals 
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- Step 3: Enable RLS
ALTER TABLE account_sharing ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sharing relationships" ON account_sharing;
DROP POLICY IF EXISTS "Users can create sharing relationships" ON account_sharing;
DROP POLICY IF EXISTS "Users can update their own sharing relationships" ON account_sharing;
DROP POLICY IF EXISTS "Users can delete their own sharing relationships" ON account_sharing;

-- Step 5: Create RLS policies
CREATE POLICY "Users can view their own sharing relationships" ON account_sharing
FOR SELECT USING (
  auth.uid() = primary_user_id OR 
  auth.uid() = shared_user_id
);

CREATE POLICY "Users can create sharing relationships" ON account_sharing
FOR INSERT WITH CHECK (auth.uid() = primary_user_id);

CREATE POLICY "Users can update their own sharing relationships" ON account_sharing
FOR UPDATE USING (
  auth.uid() = primary_user_id OR 
  auth.uid() = shared_user_id
);

CREATE POLICY "Users can delete their own sharing relationships" ON account_sharing
FOR DELETE USING (
  auth.uid() = primary_user_id OR 
  auth.uid() = shared_user_id
);

-- Step 6: Create function for generating sharing codes
CREATE OR REPLACE FUNCTION generate_sharing_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a 6-character alphanumeric code
  code := upper(substring(md5(random()::text) from 1 for 6));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM account_sharing WHERE sharing_code = code) LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_account_sharing_updated_at ON account_sharing;
CREATE TRIGGER update_account_sharing_updated_at
    BEFORE UPDATE ON account_sharing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Test the setup
SELECT 'Migration completed successfully!' as status;
SELECT 'account_sharing table created' as step1;
SELECT 'RLS policies created' as step2;
SELECT 'Sharing code function created' as step3;

-- Step 9: Test the function
SELECT generate_sharing_code() as test_code;
