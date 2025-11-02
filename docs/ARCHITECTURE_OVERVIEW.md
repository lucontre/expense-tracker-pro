# Expense Tracker Pro – Architectural Overview

This document describes the current structure, responsibilities, and data flow of the project after the latest refactors.

---

## Repository layout

```
expense-tracker-pro/
├── docs/                         ← Project documentation (this file, guides, SQL references)
├── shared/                       ← TypeScript definitions shared by web & mobile
├── web/                          ← Next.js application
│   ├── src/
│   │   ├── app/                  ← Route segments (App Router)
│   │   ├── components/           ← Reusable UI components for the web app
│   │   ├── hooks/                ← Hooks wrapping Supabase + UI state
│   │   ├── lib/                  ← Supabase clients, plan limits, helpers
│   │   └── utils/                ← Utility helpers (exports, translations, etc.)
│   └── eslint.config.mjs, tsconfig.json, …
├── mobile/                       ← Expo / React Native application
│   ├── src/
│   │   ├── components/           ← Native UI components (FAB, modals, navigation, …)
│   │   ├── hooks/                ← Shared hooks (theme, currency)
│   │   ├── lib/                  ← Supabase client wrapper
│   │   ├── screens/              ← Feature screens (Dashboard, Transactions, …)
│   │   └── types/                ← Re-export of shared TypeScript types
│   └── app.json, App.tsx, metro.config.js, tsconfig.json, …
├── SQL migration files           ← Schema/data fixes for Supabase tables
└── package.json / package-lock   ← Workspace root configuration
```

The monorepo uses npm workspaces. `shared/` exposes domain types (users, transactions, budgets, notifications, etc.) consumed by both clients to keep models aligned with the Supabase schema.

---

## Shared types (`shared/types/index.ts`)

Key interfaces describe the Supabase schema (users, transactions, budgets, savings goals, notifications) and DTOs used by both apps. All names follow camelCase to mirror the shape used in the React code; when Supabase returns snake_case columns we normalise them in the mobile/web data mappers.

---

## Environment Variables

### Web (`web/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |

**Usage:**
* `web/src/lib/supabase/client.ts` – Browser client initialization
* `web/src/lib/supabase/server.ts` – Server-side client for RSC
* `web/src/lib/supabase/middleware.ts` – Middleware session updates

**Current configuration (development):**
* Hardcoded fallbacks exist in `client.ts` if env vars are not set
* **Security note:** Production deployments should always use env vars, never hardcoded keys

### Mobile (`mobile/.env` or `mobile/src/config/supabase.ts`)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |

**Usage:**
* `mobile/src/lib/supabase.ts` – Mobile client initialization
* Currently uses `mobile/src/config/supabase.ts` with hardcoded values
* **Migration note:** Should migrate to `.env` files for better security

**Configuration files:**
* `mobile/src/config/supabase.ts` – Exports `SUPABASE_CONFIG` object
* `mobile/src/lib/supabase.ts` – Imports config and creates singleton client

---

## Mobile app (Expo / React Native)

### App entry point (`mobile/App.tsx`)

* Creates a single Supabase client via `createClient` (`src/lib/supabase.ts`).
* Wraps navigation with providers:
  * `SafeAreaProvider` from `react-native-safe-area-context`.
  * `ThemeProvider` (`src/hooks/useTheme`) – handles dark/light palette tokens.
  * `CurrencyProvider` (`src/hooks/useCurrency`) – exposes formatting helpers and the user’s preferred currency.
* Uses a `StackNavigator` from `@react-navigation/stack`. Each screen is wrapped with `withNavigation` to inject the floating menu.
* Auth state is observed with `supabase.auth.onAuthStateChange`. When the session changes, navigation is reset to either `Dashboard` (authenticated) or `Auth` (no session). While we check the initial session we render a centered `ActivityIndicator`.

### Navigation

* `src/components/WithNavigation.tsx` – Higher-order component that renders:
  * `NavigationMenu` – hamburger FAB with menu items and logout.
  * The wrapped screen as child.
* `NavigationMenu` keeps local state for modal visibility (`visible`) and handles sign-out through Supabase, then resets navigation to the `Auth` stack.

### Supabase client (`src/lib/supabase.ts`)

Uses the Expo SDK (`@supabase/supabase-js`) with configuration from `src/config/supabase.ts`. Exported helper `createClient()` returns a singleton per call site – the hooks/components simply call it when needed.

**Configuration flow:**
* `mobile/src/config/supabase.ts` – exports hardcoded `SUPABASE_CONFIG` object with URL and anon key.
* `mobile/src/lib/supabase.ts` – imports config and creates a singleton client.
* Client uses `AsyncStorage` for session persistence (`auth.storage`).
* Auto-refresh enabled (`auth.autoRefreshToken: true`).
* Session persistence enabled (`auth.persistSession: true`).

**Security note:** Currently uses hardcoded credentials; should migrate to `.env` files with `EXPO_PUBLIC_*` prefix.

### Hooks

* `useCurrency`
  * Reads the user’s preferred currency (default USD) and exposes `getAllCurrencies()`, `formatCurrency(number[, currencyCode])`.
* `useTheme`
  * Stores theme selection in Supabase user metadata and applies palette tokens.
* `useAppNavigation`
  * Convenience wrappers around `useNavigation` for strongly typed navigation to specific stacks/screens.

### Screens (high level responsibilities)

* `AuthScreen.tsx` – handles login/sign-up flow (modal for terms acceptance, password reset).
* `DashboardScreen.tsx`
  * Fetches transactions & categories, filters by user-selected currency.
  * Calculates stats (total income/expenses/balance) and builds datasets for future chart rendering.
  * Renders quick navigation tiles, recent transactions and provides shortcuts to modals.
