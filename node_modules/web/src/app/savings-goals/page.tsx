'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SavingsGoal, CreateSavingsGoalInput } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';
import { LoadingSpinner } from '@/components/Loading';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  const [formData, setFormData] = useState<CreateSavingsGoalInput>({
    name: '',
    description: '',
    targetAmount: 0,
    targetDate: '',
  });

  const translations = {
    en: {
      title: 'Savings Goals',
      subtitle: 'Set and track your financial goals',
      backToDashboard: 'Back to Dashboard',
      addGoal: 'Add Goal',
      editGoal: 'Edit Goal',
      goalName: 'Goal Name',
      description: 'Description',
      targetAmount: 'Target Amount',
      targetDate: 'Target Date',
      currentAmount: 'Current Amount',
      progress: 'Progress',
      completed: 'Completed',
      active: 'Active',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      noGoals: 'No savings goals yet',
      createFirstGoal: 'Create your first savings goal',
      goalCreated: 'Goal created successfully!',
      goalUpdated: 'Goal updated successfully!',
      goalDeleted: 'Goal deleted successfully!',
      error: 'An error occurred',
      confirmDelete: 'Are you sure you want to delete this goal?',
      addAmount: 'Add Amount',
      amountToAdd: 'Amount to Add',
      add: 'Add',
      totalSaved: 'Total Saved',
      goalsCompleted: 'Goals Completed',
      averageProgress: 'Average Progress',
    },
    es: {
      title: 'Objetivos de Ahorro',
      subtitle: 'Establece y rastrea tus metas financieras',
      backToDashboard: 'Volver al Dashboard',
      addGoal: 'Agregar Objetivo',
      editGoal: 'Editar Objetivo',
      goalName: 'Nombre del Objetivo',
      description: 'Descripción',
      targetAmount: 'Cantidad Objetivo',
      targetDate: 'Fecha Objetivo',
      currentAmount: 'Cantidad Actual',
      progress: 'Progreso',
      completed: 'Completado',
      active: 'Activo',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      noGoals: 'Aún no hay objetivos de ahorro',
      createFirstGoal: 'Crea tu primer objetivo de ahorro',
      goalCreated: '¡Objetivo creado exitosamente!',
      goalUpdated: '¡Objetivo actualizado exitosamente!',
      goalDeleted: '¡Objetivo eliminado exitosamente!',
      error: 'Ocurrió un error',
      confirmDelete: '¿Estás seguro de que quieres eliminar este objetivo?',
      addAmount: 'Agregar Cantidad',
      amountToAdd: 'Cantidad a Agregar',
      add: 'Agregar',
      totalSaved: 'Total Ahorrado',
      goalsCompleted: 'Objetivos Completados',
      averageProgress: 'Progreso Promedio',
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

      await loadGoals();
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth, router]);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalsData) {
      // Transform snake_case to camelCase
      const transformedGoals = goalsData.map((goal: any) => ({
        id: goal.id,
        userId: goal.user_id,
        name: goal.name,
        description: goal.description || null,
        targetAmount: parseFloat(goal.target_amount || 0),
        currentAmount: parseFloat(goal.current_amount || 0),
        targetDate: goal.target_date || null,
        isCompleted: goal.is_completed || false,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at,
      }));
      setGoals(transformedGoals as SavingsGoal[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Better validation with user feedback
    if (!formData.name || formData.name.trim() === '') {
      setError(language === 'es' ? 'El nombre del objetivo es requerido' : 'Goal name is required');
      return;
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      setError(language === 'es' ? 'La cantidad objetivo debe ser mayor a 0' : 'Target amount must be greater than 0');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(language === 'es' ? 'No se encontró el usuario' : 'User not found');
        setSaving(false);
        return;
      }

      console.log('Submitting goal:', { formData, editingGoal });

      const goalData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        target_amount: formData.targetAmount,
        current_amount: editingGoal?.currentAmount || 0,
        target_date: formData.targetDate || null,
        is_completed: false,
      };

      console.log('Goal data to save:', goalData);

      if (editingGoal) {
        const { data, error } = await supabase
          .from('savings_goals')
          .update(goalData)
          .eq('id', editingGoal.id)
          .select();

        console.log('Update result:', { data, error });

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        setSuccess(t.goalUpdated);
      } else {
        const { data, error } = await supabase
          .from('savings_goals')
          .insert(goalData)
          .select();

        console.log('Insert result:', { data, error });

        if (error) {
          console.error('Insert error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        setSuccess(t.goalCreated);
      }

      await loadGoals();
      
      // Reset form and close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setEditingGoal(null);
        setFormData({ name: '', description: '', targetAmount: 0, targetDate: '' });
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err.message || 
                          (err as any).error_description ||
                          (err as any).msg ||
                          t.error;
      setError(errorMessage);
      
      // Log full error for debugging
      console.error('Full error object:', JSON.stringify(err, (key, value) => {
        if (value instanceof Error) {
          return {
            message: value.message,
            name: value.name,
            stack: value.stack
          };
        }
        return value;
      }, 2));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setSuccess(t.goalDeleted);
      await loadGoals();
    } catch (err: any) {
      setError(err.message || t.error);
    }
  };

  const handleAddAmount = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = goal.currentAmount + amount;
      const isCompleted = newAmount >= goal.targetAmount;

      const { error } = await supabase
        .from('savings_goals')
        .update({
          current_amount: newAmount,
          is_completed: isCompleted,
        })
        .eq('id', goalId);

      if (error) throw error;

      await loadGoals();
    } catch (err: any) {
      setError(err.message || t.error);
    }
  };

  const calculateStats = () => {
    const totalSaved = goals.reduce((sum, goal) => {
      return sum + (goal.currentAmount || 0);
    }, 0);
    const completedGoals = goals.filter(goal => goal.isCompleted).length;
    const averageProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => {
          const current = goal.currentAmount || 0;
          const target = goal.targetAmount || 1;
          return sum + (current / target);
        }, 0) / goals.length * 100
      : 0;

    return { totalSaved, completedGoals, averageProgress };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner size="lg" text={t.title ? 'Loading savings goals...' : 'Loading...'} fullScreen />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToDashboard}
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {t.title}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingGoal(null);
                setFormData({ name: '', description: '', targetAmount: 0, targetDate: '' });
                setShowModal(true);
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
            >
              {t.addGoal}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.totalSaved}</h3>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${stats.totalSaved.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.goalsCompleted}</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.completedGoals}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.averageProgress}</h3>
                <p className="mt-2 text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {stats.averageProgress.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg bg-violet-100 p-3 dark:bg-violet-900/30">
                <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-12">
              <p className="text-lg font-medium">{t.noGoals}</p>
              <p className="text-sm mt-2">{t.createFirstGoal}</p>
            </div>
          ) : (
            goals.map((goal) => {
              const currentAmount = goal.currentAmount || 0;
              const targetAmount = goal.targetAmount || 1;
              const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
              const isCompleted = goal.isCompleted || progress >= 100;
              
              return (
                <div
                  key={goal.id}
                  className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {goal.name}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}>
                      {isCompleted ? t.completed : t.active}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>${currentAmount.toFixed(2)}</span>
                      <span>${targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {progress.toFixed(1)}% {t.progress}
                    </p>
                  </div>

                  {goal.targetDate && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const amount = prompt(t.amountToAdd);
                        if (amount && !isNaN(Number(amount))) {
                          handleAddAmount(goal.id, Number(amount));
                        }
                      }}
                      disabled={isCompleted}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t.addAmount}
                    </button>
                    <button
                      onClick={() => handleEdit(goal)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      {t.editGoal}
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {editingGoal ? t.editGoal : t.addGoal}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200 text-sm">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.goalName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.description}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.targetAmount}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.targetAmount === 0 ? '' : formData.targetAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, targetAmount: value === '' ? 0 : Number(value) });
                    }}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.targetDate}
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="fixed top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg shadow-lg z-50">
            {success}
          </div>
        )}
        {error && (
          <div className="fixed top-4 right-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
