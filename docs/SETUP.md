# Setup Guide

## Quick Start

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy the project URL and anon key from Settings → API
3. Open the SQL Editor in Supabase dashboard
4. Copy and paste the contents of `docs/schema/database.sql` into the editor
5. Run the SQL to create tables, policies, and triggers

### 2. Web Application Setup

```bash
cd web
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm run dev
```

### 3. Mobile Application Setup

```bash
cd mobile
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm start
```

## File Structure

```
expense-tracker-pro/
├── web/                      # Next.js web app
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   │   ├── dashboard/   # Dashboard page
│   │   │   ├── login/       # Login page
│   │   │   └── layout.tsx   # Root layout
│   │   └── lib/
│   │       └── supabase/    # Supabase clients
│   ├── middleware.ts        # Auth middleware
│   └── package.json
├── mobile/                   # React Native mobile app
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Supabase client
│   │   └── types/           # TypeScript types
│   ├── App.tsx              # Root component
│   └── package.json
├── shared/                   # Shared code
│   ├── types/               # TypeScript types
│   └── package.json
└── docs/                     # Documentation
    └── schema/
        └── database.sql     # Database schema
```

## Key Files

### Authentication

- `web/src/lib/supabase/client.ts` - Browser client
- `web/src/lib/supabase/server.ts` - Server client
- `web/src/lib/supabase/middleware.ts` - Middleware helpers
- `web/middleware.ts` - Next.js middleware
- `mobile/src/lib/supabase.ts` - Mobile client

### Shared Types

- `shared/types/index.ts` - All TypeScript interfaces

### Pages

- `web/src/app/page.tsx` - Landing page
- `web/src/app/login/page.tsx` - Login/signup
- `web/src/app/dashboard/page.tsx` - Dashboard

## Environment Variables

### Web (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Mobile (.env)
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Database Schema

The database includes:

1. **users** - User profiles
2. **transactions** - Income/expense records
3. **budgets** - Budget allocations

All tables have Row Level Security (RLS) enabled with policies that ensure users can only access their own data.

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database schema
3. ✅ Configure environment variables
4. ✅ Start development servers
5. ⏭️ Add transaction management
6. ⏭️ Implement budget features
7. ⏭️ Add reports and analytics
8. ⏭️ Polish UI/UX
9. ⏭️ Deploy to production