* `TransactionsScreen.tsx`
  * Fetches transactions & categories.
  * Allows CRUD on transactions with modals, advanced filters (Pro users) for type, categories, date range.
  * The floating action button opens the modal with default values.
* `BudgetsScreen.tsx`
  * Lists user budgets, normalises Supabase rows to the shared `Budget` type (camelCase fields).
  * Provides modal to add/edit budgets with category selection.
* `ReportsScreen.tsx`
  * Displays aggregated stats, gated by subscription plan.
* `SavingsGoalsScreen.tsx`
  * CRUD for savings goals. Converts Supabase snake_case fields into camelCase `SavingsGoal` model.
  * Calculates progress and days remaining for each goal.
* `NotificationsScreen.tsx`
  * Fetches notifications, maps them to shared type, provides mark-as-read / delete actions.
* `AccountSharingScreen.tsx`
  * Generates sharing codes using Supabase RPC (`generate_sharing_code`).
  * Participants can join with a code; owners can revoke access.
* `SettingsScreen.tsx`, `ProfileScreen.tsx`, `ExportScreen.tsx`, `ContactScreen.tsx`, `NotificationsScreen.tsx`, `TestScreen.tsx` – manage user profile, preferences, export placeholders, etc.

Each screen follows a similar pattern:

1. Fetch data in `loadData()` with Supabase queries.
2. Normalise rows into shared types (camelCase) before storing in state.
3. Provide modals for CRUD operations with form state stored in `useState`.
4. Provide onRefresh handlers for pull-to-refresh.

### Components

* `FloatingActionButton.tsx` – positioned bottom-left, triggers actions passed via `onPress`.
* `TermsModal.tsx`, `ProRestriction.tsx`, `Avatar.tsx` – cross-screen utilities.
* `Chart.tsx`
  * Wrapper around `react-native-chart-kit` (line/pie/bar).  
  * Accepts typed datasets and renders according to `type` prop.

---

## Web app (Next.js 16, App Router)

### Entry (`web/src/app/layout.tsx`)

* Wraps routes with `<AuthenticatedLayout>` where required.  
* Applies global styles and language/theme providers similar to the mobile approach.

### Supabase integration

**Client configuration:**

* `web/src/lib/supabase/client.ts` – browser client for Supabase (used in client components).
  * Uses `createBrowserClient` from `@supabase/ssr`.
  * Singleton pattern – returns existing client if already created.
  * Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env.
  * Has hardcoded fallbacks for development.
  
* `web/src/lib/supabase/server.ts` – server-side client for route handlers and RSC.
  * Uses `createServerClient` from `@supabase/ssr`.
  * Integrates with Next.js cookie store for session management.
  * Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  * Handles cookie get/set operations for auth state.
  
* `web/src/lib/supabase/middleware.ts` – middleware helper for session management.
  * Uses `updateSession(request)` to refresh auth tokens.
  * Currently mostly disabled but kept for reference.
  * Historically used to redirect authenticated users away from `/login`.

### Plan limits (`web/src/lib/plan-limits.ts`)

Contains helper functions like `checkTransactionLimit`, `canExportReports`, `canCreateCustomCategories`, used by pages to gate Pro features.

### Hooks

* `useLanguage` – persists language preference and listens for Supabase auth changes to update settings.  
* `useCurrency` – same as mobile but returning web-specific formatting functions.  
* `useTheme` – toggles dark/light theme & syncs with user metadata.

### Components

* `Navigation` – top navigation with mobile collapsible menu. Translation-aware labels.  
* `TransactionModal`, `TermsModal`, `Loading` (spinner/skeleton), `Logo`, `Avatar` – reusable UI building blocks.  
* `AccountSharingManager` – web counterpart to the mobile account sharing screen (list, generate codes, join by code).

### Pages (App Router segments)

* `dashboard/page.tsx` – main dashboard view with stats, top transactions, currency filter. Fetches transactions/categories/totals via Supabase client.
* `transactions/page.tsx`
  * Suspense wrapper for listing/CRUD with advanced filters (Pro gate).
* `budgets`, `savings-goals`, `notifications`, `profile`, `settings/...` – match the mobile feature set.
* `export/page.tsx`
  * Web view for export options (full functionality gated by Pro subscription).
* `login`, `reset-password` – authentication flows (mirrors mobile logic).
* `api/delete-account/route.ts`
  * Server action that validates the user session, deletes user-related data across tables, and removes the auth user via Supabase Service Role.

### Middleware (`web/middleware.ts`)

Currently mostly inert; historically used to redirect authenticated users away from `/login`. The helper `updateSession` is still available for future reinstatement.

---

## Supabase tables touched by the apps

| Table | Usage |
|-------|-------|
| `users` | Stores profile metadata (language, theme, subscription plan, terms acceptance). Both apps update/read these fields. |
| `transactions` | Core income/expense records. CRUD from web & mobile. |
| `categories` | Income/expense categories. System categories flagged via `is_system`. |
| `budgets` | User budgets linked to categories. |
| `savings_goals` | Targets with current/target amounts and optional target date. |
| `notifications` | In-app notifications (budget alerts, reminders, etc.). |
| `account_sharing` | Linking owners to shared users via `sharing_code`, status transitions (pending → active → revoked). |

RPC functions:

* `generate_sharing_code` – Supabase function to create unique sharing codes (used by mobile & web account sharing screens).

---

## Notes on naming & data mapping

