# Profile & Trial Features Setup

## Overview
This document explains the new profile features including language switching, theme management, and the 7-day free trial system.

## Features Implemented

### 1. Profile Management
- **Language Support**: English (default) and Spanish
- **Theme Support**: Light (default) and Dark mode
- **User Preferences**: Stored in database and localStorage
- **Subscription Management**: View current plan, start trial, cancel subscription

### 2. 7-Day Free Trial
- **Trial Period**: 7 days from activation
- **Trial Features**: Full Pro access during trial
- **Trial Status**: Tracked in database with start/end dates
- **Trial Expiration**: Automatic downgrade to Free plan

### 3. Database Schema Updates

#### Users Table Additions
```sql
-- Add new columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;
```

#### Subscription Status
- `free`: Free plan user
- `pro`: Pro plan user (paid or trial)
- `trial`: Currently in trial period
- `cancelled`: Subscription cancelled (access until period end)

## Setup Instructions

### 1. Run Database Migration
Execute the updated SQL schema in Supabase:

```sql
-- Copy and paste the contents of docs/schema/subscription.sql
-- This includes the new columns for language, theme, and trial
```

### 2. Web Application
- **Profile Page**: `/profile` - Complete profile management
- **Language Switching**: Real-time language change
- **Theme Switching**: Real-time dark/light mode toggle
- **Trial Management**: Start trial, view days remaining, cancel subscription

### 3. Mobile Application
- **Profile Screen**: New tab in bottom navigation
- **Language Toggle**: English/Spanish buttons
- **Theme Toggle**: Dark mode switch
- **Trial Management**: Start trial, view status, cancel subscription

## Usage

### Starting a Trial
1. User clicks "Start 7-Day Free Trial"
2. System updates user to Pro plan
3. Creates trial subscription record
4. Trial expires after 7 days

### Language Switching
1. User selects language in profile
2. Interface updates immediately
3. Preference saved to database
4. Persists across sessions

### Theme Switching
1. User toggles dark/light mode
2. Theme applies immediately
3. Preference saved to database
4. Persists across sessions

## Trial Logic

### Trial Active
- User has `subscription_plan = 'pro'`
- Subscription status is `'trial'`
- `trial_started_at` is set
- Days remaining > 0

### Trial Expired
- User has `subscription_plan = 'pro'`
- Subscription status is `'trial'`
- Days remaining = 0
- Should be downgraded to Free plan

### Trial Management
- Users can start trial from Free plan
- Trial cannot be extended
- After trial: user must upgrade to Pro or downgrade to Free
- Trial status is clearly displayed in UI

## Files Modified

### Web Application
- `web/src/app/profile/page.tsx` - New profile page
- `web/src/app/dashboard/page.tsx` - Added profile link
- `shared/types/index.ts` - Updated User interface

### Mobile Application
- `mobile/src/screens/ProfileScreen.tsx` - New profile screen
- `mobile/App.tsx` - Added profile tab
- `mobile/src/screens/SettingsScreen.tsx` - Updated with subscription info

### Database
- `docs/schema/subscription.sql` - Added language, theme, trial columns

## Testing

### Web Testing
1. Navigate to `http://localhost:3000/profile`
2. Test language switching (English/Spanish)
3. Test theme switching (Light/Dark)
4. Test trial start (if Free user)
5. Test subscription management (if Pro user)

### Mobile Testing
1. Open mobile app: `http://localhost:8082`
2. Navigate to Profile tab
3. Test language toggle
4. Test dark mode switch
5. Test trial management

## Notes

- **Default Language**: English
- **Default Theme**: Light
- **Trial Duration**: 7 days
- **Trial Limit**: One trial per user
- **Theme Persistence**: Stored in localStorage and database
- **Language Persistence**: Stored in database

## Future Enhancements

- Multiple language support
- More theme options
- Trial extension options
- Subscription analytics
- User onboarding flow
