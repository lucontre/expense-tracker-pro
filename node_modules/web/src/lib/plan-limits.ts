// Utility functions for checking plan limits
import { createClient } from '@/lib/supabase/client';

export interface PlanLimits {
  maxTransactions: number | null;
  maxCategories: number | null;
  maxBudgets: number | null;
  exportReports: boolean;
  advancedAnalytics: boolean;
  customCategories: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export async function getUserPlan(userId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from('users')
    .select('subscription_plan')
    .eq('id', userId)
    .single();
  
  return data?.subscription_plan || 'free';
}

export async function getPlanLimits(planId: string): Promise<PlanLimits> {
  const supabase = createClient();
  const { data } = await supabase
    .from('subscription_plans')
    .select('limits')
    .eq('id', planId)
    .single();
  
  return data?.limits || {
    maxTransactions: 50,
    maxCategories: 10,
    maxBudgets: 5,
    exportReports: false,
    advancedAnalytics: false,
    customCategories: false,
    prioritySupport: false,
    apiAccess: false,
  };
}

export async function checkTransactionLimit(userId: string): Promise<{ canAdd: boolean; current: number; limit: number | null }> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  
  if (!limits.maxTransactions) {
    return { canAdd: true, current: 0, limit: null };
  }
  
  const supabase = createClient();
  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  const current = count || 0;
  const canAdd = current < limits.maxTransactions;
  
  return { canAdd, current, limit: limits.maxTransactions };
}

export async function checkCategoryLimit(userId: string): Promise<{ canAdd: boolean; current: number; limit: number | null }> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  
  if (!limits.maxCategories) {
    return { canAdd: true, current: 0, limit: null };
  }
  
  const supabase = createClient();
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_system', false); // Only count custom categories
  
  const current = count || 0;
  const canAdd = current < limits.maxCategories;
  
  return { canAdd, current, limit: limits.maxCategories };
}

export async function checkBudgetLimit(userId: string): Promise<{ canAdd: boolean; current: number; limit: number | null }> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  
  if (!limits.maxBudgets) {
    return { canAdd: true, current: 0, limit: null };
  }
  
  const supabase = createClient();
  const { count } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  const current = count || 0;
  const canAdd = current < limits.maxBudgets;
  
  return { canAdd, current, limit: limits.maxBudgets };
}

export async function canExportReports(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  return limits.exportReports;
}

export async function canUseAdvancedAnalytics(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  return limits.advancedAnalytics;
}

export async function canCreateCustomCategories(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const limits = await getPlanLimits(plan);
  return limits.customCategories;
}