* Supabase rows still arrive in snake_case (`created_at`, `sharing_code`, `target_amount`).
* Screens/components map them to the camelCase interfaces in `shared/types` before storing in local state (see `BudgetsScreen`, `SavingsGoalsScreen`, `NotificationsScreen` for reference).
* When writing back to Supabase we convert the camelCase fields back to the column names expected by the database.

---

## Future documentation slices

This document covers the high-level architecture. For further detail we can create complementary notes:

* **Feature-specific guides** – e.g. “Transactions flow (web/mobile)” with diagrams of CRUD, filters, modals.
* **Supabase schema** – mapping of columns, constraints, triggers to the shared types and code paths.
* **Testing / QA checklists** – current manual test cases for each screen or upcoming automated testing strategy.

Let me know the next area you’d like to deep-dive and we can expand upon it incrementally.

---

## Mobile Screens – Detailed Reference

### `DashboardScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `user` | `any` | Cached Supabase auth user (for greeting and filters). |
| `userFullName` | `string` | Friendly name shown in the welcome message (falls back to email). |
| `allTransactions` | `Transaction[]` | Raw transactions fetched from Supabase (all currencies). |
| `displayTransactions` | `Transaction[]` | Transactions filtered by `selectedCurrency` for UI rendering. |
| `categories` | `Category[]` | List of categories used for quick lookups in stats/modals. |
| `loading` / `refreshing` | `boolean` | Loading indicators for screen boot + pull-to-refresh. |
| `selectedCurrency` | `string` | Currency code currently selected in the filter dropdown. |
| `showCurrencyModal` / `showTransactionModal` / `showCategoryModal` | `boolean` | Toggles the respective modals. |
| `transactionFormData` | `{ amount, description, category_id, type, date, currency }` | Working copy for the add/edit transaction modal. |

**Effects & data flow**

1. `useEffect(loadData)` on mount fetches the signed-in user, transactions, categories, and the friendly full name; Supabase rows are normalised and stored in state.
2. `useEffect` synchronises `selectedCurrency` with the preference returned by `useCurrency`.
3. `useEffect` watching `selectedCurrency` recomputes `displayTransactions` from `allTransactions`.
4. `useEffect` enforces category/type consistency inside the transaction modal (clears the category if the type changes).

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadData()` | Orchestrates fetching the user record, transactions and categories, then updates derived state. |
| `loadCategories()` | Queries Supabase `categories`, logs the result and stores the array locally. |
| `calculateStats()` | Computes total income, total expenses and balance from `displayTransactions`. |
| `generateChartData()` | Prepares pie/line/bar datasets for future charts (currently logged in console). |
| `getFiltersSummary()` | Formats the active Pro filters (type/category/date range) into a badge string. |
| `openModal()` | Resets the transaction modal to defaults (currency, empty fields) and opens it. |
| `handleSubmit()` | Persists the modal form (insert/update) and reloads transactions. |
| `handleEdit()` / `handleDelete()` | Populates the modal for editing or removes a transaction, then refreshes data. |
| `handleToggleCategoryFilter()` / `handleResetFilters()` | Manage multi-category selection inside the Pro filters modal. |

**UI structure**

1. Header with greeting + currency filter button (opens the currency modal).
2. Summary cards showing total income, expenses and balance.
3. Quick actions grid linking to other screens via `useAppNavigation` helpers.
4. Recent transactions list (five latest items) with delete buttons.
5. Floating action button anchored bottom-left opening the add-transaction modal.
6. Modals:
   * Filters modal (Pro users) with type/category/date controls.
   * Add/Edit transaction modal with type toggle, amount/description/category/currency/date fields.
   * Category selector modal filtered by transaction type.
   * Currency selector modal listing supported currencies from `useCurrency`.

Styles defined via `StyleSheet.create` (e.g., `mainContainer`, `header`, `modalHeader`) keep layout and theming consistent across sections and modals.

### `TransactionsScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `transactions` | `Transaction[]` | Filtered transactions displayed in the list (after applying Pro filters). |
| `allTransactions` | `Transaction[]` | Raw, unfiltered transactions fetched from Supabase. |
| `categories` | `Category[]` | All categories loaded for dropdown selection and category name lookups. |
| `userPlan` | `string` | User's subscription plan (`'free'` / `'pro'`) to gate filter features. |
| `loading` / `refreshing` | `boolean` | Loading indicators for mount and pull-to-refresh. |
| `showModal` | `boolean` | Controls add/edit transaction modal visibility. |
| `showFiltersModal` / `showCategoryModal` / `showCurrencyModal` | `boolean` | Toggles respective filter/selector modals. |
| `editingTransaction` | `Transaction \| null` | The transaction being edited (null when adding new). |
| `formData` | `{ amount, description, category_id, type, date, currency }` | Working state for the transaction CRUD modal form. |
| `filters` | `{ type, categories, dateFrom, dateTo }` | Pro filter state (multi-category support). |

**Effects & data flow**

