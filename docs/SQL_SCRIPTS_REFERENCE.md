# SQL Scripts Reference

This document describes the SQL scripts maintained in the project.

## 📋 Main Scripts (Root Directory)

### Fix/Scripts
- **`fix_savings_goals_table.sql`** - Creates/fixes the savings_goals table structure and RLS policies
- **`fix_budgets_table.sql`** - Creates/fixes the budgets table structure, migrates data from category TEXT to category_id UUID
- **`create_transactions_table.sql`** - Creates/updates transactions table with all required columns (currency, created_by_user_id)

### Complete Migrations
- **`complete_categories_setup.sql`** - Complete setup for categories table:
  - Adds `type` column (income/expense)
  - Adds `is_system` column
  - Updates existing categories
  - Inserts all income and expense default categories
- **`complete_transactions_migration.sql`** - Complete migration for transactions table with category_id foreign key
- **`complete_account_sharing_migration.sql`** - Complete setup for account sharing feature

### Specific Migrations
- **`currency_migration.sql`** - Adds currency column to `users` table
- **`transactions_currency_migration.sql`** - Adds currency column to `transactions` table
- **`terms_acceptance_migration.sql`** - Adds terms acceptance fields to users table
- **`database_migration.sql`** - Adds avatar_url column and storage bucket setup for avatars

## 📁 Official Schema Scripts (`docs/schema/`)

These are the **official** schema scripts referenced in documentation:

- **`docs/schema/database.sql`** - Initial database schema (users, transactions, budgets)
- **`docs/schema/subscription.sql`** - Subscription plans, user subscriptions, payment methods, invoices
- **`docs/schema/add_profile_columns.sql`** - Profile-related columns (language, theme, etc.)
- **`docs/schema/fix_users.sql`** - Fixes and updates to users table

## 🔧 When to Use Each Script

### For New Database Setup
1. Run `docs/schema/database.sql` first
2. Run `docs/schema/subscription.sql` for subscription features
3. Run `complete_categories_setup.sql` for categories
4. Run `create_transactions_table.sql` for transactions table
5. Run `fix_budgets_table.sql` for budgets table
6. Run `fix_savings_goals_table.sql` for savings goals

### For Existing Databases
- Use fix scripts (`fix_*.sql`) when you need to update existing table structures
- Use migration scripts (`*_migration.sql`) when adding new columns/features
- Use complete scripts (`complete_*.sql`) for full feature setup

## 📝 Notes

- Scripts use `IF NOT EXISTS` clauses where possible to avoid errors
- All scripts include RLS (Row Level Security) policies
- Scripts are designed to be idempotent (can be run multiple times safely)
- Always backup your database before running migration scripts

---
**Last Updated**: 2025-01-29

