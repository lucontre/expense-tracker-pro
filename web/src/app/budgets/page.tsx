'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Budget, Category } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';
import { getTranslatedCategoryName } from '@/lib/categoryTranslations';
import { LoadingSpinner, SkeletonCard } from '@/components/Loading';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function BudgetsPage() {
  const [user, setUser] = useState<any>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      title: 'Budgets',
      subtitle: 'Set spending limits for your categories',
      addBudget: 'Add Budget',
      backToDashboard: 'Back to Dashboard',
      noBudgets: 'No budgets set yet. Click "Add Budget" to create one.',
      category: 'Category',
      amount: 'Amount',
      period: 'Period',
      monthly: 'Monthly',
      weekly: 'Weekly',
      yearly: 'Yearly',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      addNewBudget: 'Add New Budget',
      editBudget: 'Edit Budget',
      selectCategory: 'Select a category',
      enterAmount: 'Enter budget amount',
      selectPeriod: 'Select period',
      spent: 'Spent',
      remaining: 'Remaining',
      overBudget: 'Over Budget',
      onTrack: 'On Track',
    },
    es: {
      title: 'Presupuestos',
      subtitle: 'Establece límites de gasto para tus categorías',
      addBudget: 'Agregar Presupuesto',
      backToDashboard: 'Volver al Dashboard',
      noBudgets: 'Aún no hay presupuestos. Haz clic en "Agregar Presupuesto" para crear uno.',
      category: 'Categoría',
      amount: 'Monto',
      period: 'Período',
      monthly: 'Mensual',
      weekly: 'Semanal',
      yearly: 'Anual',
      actions: 'Acciones',
      edit: 'Editar',
      delete: 'Eliminar',
      save: 'Guardar',
      cancel: 'Cancelar',
      addNewBudget: 'Agregar Nuevo Presupuesto',
      editBudget: 'Editar Presupuesto',
      selectCategory: 'Selecciona una categoría',
      enterAmount: 'Ingresa el monto del presupuesto',
      selectPeriod: 'Selecciona período',
      spent: 'Gastado',
      remaining: 'Restante',
      overBudget: 'Sobre Presupuesto',
      onTrack: 'En Camino',
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      await loadData();
      setLoading(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  // Reload data when page becomes visible or gains focus
  useEffect(() => {
    if (!user || loading) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, reloading budgets...');
        loadData();
      }
    };

    const handleFocus = () => {
      if (user && !loading) {
        console.log('Page focused, reloading budgets...');
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loading]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in loadData');
        return;
      }

      console.log('Loading budgets for user:', user.id);

      // Load budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('amount', { ascending: false });

      console.log('Budgets query result:', { 
        data: budgetsData, 
        error: budgetsError,
        errorMessage: budgetsError?.message,
        errorCode: budgetsError?.code,
        errorDetails: budgetsError?.details,
        errorHint: budgetsError?.hint
      });

      if (budgetsError) {
        console.error('Error loading budgets:', budgetsError);
        console.error('Error details:', {
          message: budgetsError.message,
          code: budgetsError.code,
          details: budgetsError.details,
          hint: budgetsError.hint
        });
        alert(`Error loading budgets: ${budgetsError.message}`);
        return;
      }

      if (budgetsData) {
        console.log('Setting budgets:', budgetsData);
        console.log('Budgets count:', budgetsData.length);
        setBudgets(budgetsData as Budget[]);
      } else {
        console.log('No budgets data returned');
        setBudgets([]);
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }
    } catch (error) {
      console.error('Unexpected error in loadData:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
      alert('An unexpected error occurred while loading data.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const budgetData = {
      user_id: user.id,
      category: formData.category || null,
      amount: parseFloat(formData.amount),
      period: formData.period,
    };

    console.log('Submitting budget:', budgetData);
    console.log('Form data:', formData);

    try {
      if (editingBudget) {
        // Update budget
        const { data: updateData, error: updateError } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingBudget.id)
          .select();
        
        console.log('Update result:', { data: updateData, error: updateError });
        
        if (updateError) {
          console.error('Error updating budget:', updateError);
          console.error('Error details:', {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
            status: (updateError as any).status,
            statusText: (updateError as any).statusText
          });
          console.error('Full error object:', JSON.stringify(updateError, null, 2));
          alert(`Error updating budget: ${updateError.message || 'Unknown error'}`);
          return;
        }
        console.log('Budget updated successfully');
      } else {
        // Create budget
        const { data: insertData, error: insertError } = await supabase
          .from('budgets')
          .insert([budgetData])
          .select();
        
        console.log('Insert result:', { data: insertData, error: insertError });
        
        if (insertError) {
          // Try to extract error message in multiple ways
          const errorMessage = insertError.message || 
                              (insertError as any).error_description ||
                              (insertError as any).msg ||
                              'Unknown error';
          
          console.error('Error creating budget:', insertError);
          console.error('Error type:', typeof insertError);
          console.error('Error keys:', Object.keys(insertError));
          console.error('Error details:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
            status: (insertError as any).status,
            statusText: (insertError as any).statusText,
            error_description: (insertError as any).error_description,
            msg: (insertError as any).msg
          });
          
          // Try to stringify with replacer function
          try {
            console.error('Full error object:', JSON.stringify(insertError, (key, value) => {
              if (value instanceof Error) {
                return {
                  message: value.message,
                  name: value.name,
                  stack: value.stack
                };
              }
              return value;
            }, 2));
          } catch (stringifyError) {
            console.error('Could not stringify error:', stringifyError);
            console.error('Error.toString():', insertError.toString());
          }
          
          console.error('Budget data that failed:', JSON.stringify(budgetData, null, 2));
          alert(`Error creating budget: ${errorMessage}`);
          return;
        }
        console.log('Budget created successfully:', insertData);
      }

      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
      });
      await loadData();
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      console.error('Error type:', typeof error);
      console.error('Error instance:', error instanceof Error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || (error as any).error_description || JSON.stringify(error);
      }
      
      console.error('Error message:', errorMessage);
      console.error('Error stack:', error instanceof Error ? error.stack : undefined);
      
      // Try to stringify with replacer
      try {
        console.error('Full error:', JSON.stringify(error, (key, value) => {
          if (value instanceof Error) {
            return {
              message: value.message,
              name: value.name,
              stack: value.stack
            };
          }
          return value;
        }, 2));
      } catch (stringifyError) {
        console.error('Could not stringify error:', stringifyError);
        if (error instanceof Error) {
          console.error('Error.toString():', error.toString());
        }
      }
      
      alert(`An unexpected error occurred: ${errorMessage}`);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category || '',
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await supabase.from('budgets').delete().eq('id', id);
      await loadData();
    }
  };

  const openModal = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="mb-8">
          <LoadingSpinner size="lg" text={t.title ? 'Loading budgets...' : 'Loading...'} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t.backToDashboard}
          </Link>
          <button
            onClick={openModal}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition-colors"
          >
            {t.addBudget}
          </button>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12">
            <p className="text-lg font-medium">{t.noBudgets}</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.category);
            return (
              <div
                key={budget.id}
                className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {category 
                      ? (category.is_system ? getTranslatedCategoryName(category.name, language) : category.name)
                      : 'All Categories'
                    }
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {budget.period === 'monthly' ? t.monthly : 
                     budget.period === 'weekly' ? t.weekly : 
                     budget.period === 'yearly' ? t.yearly : budget.period} limit
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${budget.amount.toFixed(2)}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-50">
              {editingBudget ? t.editBudget : t.addNewBudget}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.category}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.is_system ? getTranslatedCategoryName(category.name, language) : category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.amount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t.period}
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' | 'yearly' })}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="weekly">{t.weekly}</option>
                    <option value="monthly">{t.monthly}</option>
                    <option value="yearly">{t.yearly}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition-colors"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