1. `useEffect(loadData)` on mount fetches the authenticated user, their subscription plan, transactions (sorted desc by date), and categories (sorted by name).
2. `useEffect` watching `filters` reapplies filter logic to `allTransactions` and updates `transactions` whenever filter criteria change.
3. `useEffect` enforces category type consistency: clears `formData.category_id` if the selected category's type doesn't match the current `formData.type`.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadData()` | Fetches user record, subscription plan, transactions and categories; normalises rows and seeds state. |
| `applyFilters()` | Filters `allTransactions` by type, multiple categories, and optional date range; stores result in `transactions`. |
| `getFiltersSummary()` | Builds a badge string from active filters (e.g., "Expense • Food, Travel • 2024-01-01 → 2024-01-31"). |
| `handleSubmit()` | Persists the modal form to Supabase (insert or update), then reloads transactions and closes the modal. |
| `handleEdit()` | Populates `formData` from the clicked transaction, sets `editingTransaction`, and opens the modal. |
| `handleDelete()` | Shows a confirmation alert, then deletes the transaction and refreshes the list. |
| `openModal()` | Resets form to defaults (expense, today's date, user's preferred currency) and opens the add modal. |
| `handleToggleCategoryFilter()` | Adds/removes a category ID from the multi-select filter list. |
| `handleResetFilters()` | Clears all Pro filter criteria and resets `transactions` to show all items. |
| `onRefresh()` | Implements pull-to-refresh by calling `loadData()`. |

**UI structure**

1. Header with title and a filter button (Pro users only) opening the advanced filters modal; displays active filter summary as a badge.
2. Scrollable list of transaction cards:
   * Each card shows description, formatted amount, date, category, and a delete button.
   * Tapping a card opens the edit modal.
3. Floating action button (bottom-left) opens the add-transaction modal.
4. Modals:
   * **Filters modal** (Pro) – type selector (all/income/expense), multi-select categories, date range pickers.
   * **Add/Edit transaction modal** – type toggle, amount, description, category dropdown, currency selector, date picker.
   * **Category selection modal** – alphabetical list filtered by transaction type, sorted by name.
   * **Currency selection modal** – displays supported currencies (name + symbol) from `useCurrency`.

Modal interactions use `onStartShouldSetResponder` to prevent taps from propagating to the overlay and closing the modal prematurely.

Styles follow the same pattern as DashboardScreen with dedicated rules for headers, cards, modals, filter controls, and empty states.

### `BudgetsScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `budgets` | `Budget[]` | User's budgets mapped from Supabase snake_case rows to camelCase shared type. |
| `categories` | `Category[]` | All categories loaded for lookups (to display category names in budget cards). |
| `loading` / `refreshing` | `boolean` | Loading indicators for mount and pull-to-refresh. |
| `showModal` | `boolean` | Controls add/edit budget modal visibility. |
| `editingBudget` | `Budget \| null` | The budget being edited (null when adding new). |
| `formData` | `{ category, amount, period }` | Working state for the budget CRUD modal form. |

**Data mapping**

* `BudgetRow` – internal type matching Supabase columns (snake_case: `user_id`, `start_date`, `end_date`).
* `mapBudget()` – helper converting `BudgetRow` to shared `Budget` (camelCase: `userId`, `startDate`, `endDate`).

**Effects & data flow**

1. `useEffect(loadData)` on mount fetches the authenticated user, budgets (sorted desc by amount), and categories (sorted by name).
2. Budgets are normalised through `mapBudget` before storing in state.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadData()` | Fetches user record, budgets and categories; maps budget rows to shared types, seeds state. |
| `handleSubmit()` | Persists the modal form to Supabase (insert or update), then reloads budgets and closes the modal. |
| `handleEdit()` | Populates `formData` from the clicked budget, sets `editingBudget`, and opens the modal. |
| `handleDelete()` | Shows a confirmation alert, then deletes the budget and refreshes the list. |
| `openModal()` | Resets form to defaults (empty category, empty amount, monthly period) and opens the add modal. |
| `onRefresh()` | Implements pull-to-refresh by calling `loadData()`. |

**UI structure**

1. Header with title and an "+ Add" button opening the add budget modal.
2. Scrollable list of budget cards:
   * Each card displays category name (or "All Categories" if not set), period, formatted amount, and a delete button.
   * Tapping a card opens the edit modal.
3. **Budget modal** with:
   * Period selector buttons (Weekly/Monthly/Yearly), one active at a time.
   * Amount input (`keyboardType="decimal-pad"`).
   * Cancel/Save buttons.
   * No category selector (budgets are category-optional).

Styles defined via `StyleSheet.create` include header, cards, period buttons, and modal layout.

### `SavingsGoalsScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `goals` | `SavingsGoal[]` | User's savings goals mapped from Supabase snake_case rows to camelCase shared type. |
| `loading` / `refreshing` | `boolean` | Loading indicators for mount and pull-to-refresh. |
| `showModal` | `boolean` | Controls add/edit goal modal visibility. |
| `editingGoal` | `SavingsGoal \| null` | The goal being edited (null when adding new). |
| `formData` | `{ name, targetAmount, currentAmount, targetDate, description }` | Working state for the goal CRUD modal form. |

**Data mapping**

* `SavingsGoalRow` – internal type matching Supabase columns (snake_case: `user_id`, `target_amount`, `current_amount`, `target_date`, `is_completed`).
* `mapSavingsGoal()` – helper converting `SavingsGoalRow` to shared `SavingsGoal` (camelCase: `userId`, `targetAmount`, `currentAmount`, `targetDate`, `isCompleted`).

**Effects & data flow**

