'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Transaction } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { Logo } from '@/components/Logo';
import { TransactionModal } from '@/components/TransactionModal';
import { Chart, chartConfigs } from '@/components/Chart';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { LoadingSpinner, SkeletonStatsGrid, SkeletonChart, SkeletonTable } from '@/components/Loading';
import { getTranslatedCategoryName } from '@/lib/categoryTranslations';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const [showExpandedChart, setShowExpandedChart] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [trendPeriod, setTrendPeriod] = useState<'month' | 'day'>('month');
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { language } = useLanguage();
  const { /* formatCurrency, */ getAllCurrencies, currency: userCurrency } = useCurrency();

  // Function to format currency for a specific transaction
  const formatTransactionCurrency = (amount: number, transactionCurrency?: string) => {
    const currencies = getAllCurrencies();
    const currencyInfo = currencies.find(c => c.code === transactionCurrency) || currencies[0];
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return `${currencyInfo.symbol}${formattedAmount}`;
  };

  // Handle transaction modal success
  const handleTransactionSuccess = () => {
    console.log('Transaction added successfully, reloading dashboard data...');
    loadTransactions(); // Reload transactions to update dashboard
    loadCategories(); // Also reload categories in case new ones were added
  };

  // Load categories
  const loadCategories = async () => {
    try {
      console.log('loadCategories called');
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      console.log('Categories query result:', { 
        data: data, 
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint
      });

      if (error) {
        console.error('Error loading categories:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        return;
      }

      console.log('Setting categories:', data);
      setCategories(data || []);
      console.log('Categories state updated, count:', data?.length || 0);
    } catch (err) {
      console.error('Error loading categories:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        fullError: err
      });
    }
  };

  // Translations
  const translations = {
    en: {
      dashboard: 'Dashboard',
      welcomeBack: 'Welcome back',
      freePlan: 'Free Plan',
      proPlan: 'Pro Plan',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      transactions: 'Transactions',
      manageExpenses: 'Manage expenses',
      addTransaction: 'Add Transaction',
      quickAdd: 'Quick Add',
      categories: 'Categories',
      organizeSpending: 'Organize spending',
      budgets: 'Budgets',
      setLimits: 'Set limits',
      reports: 'Reports',
      viewInsights: 'View insights',
      pricing: 'Pricing',
      upgradePlan: 'Upgrade plan',
      profile: 'Profile',
      logout: 'Logout',
      recentTransactions: 'Recent Transactions',
      noTransactions: 'No transactions yet',
      addFirstTransaction: 'Add your first transaction',
      expenseByCategory: 'Expenses by Category',
      incomeByCategory: 'Income by Category',
      monthlyTrend: 'Monthly Trend',
      dailyTrend: 'Daily Trend',
      viewByMonth: 'By Month',
      viewByDay: 'By Day',
      incomeVsExpenses: 'Income vs Expenses',
      savingsGoals: 'Savings Goals',
      viewGoals: 'View goals',
      expenses: 'Expenses',
      income: 'Income',
      other: 'Other',
      expandChart: 'Expand Chart',
      category: 'Category',
      date: 'Date',
      addedBy: 'Added by',
      you: 'You',
      filterByCurrency: 'Filter by Currency',
      selectCurrency: 'Select Currency',
    },
    es: {
      dashboard: 'Panel de Control',
      welcomeBack: 'Bienvenido de vuelta',
      freePlan: 'Plan Gratuito',
      proPlan: 'Plan Pro',
      totalIncome: 'Ingresos Totales',
      totalExpenses: 'Gastos Totales',
      balance: 'Balance',
      transactions: 'Transacciones',
      manageExpenses: 'Gestionar gastos',
      addTransaction: 'Agregar Transacción',
      quickAdd: 'Agregar Rápido',
      categories: 'Categorías',
      organizeSpending: 'Organizar gastos',
      budgets: 'Presupuestos',
      setLimits: 'Establecer límites',
      reports: 'Reportes',
      viewInsights: 'Ver análisis',
      pricing: 'Precios',
      upgradePlan: 'Actualizar plan',
      profile: 'Perfil',
      logout: 'Cerrar Sesión',
      recentTransactions: 'Transacciones Recientes',
      noTransactions: 'Aún no hay transacciones',
      addFirstTransaction: 'Agrega tu primera transacción',
      expenseByCategory: 'Gastos por Categoría',
      incomeByCategory: 'Ingresos por Categoría',
      monthlyTrend: 'Tendencia Mensual',
      dailyTrend: 'Tendencia Diaria',
      viewByMonth: 'Por Mes',
      viewByDay: 'Por Día',
      incomeVsExpenses: 'Ingresos vs Gastos',
      savingsGoals: 'Objetivos de Ahorro',
      viewGoals: 'Ver objetivos',
      expenses: 'Gastos',
      income: 'Ingresos',
      other: 'Otro',
      expandChart: 'Expandir Gráfico',
      category: 'Categoría',
      date: 'Fecha',
      addedBy: 'Agregado por',
      you: 'Tú',
      filterByCurrency: 'Filtrar por Moneda',
      selectCurrency: 'Seleccionar Moneda',
    }
  };

  const t = translations[language];

  const reloadUserPlan = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', authUser.id)
      .single();

    if (userData) {
      setUserPlan(userData.subscription_plan || 'free');
      // Update user object with new plan
      setUser((prev: any) => prev ? { ...prev, subscription_plan: userData.subscription_plan || 'free' } : null);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch complete user data including fullName
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userData) {
          // Merge auth user data with database user data
          setUser({
            ...user,
            fullName: userData.full_name,
            subscription_plan: userData.subscription_plan,
            language: userData.language,
            theme: userData.theme,
            avatar_url: userData.avatar_url,
            trial_started_at: userData.trial_started_at
          });
          setUserPlan(userData.subscription_plan || 'free');
          // Set initial currency from user preference or default to USD
          setSelectedCurrency(userData.currency || userCurrency || 'USD');
        } else {
          // Fallback to auth user data only
          setUser(user);
          setUserPlan('free');
          setSelectedCurrency(userCurrency || 'USD');
        }
        
        await loadTransactions();
        await loadCategories();
        setLoading(false);
    };

    checkUser();
  }, []); // Empty dependency array - run only on mount

  // Add a separate effect to reload data when the component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, reloading data...');
        reloadUserPlan();
        loadTransactions();
        loadCategories();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Add effect to reload data when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        console.log('Page focused, reloading data...');
        reloadUserPlan();
        loadTransactions();
        loadCategories();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loading]);

  // Reload data when pathname changes to dashboard (navigation back)
  useEffect(() => {
    if (pathname === '/dashboard' && user && !loading) {
      console.log('Navigated to dashboard, reloading data...');
      reloadUserPlan();
      loadTransactions();
      loadCategories();
    }
  }, [pathname, user, loading]);

  const loadTransactions = async () => {
    console.log('loadTransactions called');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      
      if (!user) {
        console.log('No user found in loadTransactions');
        return;
      }

      console.log('Loading transactions for user:', user.id);

      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories:category_id(name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      console.log('Transactions query result:', { 
        data: transactionsData, 
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint
      });

      if (error) {
        console.error('Error loading transactions:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: error.status,
          statusText: error.statusText
        });
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return;
      }

      if (transactionsData) {
        console.log('Loaded transactions with details:', transactionsData);
        setTransactions(transactionsData as Transaction[]);
        console.log('Transactions state updated, count:', transactionsData.length);
      } else {
        console.log('No transactions data returned');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error in loadTransactions:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
    }
  };

  // Filter transactions by selected currency
  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      const transactionCurrency = (t as any).currency || userCurrency;
      return transactionCurrency === selectedCurrency;
    });
  };

  const calculateStats = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  };

  const stats = calculateStats();

  // Format currency using selected currency
  const formatCurrencyForStats = (amount: number) => {
    return formatTransactionCurrency(amount, selectedCurrency);
  };

  // Helper functions for transaction details
  const getCategoryName = (transaction: any) => {
    if (transaction.categories?.name) {
      return transaction.categories.name;
    }
    return 'Other';
  };

  const getCreatedByUser = (/* transaction: any */) => {
    // Since we removed the created_by_user join, just return "You" for now
    return t.you;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generate chart data
  // Generate chart data
  const getCategoryData = (type: 'expense' | 'income') => {
    const filteredTransactions = getFilteredTransactions();
    console.log('Filtered transactions by currency:', filteredTransactions);
    console.log('All categories:', categories);
    
    // Create a map of category_id to category info (name)
    const categoryMap = new Map(categories.map(cat => [cat.id, { name: cat.name }]));
    console.log('Category map:', categoryMap);
    
    const categoryTotals = filteredTransactions
      .filter(t => t.type === type)
      .reduce((acc, t) => {
        let categoryName: string;
        if (t.category_id) {
          const categoryInfo = categoryMap.get(t.category_id);
          if (categoryInfo) {
            // Always try to translate - function will return original if no translation exists
            const translatedName = getTranslatedCategoryName(categoryInfo.name, language);
            categoryName = translatedName;
            console.log(`Translating category: "${categoryInfo.name}" -> "${translatedName}" (language: ${language})`);
          } else {
            categoryName = 'Other';
            console.log(`Category not found in map for category_id: ${t.category_id}`);
          }
        } else {
          categoryName = 'Other';
        }
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    console.log('Category totals:', categoryTotals);
    console.log('Current language:', language);

    const data = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories

    console.log('Chart data:', data);

    // If no data, return empty chart config
    if (data.length === 0) {
      console.log(`No ${type} data, returning empty chart`);
      return {
        labels: [language === 'es' ? 'Sin Datos' : 'No Data'],
        datasets: [{
          label: type === 'expense' ? t.expenses : t.income,
          data: [0],
          backgroundColor: [type === 'expense' ? '#ef4444' : '#22c55e'],
          borderColor: [type === 'expense' ? '#dc2626' : '#16a34a'],
          borderWidth: 1
        }]
      };
    }

    const chartData = chartConfigs.expenseByCategory(data, type === 'expense' ? t.expenses : t.income);
    console.log('Final chart config:', chartData);
    return chartData;
  };

  const getExpenseByCategoryData = () => getCategoryData('expense');
  const getIncomeByCategoryData = () => getCategoryData('income');

  const getTrendData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    if (trendPeriod === 'month') {
      return getMonthlyTrendData(filteredTransactions);
    } else {
      return getDailyTrendData(filteredTransactions);
    }
  };

  const getMonthlyTrendData = (filteredTransactions: Transaction[]) => {
    const monthlyData = filteredTransactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    const data = Object.entries(monthlyData)
      .map(([month, amounts]) => ({ month, ...amounts }))
      .sort((a, b) => {
        // Parse month string to date for proper sorting
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Last 6 months

    if (data.length === 0) {
      return {
        labels: [language === 'es' ? 'Sin Datos' : 'No Data'],
        datasets: [
          {
            label: t.income,
            data: [0],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: t.expenses,
            data: [0],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }
        ]
      };
    }

    return chartConfigs.monthlyTrend(data, t.income, t.expenses);
  };

  const getDailyTrendData = (filteredTransactions: Transaction[]) => {
    // Get transactions from the last 30 days or all if less
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of day
    
    const dailyData = filteredTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate >= thirtyDaysAgo;
      })
      .reduce((acc, t) => {
        const transactionDate = new Date(t.date);
        // Use ISO date string (YYYY-MM-DD) as key for consistent sorting
        const dayKey = transactionDate.toISOString().split('T')[0];
        // Format for display
        const dayLabel = transactionDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
          month: 'short', 
          day: 'numeric'
        });
        
        if (!acc[dayKey]) {
          acc[dayKey] = { 
            income: 0, 
            expenses: 0,
            label: dayLabel 
          };
        }
        if (t.type === 'income') {
          acc[dayKey].income += t.amount;
        } else {
          acc[dayKey].expenses += t.amount;
        }
        return acc;
      }, {} as Record<string, { income: number; expenses: number; label: string }>);

    const data = Object.entries(dailyData)
      .map(([dayKey, amounts]) => ({ 
        month: amounts.label, // Use formatted label for display
        income: amounts.income,
        expenses: amounts.expenses,
        sortKey: dayKey // Keep ISO date for sorting
      }))
      .sort((a, b) => {
        // Sort by ISO date string (YYYY-MM-DD) for proper chronological order
        return a.sortKey.localeCompare(b.sortKey);
      })
      .map(({ sortKey: _sortKey, ...rest }) => rest); // Remove sortKey from final data, keep month, income, expenses

    if (data.length === 0) {
      return {
        labels: [language === 'es' ? 'Sin Datos' : 'No Data'],
        datasets: [
          {
            label: t.income,
            data: [0],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: t.expenses,
            data: [0],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }
        ]
      };
    }

    return chartConfigs.monthlyTrend(data, t.income, t.expenses);
  };

  const getIncomeVsExpensesData = () => {
    return chartConfigs.incomeVsExpenses(stats.totalIncome, stats.totalExpenses, t.income, t.expenses);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div>
          <div className="mb-8">
            <LoadingSpinner size="lg" text={t.dashboard ? 'Loading dashboard...' : 'Loading...'} />
          </div>
          <div className="space-y-6">
            <SkeletonStatsGrid />
            <SkeletonChart />
            <SkeletonTable rows={5} />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
                 <div>
                   <div className="flex items-center gap-4 mb-4">
                     <Logo size="md" variant="icon" />
                     <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                       {t.dashboard}
                     </h1>
                   </div>
                  <p className="mt-2 text-slate-900 dark:text-slate-400">
                    {t.welcomeBack}, {user.fullName || user.email}
                  </p>
                   <div className="mt-2 flex items-center gap-3">
                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                       userPlan === 'pro'
                         ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                         : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                     }`}>
                       {userPlan === 'pro' ? t.proPlan : t.freePlan}
                     </span>
                     {/* Currency Filter Dropdown */}
                     <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-400">
                        {t.filterByCurrency}:
                      </label>
                       <select
                         value={selectedCurrency}
                         onChange={(e) => setSelectedCurrency(e.target.value)}
                         className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                       >
                         {getAllCurrencies().map((curr) => (
                           <option key={curr.code} value={curr.code}>
                             {language === 'es' ? curr.nameEs : curr.name} ({curr.symbol})
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>
                 <div>
                   <button
                     onClick={() => setShowTransactionModal(true)}
                     className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-md hover:shadow-lg"
                     style={{ backgroundColor: 'var(--primary)' }}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     <span>{t.addTransaction}</span>
                   </button>
                 </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Income Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-blue-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-400">{t.totalIncome}</h3>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--success)' }}>{formatCurrencyForStats(stats.totalIncome)}</p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Expenses Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-sky-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-400">{t.totalExpenses}</h3>
                <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--destructive)' }}>{formatCurrencyForStats(stats.totalExpenses)}</p>
              </div>
              <div className="rounded-lg bg-sky-100 p-3 dark:bg-sky-900/30">
                <svg className="h-6 w-6 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-emerald-200 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-400">{t.balance}</h3>
                <p className="mt-2 text-3xl font-bold" style={{ color: stats.balance >= 0 ? 'var(--success)' : 'var(--destructive)' }}>
                  {formatCurrencyForStats(stats.balance)}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${stats.balance >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                <svg className={`h-6 w-6 ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: stats.balance >= 0 ? 'var(--success)' : 'var(--destructive)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {transactions.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Category Chart with Toggle */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {chartType === 'expense' ? t.expenseByCategory : t.incomeByCategory}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Toggle Button */}
                  <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setChartType('expense')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartType === 'expense'
                          ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-50 shadow-sm'
                          : 'text-slate-900 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-50'
                      }`}
                    >
                      {t.expenses}
                    </button>
                    <button
                      onClick={() => setChartType('income')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartType === 'income'
                          ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-50 shadow-sm'
                          : 'text-slate-900 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-50'
                      }`}
                    >
                      {t.income}
                    </button>
                  </div>
                  {/* Expand Button */}
                  <button
                    onClick={() => setShowExpandedChart(true)}
                    className="p-2 text-slate-900 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title={t.expandChart}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              <Chart
                data={chartType === 'expense' ? getExpenseByCategoryData() : getIncomeByCategoryData()}
                type="bar"
                height={300}
                showLegend={false}
              />
            </div>

            {/* Income vs Expenses Chart */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {t.incomeVsExpenses}
              </h2>
              <div className="flex justify-center">
                <Chart
                  data={getIncomeVsExpensesData()}
                  type="doughnut"
                  height={250}
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Monthly/Daily Trend Chart - Extended */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {trendPeriod === 'month' ? t.monthlyTrend : t.dailyTrend}
                </h2>
                {/* Toggle for Month/Day */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setTrendPeriod('month')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      trendPeriod === 'month'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.viewByMonth}
                  </button>
                  <button
                    onClick={() => setTrendPeriod('day')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      trendPeriod === 'day'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.viewByDay}
                  </button>
                </div>
              </div>
              <Chart
                data={getTrendData()}
                type="line"
                height={400}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/transactions"
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.transactions}</h3>
                <p className="text-sm text-slate-900 dark:text-slate-400">{t.manageExpenses}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-violet-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-violet-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-violet-100 p-3 dark:bg-violet-900/30">
                <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.categories}</h3>
                <p className="text-sm text-slate-900 dark:text-slate-400">{t.organizeSpending}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/budgets"
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.budgets}</h3>
                <p className="text-sm text-slate-900 dark:text-slate-400">{t.setLimits}</p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports"
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-amber-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-amber-600"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.reports}</h3>
                <p className="text-sm text-slate-900 dark:text-slate-400">{t.viewInsights}</p>
              </div>
            </div>
          </Link>

                 <Link
                   href="/savings-goals"
                   className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-emerald-600"
                 >
                   <div className="flex items-center gap-4">
                     <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
                       <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                       </svg>
                     </div>
                     <div>
                       <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.savingsGoals}</h3>
                       <p className="text-sm text-slate-900 dark:text-slate-400">{t.viewGoals}</p>
                     </div>
                   </div>
                 </Link>

                 <Link
                   href="/pricing"
                   className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-600"
                 >
                   <div className="flex items-center gap-4">
                     <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
                       <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                       </svg>
                     </div>
                     <div>
                       <h3 className="font-semibold text-slate-900 dark:text-slate-50">{t.pricing}</h3>
                       <p className="text-sm text-slate-900 dark:text-slate-400">{t.upgradePlan}</p>
                     </div>
                   </div>
                 </Link>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {t.recentTransactions}
            </h2>
            <Link
              href="/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4">
            {(() => {
              const filteredTransactions = getFilteredTransactions();
              return filteredTransactions.length === 0 ? (
                <div className="text-center text-slate-900 dark:text-slate-400 py-8">
                  <p className="text-lg font-medium">{t.noTransactions}</p>
                  <p className="text-sm mt-2">{t.addFirstTransaction}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-slate-900 dark:text-slate-50">
                            {transaction.description}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              transaction.type === 'income'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                            }`}
                          >
                            {transaction.type === 'income' ? t.income : t.expenses}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-900 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-900">📅</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-900">🏷️</span>
                            <span>{getCategoryName(transaction)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-900">👤</span>
                            <span>{t.addedBy}: {getCreatedByUser()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatTransactionCurrency(Math.abs(transaction.amount), (transaction as any).currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
            })()}
          </div>
        </div>

      {/* Floating Add Transaction Button */}
      <button
        onClick={() => setShowTransactionModal(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg transition-all hover:shadow-xl"
        style={{
          backgroundColor: 'var(--primary)',
        }}
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={handleTransactionSuccess}
        user={user}
      />

      {/* Expanded Chart Modal */}
      {showExpandedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {chartType === 'expense' ? t.expenseByCategory : t.incomeByCategory}
              </h2>
              <div className="flex items-center gap-4">
                {/* Toggle Button */}
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setChartType('expense')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'expense'
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-50 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
                    }`}
                  >
                    {t.expenses}
                  </button>
                  <button
                    onClick={() => setChartType('income')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === 'income'
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-50 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
                    }`}
                  >
                    {t.income}
                  </button>
                </div>
                {/* Close Button */}
                <button
                  onClick={() => setShowExpandedChart(false)}
                  className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <Chart
                data={chartType === 'expense' ? getExpenseByCategoryData() : getIncomeByCategoryData()}
                type="bar"
                height={500}
                showLegend={false}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  );
}
