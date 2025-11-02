-- Fix budgets table structure
-- Run this in your Supabase SQL editor

-- 1. Create budgets table if it doesn't exist with correct structure
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add category_id column if it doesn't exist (in case old structure exists)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 3. Migrate data from category TEXT to category_id UUID if needed
-- This will try to match category names to category IDs
-- If no match is found, category_id will remain NULL
DO $$
DECLARE
  budget_record RECORD;
  matched_category_id UUID;
BEGIN
  -- Only migrate if category column exists and category_id is NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budgets' AND column_name = 'category'
  ) THEN
    FOR budget_record IN SELECT id, category FROM budgets WHERE category_id IS NULL AND category IS NOT NULL
    LOOP
      -- Try to find matching category by name
      SELECT id INTO matched_category_id 
      FROM categories 
      WHERE name = budget_record.category 
      LIMIT 1;
      
      -- Update budget with matched category_id
      IF matched_category_id IS NOT NULL THEN
        UPDATE budgets 
        SET category_id = matched_category_id 
        WHERE id = budget_record.id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);

-- 5. Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

-- 7. Create RLS policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create trigger for updated_at (if function exists)
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify structure
SELECT 'Budgets table structure updated successfully!' as status;

-- 10. Check current data
SELECT COUNT(*) as budget_count FROM budgets;