1. `useEffect(loadGoals)` on mount fetches the authenticated user and savings goals (sorted desc by `created_at`).
2. Goals are normalised through `mapSavingsGoal` before storing in state.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadGoals()` | Fetches user record and savings goals; maps rows to shared types, seeds state. |
| `handleSubmit()` | Validates required fields (name, targetAmount), persists the modal form to Supabase (insert or update), then reloads goals and closes the modal. |
| `handleEdit()` | Populates `formData` from the clicked goal, sets `editingGoal`, and opens the modal. |
| `deleteGoal()` | Performs the Supabase delete; called by `handleDeleteGoal` after confirmation. |
| `handleDeleteGoal()` | Shows a platform-specific confirmation (web `confirm`, native `Alert.alert`), then calls `deleteGoal`. |
| `openModal()` | Resets form to defaults (empty fields, today's date) and opens the add modal. |
| `calculateProgress()` | Computes completion percentage from `currentAmount / targetAmount` (capped at 100%). |
| `getDaysRemaining()` | Calculates days until the target date; returns `null` if no date set; negative values indicate overdue. |
| `onRefresh()` | Implements pull-to-refresh by calling `loadGoals()`. |

**UI structure**

1. Header with title/subtitle and an "+ Add Goal" button opening the add modal.
2. Scrollable list of goal cards:
   * Each card shows name, description (if present), progress bar with current/target amounts and percentage, target date, days remaining (or overdue), and Edit/Delete buttons.
   * Progress bar uses dynamic width based on `calculateProgress()`; turns green at 100%.
   * Footer displays target date and days remaining; overdue goals show "X days overdue" in red.
3. **Goal modal** (full-screen on mobile, page sheet style) with:
   * Header: modal title and Cancel button.
   * Scrollable form: Name, Target Amount, Current Amount, Target Date, Description.
   * Save button.

Styles defined via `StyleSheet.create` include progress bars, completed-state highlighting, overdue indicators, and modal layout.

### `ProfileScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `user` | `any` | Combined auth user + profile data (includes `avatar_url`, `full_name`). |
| `userPlan` | `string` | User's subscription plan (`'free'` / `'pro'`). |
| `subscription` | `any` | Details from `user_subscriptions` table (trial dates, status). |
| `language` | `'en' \| 'es'` | Selected language for in-app translations. |
| `fullName` | `string` | User's full name (editable text field). |
| `email` | `string` | User's email (read-only). |
| `loading` / `refreshing` / `saving` | `boolean` | Loading indicators for mount, pull-to-refresh, and save operations. |
| `showLanguageModal` / `showCurrencyModal` | `boolean` | Toggles the respective selector modals. |
| `localTheme` | `'light' \| 'dark'` | Local copy of theme for form state before saving. |

**Effects & data flow**

1. `useEffect(loadUserData)` on mount fetches the authenticated user from Supabase Auth, then:
   * Joins `users` table to get profile metadata (`subscription_plan`, `language`, `theme`, `currency`, `full_name`, `avatar_url`).
   * If Pro, fetches detailed subscription from `user_subscriptions`.
   * Seeds local state including `localTheme` and updates `useTheme`/`useCurrency` contexts.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadUserData()` | Fetches user record and subscription; normalises and seeds state, updates theme/currency contexts. |
| `handleSaveSettings()` | Persists language, theme, currency, and full name to `users`; reloads data; shows success/error alert. |
| `handleStartTrial()` | Prompts confirmation, updates user to Pro, creates a trial subscription (7 days), then reloads data. |
| `handleCancelSubscription()` | Sets `cancel_at_period_end` and `status` on subscription; reloads data. |
| `handleLogout()` | Shows confirmation, calls `supabase.auth.signOut()` (navigation reset handled in `App.tsx`). |
| `getTrialDaysLeft()` | Calculates days remaining in trial from `trial_started_at`; returns 0 if expired. |
| `isTrialActive()` | Checks if subscription status is 'trial' and plan is 'pro'. |
| `onRefresh()` | Implements pull-to-refresh by calling `loadUserData()`. |

**UI structure**

1. Header with title/subtitle.
2. **Personal Information section** – avatar (via `Avatar` component), full name input, email (read-only).
3. **Preferences section** – language/currency/theme selectors with modal dropdowns; switch for dark mode.
4. **Subscription section** – plan badge; trial info or upgrade/manage/cancel buttons.
5. **Save Changes** button at the bottom that calls `handleSaveSettings()`.
6. **Sign Out** button at the bottom.
7. Modals:
   * **Language selection** – English/Spanish buttons.
   * **Currency selection** – list of supported currencies from `useCurrency`.

Translations defined inline in `translations` (en/es); language preference updates all labels via `t`.

Styles defined via `StyleSheet.create` include section cards, preference rows, modals, and plan badges.

### `NotificationsScreen.tsx`

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `notifications` | `Notification[]` | User's notifications mapped from Supabase snake_case rows to camelCase shared type. |
| `loading` / `refreshing` | `boolean` | Loading indicators for mount and pull-to-refresh. |

**Data mapping**

* `NotificationRow` – internal type matching Supabase columns (snake_case: `user_id`, `is_read`, `created_at`).
* `mapNotificationType()` – validates and normalises notification type strings against the shared enum.
* `toNotification()` – helper converting `NotificationRow` to shared `Notification` (camelCase: `userId`, `isRead`, `createdAt`).

**Effects & data flow**

1. `useEffect(loadNotifications)` on mount fetches the authenticated user and notifications (sorted desc by `created_at`).
2. Notifications are normalised through `toNotification` before storing in state.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadNotifications()` | Fetches user notifications; maps rows to shared types, seeds state. |
| `markAsRead()` | Updates single notification to `is_read: true`; optimistically updates local state. |
| `markAllAsRead()` | Bulk-updates all unread notifications; only visible when unread count > 0. |
| `deleteNotification()` | Shows confirmation alert, then deletes the notification and removes it from the list. |
| `getNotificationIcon()` | Maps notification type to emoji icon (💰, 🎯, ⏰, ⚠️, 📈, 📉, 📢). |
| `getNotificationColor()` | Returns color hex for icon backgrounds (amber, green, blue, red, gray). |
| `formatDate()` | Formats dates as "Today", "Yesterday", "X days ago", or a full date. |
| `onRefresh()` | Implements pull-to-refresh by calling `loadNotifications()`. |

**UI structure**

