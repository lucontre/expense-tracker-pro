# Expense Tracker Pro - Database Setup

## 🚨 Database Migration Required

To use the new features (profile photos, savings goals, notifications), you need to run a database migration in Supabase.

## 📋 Steps to Fix the Error

### 1. Open Supabase Dashboard
- Go to [supabase.com](https://supabase.com)
- Sign in to your account
- Select your project

### 2. Navigate to SQL Editor
- In the left sidebar, click on "SQL Editor"
- Click "New query"

### 3. Run the Migration Script
Copy and paste the following SQL script into the editor:

```sql
-- Migration: Add avatar_url column to users table
-- Run this in your Supabase SQL editor

-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create tables for new features
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('budget_exceeded', 'budget_warning', 'goal_achieved', 'goal_milestone', 'trial_ending')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for savings_goals
CREATE POLICY "Users can view their own savings goals" ON savings_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings goals" ON savings_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals" ON savings_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals" ON savings_goals
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for savings_goals
CREATE TRIGGER update_savings_goals_updated_at 
    BEFORE UPDATE ON savings_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Execute the Migration
- Click the "Run" button (or press Ctrl+Enter)
- Wait for the script to complete successfully

### 5. Test the Features
- Go back to your application
- Try uploading a profile photo again
- The error should be resolved!

## 🔧 What This Migration Does

### Database Changes:
- ✅ Adds `avatar_url` column to `users` table
- ✅ Creates `avatars` storage bucket for profile photos
- ✅ Creates `savings_goals` table for financial goals
- ✅ Creates `notifications` table for user notifications

### Security Policies:
- ✅ Users can only upload/update/delete their own avatars
- ✅ Avatar images are publicly accessible for display
- ✅ Users can only access their own savings goals
- ✅ Users can only access their own notifications

### Features Enabled:
- 📸 **Profile Photos**: Upload and manage avatar images
- 💰 **Savings Goals**: Set and track financial objectives
- 🔔 **Notifications**: Receive alerts and updates
- 📊 **Advanced Charts**: Visualize financial data

## 🆘 Troubleshooting

### If you get permission errors:
1. Make sure you're logged in as the project owner
2. Check that RLS is enabled on your tables
3. Verify the policies were created correctly

### If the storage bucket already exists:
- The script uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times

### If you need to rollback:
- You can drop the new columns and tables if needed
- The migration is designed to be non-destructive

## 📞 Need Help?

If you're still having issues:
1. Check the Supabase logs for detailed error messages
2. Make sure your Supabase project is active
3. Verify your environment variables are correct

---

**Note**: This migration is required for the new premium features. Once completed, you'll have access to profile photos, savings goals, and notifications!
