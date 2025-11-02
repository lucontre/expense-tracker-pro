// User Types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
  subscription_plan?: 'free' | 'pro';
  language?: 'en' | 'es';
  theme?: 'light' | 'dark';
  currency?: 'USD' | 'MXN' | 'GTQ' | 'EUR';
  trial_started_at?: string;
  avatar_url?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category_id?: string;
  type: 'income' | 'expense';
  date: string;
  currency?: 'USD' | 'MXN' | 'GTQ' | 'EUR';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  description: string;
  category_id?: string;
  type: 'income' | 'expense';
  date: string;
  currency?: 'USD' | 'MXN' | 'GTQ' | 'EUR';
}

export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  category_id?: string;
  type?: 'income' | 'expense';
  date?: string;
  currency?: 'USD' | 'MXN' | 'GTQ' | 'EUR';
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetInput {
  category?: string;
  amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionsThisMonth: number;
  topCategories: {
    category: string;
    amount: number;
  }[];
}

// Report Types
export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: 'income' | 'expense';
  category?: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
  is_system?: boolean;
}

// Subscription & Payment Types
export interface SubscriptionPlan {
  id: 'free' | 'pro';
  name: string;
  price: number;
  priceId?: string; // Stripe Price ID
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  maxTransactions: number | null; // null = unlimited
  maxCategories: number | null;
  maxBudgets: number | null;
  exportReports: boolean;
  advancedAnalytics: boolean;
  customCategories: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  paidAt?: string;
  createdAt: string;
}

// Savings Goal Types
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  description?: string;
  targetAmount?: number;
  targetDate?: string;
  currentAmount?: number;
  isCompleted?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | 'budget_exceeded'
    | 'budget_warning'
    | 'goal_achieved'
    | 'goal_milestone'
    | 'trial_ending'
    | 'budget_alert'
    | 'goal_reminder'
    | 'expense_high'
    | 'income_recorded'
    | 'expense_recorded'
    | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}