1. Header with title and a "Mark All Read" button (visible only if unread count > 0).
2. Scrollable list of notification cards:
   * Each card shows icon with colored background, title, timestamp, message, delete button.
   * Unread cards have a left border and bold title; dot indicator.
   * Tapping a card marks it as read.
3. Empty state with bell icon when no notifications exist.

Styles defined via `StyleSheet.create` include colored icon backgrounds, unread indicators, timestamps, and action buttons.

---

## Dependencies & Key Technologies

### Web Application

**Core frameworks:**
* **Next.js 16.0.0** – React framework with App Router
* **React 19.2.0** – UI library
* **TypeScript 5.x** – Type safety

**Supabase integration:**
* `@supabase/supabase-js` (2.76.1) – Core client library
* `@supabase/ssr` (0.7.0) – Server-side rendering support
* `@supabase/auth-helpers-nextjs` (0.10.0) – Auth helpers
* `@supabase/auth-ui-react` (0.4.7) – UI components

**UI & styling:**
* **Tailwind CSS 4.x** – Utility-first CSS
* `lucide-react` (0.548.0) – Icon library
* `next-intl` (4.4.0) – Internationalization

**Data visualization & export:**
* `chart.js` (4.5.1) + `react-chartjs-2` (5.3.1) – Charts
* `jspdf` (3.0.3) + `jspdf-autotable` (5.0.2) – PDF generation
* `xlsx` (0.18.5) – Excel export
* `file-saver` (2.0.5) – File downloads

**Form management:**
* `react-hook-form` (7.65.0) – Form state
* `zod` (4.1.12) – Validation
* `@hookform/resolvers` (5.2.2) – Resolvers

### Mobile Application

**Core frameworks:**
* **Expo ~54.0.21** – React Native development platform
* **React 18.2.0** – UI library
* **TypeScript 5.9.2** – Type safety

**Supabase integration:**
* `@supabase/supabase-js` (2.76.1) – Core client library

**Navigation:**
* `@react-navigation/native` (7.1.18) – Navigation library
* `@react-navigation/stack` (7.5.0) – Stack navigator
* `@react-navigation/bottom-tabs` (7.5.0) – Bottom tabs
* `react-native-screens` (4.16.0) – Screen management
* `react-native-gesture-handler` (2.28.0) – Gesture support

**UI & storage:**
* `react-native-safe-area-context` (5.6.1) – Safe area handling
* `@react-native-async-storage/async-storage` (2.2.0) – Local storage
* `react-native-svg` (15.12.1) – SVG rendering
* `react-native-chart-kit` (6.12.0) – Charts

**Media & images:**
* `expo-image-picker` (17.0.8) – Image selection
* `expo-image-manipulator` (14.0.7) – Image editing

**Form management:**
* `react-hook-form` (7.65.0) – Form state
* `zod` (3.25.76) – Validation

**Styling:**
* `nativewind` (4.2.1) – Tailwind for React Native

### Shared Dependencies

* `date-fns` (4.1.0) – Date formatting and manipulation (used in both web & mobile)
* TypeScript workspace configuration for type sharing

---

## Summary

This document provides an architectural overview and detailed reference for Expense Tracker Pro, a full-stack expense management application with mobile (React Native/Expo) and web (Next.js) clients sharing a Supabase backend.

**Completed documentation:**

* **Repository structure:** Monorepo layout, workspace configuration, shared types
* **Environment setup:** Web and mobile environment variables, Supabase configuration
* **Dependencies:** Key technologies and libraries for web (Next.js, React 19, chart.js) and mobile (Expo, React Native, navigation)
* **Mobile Screens:** Dashboard, Transactions, Budgets, Savings Goals, Profile, Notifications (6 modules)
* **Mobile Hooks:** useCurrency, useTheme (2 shared providers)
* **Web Pages:** Dashboard, Transactions (2 core pages)
* **Web Components:** TransactionModal, TermsModal, AuthenticatedLayout, Chart (4 modules)
* **Web Utilities:** plan-limits, dataExporter, categoryTranslations (3 libraries)
* **Architecture patterns:** CRUD flows, modal patterns, pull-to-refresh, optimistic updates, snake_case/camelCase conversion
* **Supabase integration:** Client setup, auth flow, data mapping strategies

**Total modules documented:** 17 core modules + 30+ key dependencies

**Future documentation areas:**

* **Additional mobile screens:** AccountSharing, Reports, Settings, Export, Contact, Auth
* **Additional web pages:** Budgets, Savings Goals, Notifications, Profile, Settings, Export
* **Additional web components:** Navigation, AccountSharingManager, Loading, Logo, Avatar
* **Supabase schema:** Table definitions, constraints, triggers, RPC functions
* **Testing strategy:** Unit tests, integration tests, E2E workflows

---

## Mobile Hooks – Shared Providers

### `useCurrency.tsx`

**Purpose:** Context provider and hook for managing currency preferences across the mobile app.

**Supported currencies:**

| Code | Symbol | Name (EN) | Name (ES) |
|------|--------|-----------|-----------|
| `USD` | `$` | US Dollar | Dólar Estadounidense |
| `MXN` | `$` | Mexican Peso | Peso Mexicano |
| `GTQ` | `Q` | Guatemalan Quetzal | Quetzal Guatemalteco |
| `EUR` | `€` | Euro | Euro |

**Context value:**

| Property | Type | Description |
|----------|------|-------------|
| `currency` | `Currency` | Current selected currency code |
| `setCurrency` | `(currency: Currency) => void` | Updates currency preference |
| `formatCurrency` | `(amount: number) => string` | Formats amount with symbol and 2 decimal places |
| `getCurrencyInfo` | `() => CurrencyInfo` | Returns full info for current currency |
| `getAllCurrencies` | `() => CurrencyInfo[]` | Returns all available currencies |
| `loading` | `boolean` | Initial load state |

