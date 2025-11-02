-- Add subscription plan column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE;

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY CHECK (id IN ('free', 'pro')),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stripe_price_id TEXT,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false NOT NULL,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed')),
  invoice_url TEXT,
  stripe_invoice_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_system BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, price, features, limits) VALUES
  (
    'free',
    'Free Plan',
    0.00,
    '["Basic expense tracking", "10 categories", "50 transactions per month", "Basic reports", "Mobile app access"]'::jsonb,
    '{"maxTransactions": 50, "maxCategories": 10, "maxBudgets": 5, "exportReports": false, "advancedAnalytics": false, "customCategories": false, "prioritySupport": false, "apiAccess": false}'::jsonb
  ),
  (
    'pro',
    'Pro Plan',
    9.99,
    '["Unlimited transactions", "Unlimited categories", "Unlimited budgets", "Advanced analytics", "Export reports (PDF/Excel)", "Custom categories with icons", "Priority support", "API access", "Email reports"]'::jsonb,
    '{"maxTransactions": null, "maxCategories": null, "maxBudgets": null, "exportReports": true, "advancedAnalytics": true, "customCategories": true, "prioritySupport": true, "apiAccess": true}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color, type, is_system) VALUES
  ('Salary', 'Monthly salary income', '💰', '#10B981', 'income', true),
  ('Freelance', 'Freelance work income', '💼', '#3B82F6', 'income', true),
  ('Investment', 'Investment returns', '📈', '#8B5CF6', 'income', true),
  ('Gift', 'Received gifts', '🎁', '#EC4899', 'income', true),
  ('Other Income', 'Other income sources', '💵', '#14B8A6', 'income', true),
  ('Food & Dining', 'Restaurants, groceries', '🍕', '#EF4444', 'expense', true),
  ('Transportation', 'Gas, public transport', '🚗', '#F59E0B', 'expense', true),
  ('Shopping', 'Clothing, electronics', '🛍️', '#8B5CF6', 'expense', true),
  ('Bills & Utilities', 'Electricity, water, internet', '💡', '#06B6D4', 'expense', true),
  ('Entertainment', 'Movies, games, streaming', '🎬', '#EC4899', 'expense', true),
  ('Healthcare', 'Medical expenses', '🏥', '#10B981', 'expense', true),
  ('Education', 'Courses, books', '📚', '#6366F1', 'expense', true),
  ('Travel', 'Vacations, trips', '✈️', '#14B8A6', 'expense', true),
  ('Other Expense', 'Other expenses', '📦', '#6B7280', 'expense', true)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (everyone can view)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for payment_methods
CREATE POLICY "Users can view own payment methods" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON public.payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON public.payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON public.payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for categories (everyone can view, authenticated users can insert custom)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create custom categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND is_system = false);

CREATE POLICY "Users can update own custom categories" ON public.categories
  FOR UPDATE USING (auth.uid() IS NOT NULL AND is_system = false);

CREATE POLICY "Users can delete own custom categories" ON public.categories
  FOR DELETE USING (auth.uid() IS NOT NULL AND is_system = false);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
