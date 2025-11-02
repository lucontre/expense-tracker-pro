# Subscription & Payment Setup Guide

This guide will help you set up the subscription and payment features for Expense Tracker Pro.

## Prerequisites

- Access to your Supabase project
- Basic knowledge of PostgreSQL

## Step 1: Run the Subscription SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Open the file `docs/schema/subscription.sql` from this repository
5. Copy the **entire contents** of the file
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

This will:
- Add a `subscription_plan` column to the users table
- Create `subscription_plans`, `user_subscriptions`, `payment_methods`, `invoices`, and `categories` tables
- Insert default subscription plans (Free and Pro)
- Insert default expense categories
- Set up Row Level Security (RLS) policies

## Step 2: Verify the Setup

Run this query to verify the subscription plans were created:

```sql
SELECT * FROM subscription_plans;
```

You should see two plans:
- Free Plan ($0.00)
- Pro Plan ($9.99)

## Step 3: Verify Default Categories

Run this query to see the default categories:

```sql
SELECT * FROM categories ORDER BY type, name;
```

You should see 14 default categories (5 income, 9 expense).

## Step 4: Understanding the Plans

### Free Plan
- **Price:** $0/month
- **Limits:**
  - 50 transactions per month
  - 10 categories
  - 5 budgets
  - Basic reports only
  - No export functionality
  - No advanced analytics
  - No custom categories

### Pro Plan
- **Price:** $9.99/month
- **Features:**
  - Unlimited transactions
  - Unlimited categories
  - Unlimited budgets
  - Advanced analytics
  - Export reports (PDF/Excel)
  - Custom categories with icons
  - Priority support
  - API access
  - Email reports

## Step 5: (Optional) Configure Stripe Integration

To enable actual payment processing:

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add them to your environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
4. Update the `stripe_price_id` fields in the `subscription_plans` table with your Stripe Price IDs

## Usage in the Application

### Checking User Plan

```typescript
const { data } = await supabase
  .from('users')
  .select('subscription_plan')
  .eq('id', user.id)
  .single();

const plan = data?.subscription_plan; // 'free' or 'pro'
```

### Checking Plan Limits

```typescript
const { data } = await supabase
  .from('subscription_plans')
  .select('limits')
  .eq('id', plan)
  .single();

const limits = data?.limits; // JSON object with plan limits
```

### Validating Feature Access

```typescript
function canExportReports(plan: string): boolean {
  // Pro plan users can export reports
  return plan === 'pro';
}
```

## Next Steps

1. Implement the payment checkout flow (see `/checkout` page)
2. Add plan upgrade/downgrade functionality
3. Implement usage tracking and limits enforcement
4. Add subscription management page
5. Set up webhooks for payment events (Stripe)

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the `subscription.sql` file
- Check that you're using the correct database

### RLS policy errors
- Verify that the RLS policies were created
- Check that users are authenticated before accessing subscription data

### Default categories not appearing
- Run the INSERT statements manually if they failed
- Check for conflicts with existing category names

## Support

If you encounter any issues, check the [Supabase documentation](https://supabase.com/docs) or the project's README.