**Data persistence:**

* Reads from Supabase `users.currency` first (authenticated users).
* Falls back to `AsyncStorage` if no DB value or user not authenticated.
* Writes to both Supabase and `AsyncStorage` on update.

**Usage pattern:**

1. Wrap app in `<CurrencyProvider>` (done in `App.tsx`).
2. Call `useCurrency()` in components/screens.
3. Use `formatCurrency(amount)` to display monetary values.

### `useTheme.tsx`

**Purpose:** Context provider and hook for dark/light theme management.

**Theme colors:**

* **Light:** `#f5f5f5` background, `#ffffff` cards, `#1a1a1a` text
* **Dark:** `#1a1a1a` background, `#2d2d2d` cards, `#ffffff` text

**Context value:**

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `'light' \| 'dark'` | Current theme |
| `setTheme` | `(theme: Theme) => void` | Updates theme preference |
| `isDark` | `boolean` | Quick dark mode check |
| `colors` | `Colors` | Palette object (background, card, text, etc.) |

**Data persistence:**

* Reads from Supabase `users.theme` first.
* Falls back to `AsyncStorage`.
* Writes to both on update.

**Usage pattern:**

1. Wrap app in `<ThemeProvider>` (done in `App.tsx`).
2. Call `useTheme()` in components.
3. Access `colors.text`, `colors.background`, etc. for theming.

---

## Web Pages – Detailed Reference

### `web/src/app/dashboard/page.tsx`

**Purpose:** Main dashboard view with statistics, charts, and recent transactions.

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `user` | `any` | Authenticated user from Supabase Auth. |
| `transactions` | `Transaction[]` | All transactions for the authenticated user. |
| `categories` | `Array<{id, name, is_system}>` | Categories for chart lookups and translations. |
| `userPlan` | `string` | Subscription plan (`'free'` / `'pro'`) to gate features. |
| `loading` | `boolean` | Initial load state. |
| `showTransactionModal` | `boolean` | Controls transaction add/edit modal. |
| `chartType` | `'expense' \| 'income'` | Currently displayed chart type. |
| `showExpandedChart` | `boolean` | Controls expanded chart modal. |
| `selectedCurrency` | `string` | Currency filter for transactions and stats. |
| `trendPeriod` | `'month' \| 'day'` | Time aggregation for trend charts. |

**Effects & data flow**

1. `useEffect(loadTransactions)` on mount fetches user record, transactions (with category joins), subscription plan, and categories.
2. `useEffect` watching `pathname`, `user`, `loading` redirects unauthenticated users to `/login`.
3. Transactions are filtered by `selectedCurrency` before calculating stats and generating charts.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadTransactions()` | Fetches transactions with category joins, sorts by date desc, seeds state. |
| `loadCategories()` | Fetches categories (id, name, is_system) sorted by name for chart lookups. |
| `calculateStats()` | Computes total income, total expenses, and balance from filtered transactions. |
| `getCategoryData()` | Generates pie chart data for income/expense by category (top 6), includes translations. |
| `getTrendData()` | Delegates to monthly or daily trend aggregation based on `trendPeriod`. |
| `formatTransactionCurrency()` | Formats amounts with currency symbols from `useCurrency`. |
| `handleTransactionSuccess()` | Reloads transactions and categories after modal submission. |
| `getFilteredTransactions()` | Returns transactions matching `selectedCurrency`. |

**UI structure**

1. **Stats grid:** Total income, total expenses, balance (filtered by selected currency).
2. **Chart section:** 
   * Tabs to switch between expense/income by category.
   * Trend chart with month/day selector.
   * Expand button opens full-screen modal.
3. **Currency filter** dropdown above stats.
4. **Recent transactions** table with expandable rows showing full details.
5. **Add transaction** button opens `TransactionModal`.

Uses `AuthenticatedLayout` wrapper for navigation. Loading states render skeleton components.

### `web/src/app/transactions/page.tsx`

**Purpose:** Transaction CRUD interface with advanced filtering (Pro users).

**Component structure:** Wrapped in `Suspense` to handle `useSearchParams()` in a client component.

**Local state**

| State | Type | Purpose |
|-------|------|---------|
| `user` | `any` | Authenticated user from Supabase Auth. |
| `transactions` | `Transaction[]` | All transactions for the authenticated user. |
| `categories` | `Category[]` | Categories for dropdown selection. |
| `loading` | `boolean` | Initial load state. |
| `showModal` | `boolean` | Controls transaction add/edit modal. |
| `editingTransaction` | `Transaction \| null` | The transaction being edited (null when adding new). |
| `transactionLimit` | `{ canAdd, current, limit }` | Subscription limit check results. |
| `isSharedAccount` | `boolean` | Whether user has shared account access. |
| `createdByUsers` | `Record<string, {email, full_name}>` | Map of user IDs to names for shared account display. |
| `userPlan` | `string` | Subscription plan (`'free'` / `'pro'`) to gate filter features. |
| `filters` | `{dateFrom, dateTo, description, category, type, amountMin, amountMax, createdBy}` | Pro filter criteria. |
| `formData` | `{amount, description, category_id, type, date, currency}` | Modal form state. |

**Effects & data flow**

1. `useEffect(loadData)` on mount fetches user record, transactions, categories, subscription details, shared account status, and created-by user metadata.
2. `useEffect` applies filters to transactions whenever `filters` state changes.

**Key functions**

| Function | Responsibility |
|----------|----------------|
| `loadData()` | Fetches user, transactions (with category joins), categories, subscription plan, shared account status, created-by users; seeds state. |
| `applyFilters()` | Filters transactions by date range, description, category, type, amount range, created by. |
| `checkLimits()` | Calls `checkTransactionLimit` helper to enforce subscription limits. |
| `handleSubmit()` | Persists modal form to Supabase (insert or update), reloads data, closes modal. |
| `handleEdit()` | Populates `formData` from the clicked transaction, sets `editingTransaction`, opens modal. |
| `handleDelete()` | Shows confirmation dialog, deletes transaction, reloads data and limits. |
| `openModal()` | Resets form to defaults and opens the add modal. |
| `clearFilters()` | Resets all filter criteria. |

**UI structure**

1. **Header** with title and "Add Transaction" button (disabled if at limit).
2. **Limit warning banner** (Free users) showing current usage.
3. **Filters panel** (Pro users only) with date range, description, category, type, amount range, created by fields.
4. **Transactions table** with columns: Date, Description, Category, Type, Amount, Currency, Created By (shared accounts), Actions (Edit/Delete).
5. **Transaction modal** for add/edit with type toggle, amount, description, category dropdown, currency selector, date picker.
6. **Empty state** when no transactions match filters.

Uses `AuthenticatedLayout` wrapper. Filtering supports shared account scenarios.

---

## Web Components – Key Reusable Modules

### `TransactionModal.tsx`

**Purpose:** Reusable modal for adding/editing transactions in the web app.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when modal is closed |
| `onSuccess` | `() => void` | Called after successful save |
| `user` | `User \| null` | Current authenticated user |
| `editingTransaction` | `Transaction \| null` | Transaction to edit (null for add) |

**Local state:**

* `formData` – `{ amount, description, category_id, type, date, currency }`
* `loading` – submission state
* `error` – error message display
* `categories` – list of available categories

**Data flow:**

1. On mount, loads categories from Supabase.
2. When `editingTransaction` changes, populates `formData` from transaction or resets to defaults.
3. On type change, clears category if it doesn't match the new type.
4. On submit, validates required fields, inserts/updates via Supabase, calls `onSuccess`.

**Features:**

* Currency selector dropdown.
* Category dropdown filtered by transaction type.
* Type toggle (Income/Expense).
* Form validation.
* Translation support (EN/ES).
* Loading states during save.

### `TermsModal.tsx`

**Purpose:** Modal for terms and conditions acceptance during signup.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onAccept` | `() => void` | Called when user accepts |
| `onDecline` | `() => void` | Called when user declines |

**Features:**

* Scrollable terms content with markdown-style formatting.
* Accept/Decline buttons.
* Scroll detection to enable accept button.
* Translation support (EN/ES).
* Links to full privacy policy.

### `AuthenticatedLayout.tsx`

**Purpose:** Layout wrapper that enforces authentication for protected pages.

**Responsibilities:**

* Checks authentication status.
* Redirects unauthenticated users to `/login`.
* Renders `<Navigation />` component.
* Provides consistent page structure.
* Loads user data.

**Usage:** Wrap authenticated pages (dashboard, transactions, profile, etc.).

### `Chart.tsx`

**Purpose:** Wrapper around `chart.js` for rendering financial charts.

**Features:**

* Line, pie, and bar chart types.
* Pre-configured color schemes.
* Responsive sizing.
* Configurable datasets.
* Exports `chartConfigs` helper for data preparation.

---

## Web Utilities & Libraries

### `plan-limits.ts`

**Purpose:** Subscription plan limits enforcement and feature gating.

**Key functions:**

| Function | Returns | Description |
|----------|---------|-------------|
| `getUserPlan(userId)` | `Promise<string>` | Fetches user's subscription plan from `users` table |
| `getPlanLimits(planId)` | `Promise<PlanLimits>` | Retrieves feature limits for a plan |
| `checkTransactionLimit(userId)` | `Promise<{canAdd, current, limit}>` | Checks if user can add more transactions |
| `checkCategoryLimit(userId)` | `Promise<{canAdd, current, limit}>` | Checks custom category limits |
| `checkBudgetLimit(userId)` | `Promise<{canAdd, current, limit}>` | Checks budget limits |
| `canExportReports(userId)` | `Promise<boolean>` | Checks export feature access |
| `canUseAdvancedAnalytics(userId)` | `Promise<boolean>` | Checks analytics access |
| `canCreateCustomCategories(userId)` | `Promise<boolean>` | Checks custom category creation |

**Plan limits structure:**

* Free plan: 50 transactions/month, 10 categories, 5 budgets; no exports/analytics/custom categories
* Pro plan: unlimited transactions/categories/budgets; all features enabled

### `dataExporter.ts`

**Purpose:** Export financial data to PDF and Excel formats.

**Class:** `DataExporter`

**Methods:**

| Method | Parameters | Output |
|--------|------------|--------|
| `exportToPDF(data, language)` | `ExportData`, `'en' \| 'es'` | PDF file via `jsPDF` |
| `exportToExcel(data, language)` | `ExportData`, `'en' \| 'es'` | Excel file via `XLSX` |

**Export data includes:**

* Transactions (date, description, category, type, amount)
* Budgets (category, amount, period, dates)
* Savings goals (name, target, current, progress)
* Summary statistics (total income, expenses, balance)

**Features:**

* Bilingual support (EN/ES)
* Currency formatting
* Table layouts with headers
* Period filtering
* Auto-download via `file-saver`

### `categoryTranslations.ts`

**Purpose:** Translates system category names and descriptions.

**Functions:**

* `getTranslatedCategoryName(name, language)` – Returns translated category name
* `getTranslatedCategoryDescription(description, language)` – Returns translated description

**Coverage:** ~20+ system categories with EN/ES translations

