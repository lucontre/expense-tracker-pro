'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Transaction, Category } from '@expense-tracker-pro/shared';
import { checkTransactionLimit } from '@/lib/plan-limits';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslatedCategoryName } from '@/lib/categoryTranslations';
import { LoadingSpinner, SkeletonTable } from '@/components/Loading';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

function TransactionsPageContent() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionLimit, setTransactionLimit] = useState<{ canAdd: boolean; current: number; limit: number | null }>({ canAdd: true, current: 0, limit: null });
  const [isSharedAccount, setIsSharedAccount] = useState(false);
  const [createdByUsers, setCreatedByUsers] = useState<{ [key: string]: { email: string; full_name: string | null } }>({});
  const [userPlan, setUserPlan] = useState<string>('free');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    description: '',
    category: '',
    type: '',
    amountMin: '',
    amountMax: '',
    createdBy: '',
  });
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD' as 'USD' | 'MXN' | 'GTQ' | 'EUR',
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { language } = useLanguage();
  const { currency: userCurrency, getAllCurrencies /* , formatCurrency */ } = useCurrency();

  // Function to format currency for a specific transaction
  const formatTransactionCurrency = (amount: number, transactionCurrency?: string) => {
    const currency = transactionCurrency || userCurrency;
    const currencies = getAllCurrencies();
    const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return `${currencyInfo.symbol}${formattedAmount}`;
  };

  // Translations
  const translations = {
    en: {
      title: 'Transactions',
      subtitle: 'Manage your income and expenses',
      addTransaction: 'Add Transaction',
      backToDashboard: 'Back to Dashboard',
      noTransactions: 'No transactions yet. Click "Add Transaction" to get started.',
      limitWarning: 'You\'ve used {current} of {limit} transactions this month.',
      upgradePrompt: 'Upgrade to Pro for unlimited transactions',
      date: 'Date',
      description: 'Description',
      category: 'Category',
      type: 'Type',
      amount: 'Amount',
      currency: 'Currency',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      income: 'income',
      expense: 'expense',
      uncategorized: 'Uncategorized',
      createdBy: 'Created By',
      you: 'You',
      filters: 'Filters',
      clearFilters: 'Clear Filters',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      amountMin: 'Min Amount',
      amountMax: 'Max Amount',
      all: 'All',
      allTypes: 'All Types',
      filtersProOnly: 'Advanced Filters',
      filtersProOnlyDesc: 'Filter transactions by date, category, type, amount, and more. Upgrade to Pro to unlock advanced filtering.',
      upgradeToPro: 'Upgrade to Pro',
    },
    es: {
      title: 'Transacciones',
      subtitle: 'Gestiona tus ingresos y gastos',
      addTransaction: 'Agregar Transacción',
      backToDashboard: 'Volver al Dashboard',
      noTransactions: 'Aún no hay transacciones. Haz clic en "Agregar Transacción" para comenzar.',
      limitWarning: 'Has usado {current} de {limit} transacciones este mes.',
      upgradePrompt: 'Actualiza a Pro para transacciones ilimitadas',
      date: 'Fecha',
      description: 'Descripción',
      category: 'Categoría',
      type: 'Tipo',
      amount: 'Monto',
      currency: 'Moneda',
      actions: 'Acciones',
      edit: 'Editar',
      delete: 'Eliminar',
      income: 'ingreso',
      expense: 'gasto',
      uncategorized: 'Sin categorizar',
      createdBy: 'Creado Por',
      you: 'Tú',
      filters: 'Filtros',
      clearFilters: 'Limpiar Filtros',
      dateFrom: 'Fecha Desde',
      dateTo: 'Fecha Hasta',
      amountMin: 'Monto Mínimo',
      amountMax: 'Monto Máximo',
      all: 'Todos',
      allTypes: 'Todos los Tipos',
      filtersProOnly: 'Filtros Avanzados',
      filtersProOnlyDesc: 'Filtra transacciones por fecha, categoría, tipo, monto y más. Actualiza a Pro para desbloquear filtros avanzados.',
      upgradeToPro: 'Actualizar a Pro',
    }
  };

  const t = translations[language];

  const reloadUserPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (userData) {
      setUserPlan(userData.subscription_plan || 'free');
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Fetch user data including subscription plan
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setUserPlan(userData.subscription_plan || 'free');
      }
      
      setUser(user);
      await loadData();
      await checkLimits();
      setLoading(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  // Reload user plan when page becomes visible or gets focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !loading) {
        reloadUserPlan();
      }
    };

    const handleFocus = () => {
      if (user && !loading) {
        reloadUserPlan();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loading]);

  // Check for action=add parameter to open modal automatically
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add' && !loading && user) {
      openModal();
      // Clean up the URL parameter
      router.replace('/transactions');
    }
  }, [searchParams, loading, user, router]);

  // Clear category selection when type changes if current category doesn't match the new type
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      if (selectedCategory && selectedCategory.type !== formData.type) {
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
    }
  }, [formData.type, categories]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  // Filter transactions based on filters
  const getFilteredTransactions = () => {
    // If not Pro, return all transactions without filtering
    if (userPlan !== 'pro') {
      return transactions;
    }
    
    return transactions.filter((transaction) => {
      const transactionAny = transaction as any;
      
      // Date filter
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;
      
      // Description filter
      if (filters.description && !transaction.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
      
      // Category filter
      if (filters.category && transaction.category_id !== filters.category) return false;
      
      // Type filter
      if (filters.type && transaction.type !== filters.type) return false;
      
      // Amount filter
      if (filters.amountMin && transaction.amount < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && transaction.amount > parseFloat(filters.amountMax)) return false;
      
      // Created by filter (only if shared account)
      if (isSharedAccount && filters.createdBy) {
        const createdByUserId = transactionAny.created_by_user_id || user?.id;
        if (filters.createdBy === 'me' && createdByUserId !== user?.id) return false;
        if (filters.createdBy !== 'me' && filters.createdBy !== '' && createdByUserId !== filters.createdBy) return false;
      }
      
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      description: '',
      category: '',
      type: '',
      amountMin: '',
      amountMax: '',
      createdBy: '',
    });
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if account is shared
      const { data: sharingData, error: sharingError } = await supabase
        .from('account_sharing')
        .select('*')
        .or(`primary_user_id.eq.${user.id},shared_user_id.eq.${user.id}`)
        .eq('status', 'active');

      console.log('Checking shared account:', {
        sharingData,
        sharingError,
        userId: user.id
      });

      const hasSharedAccount = !sharingError && sharingData && sharingData.length > 0;
      console.log('Has shared account:', hasSharedAccount);

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        alert(`Error loading transactions: ${transactionsError.message}`);
        return;
      }

      if (transactionsData) {
        setTransactions(transactionsData as Transaction[]);
        
        // Get unique user IDs from created_by_user_id
        const allCreatedByUserIds = transactionsData
          .map((t: any) => t.created_by_user_id)
          .filter((id: string | null) => id !== null);
        
        const uniqueUserIds = [...new Set(allCreatedByUserIds)] as string[];

        console.log('All created_by_user_id values:', allCreatedByUserIds);
        console.log('Unique user IDs from transactions:', uniqueUserIds);
        console.log('Has shared account from table:', hasSharedAccount);
        console.log('Current user ID:', user.id);

        // Show column if:
        // 1. There's a shared account (formal sharing relationship), OR
        // 2. There are transactions with created_by_user_id values (tracking who created each)
        const shouldShowColumn = hasSharedAccount || uniqueUserIds.length > 0;
        console.log('Should show created by column:', shouldShowColumn);
        setIsSharedAccount(shouldShowColumn);

        // Build created_by_users map if we should show the column
        if (shouldShowColumn) {
          // If there are unique user IDs, fetch their data
          if (uniqueUserIds.length > 0) {
            console.log('All user IDs to fetch:', uniqueUserIds);

            // Fetch user data for all unique created_by_user_ids
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, email, full_name')
              .in('id', uniqueUserIds);

            console.log('Users data fetched:', usersData);
            console.log('Users error:', usersError);

            if (!usersError && usersData) {
              const usersMap: { [key: string]: { email: string; full_name: string | null } } = {};
              usersData.forEach((userData: any) => {
                usersMap[userData.id] = {
                  email: userData.email || '',
                  full_name: userData.full_name || null
                };
              });
              console.log('Users map created:', usersMap);
              setCreatedByUsers(usersMap);
            }
          } else if (hasSharedAccount) {
            // If there's a shared account but no created_by_user_id yet, 
            // at least load the current user's data
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, email, full_name')
              .eq('id', user.id)
              .single();

            if (!userError && userData) {
              setCreatedByUsers({
                [user.id]: {
                  email: userData.email || '',
                  full_name: userData.full_name || null
                }
              });
            }
          }
        }
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        // Don't show alert for categories error, just log it
      } else if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }
    } catch (error) {
      console.error('Unexpected error in loadData:', error);
      alert('An unexpected error occurred while loading data.');
    }
  };

  const checkLimits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const limit = await checkTransactionLimit(user.id);
    setTransactionLimit(limit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check limits for new transactions
    if (!editingTransaction && !transactionLimit.canAdd) {
      alert(`You've reached your transaction limit of ${transactionLimit.limit}. Upgrade to Pro for unlimited transactions.`);
      return;
    }

    const transactionData = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category_id: formData.category_id || null,
      type: formData.type,
      date: formData.date,
      currency: formData.currency,
      created_by_user_id: user.id, // Track who created the transaction
    };

    try {
      if (editingTransaction) {
        // Update transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        
        if (updateError) {
          console.error('Error updating transaction:', updateError);
          alert(`Error updating transaction: ${updateError.message}`);
          return;
        }
      } else {
        // Create transaction
        const { error: insertError } = await supabase.from('transactions').insert([transactionData]);
        
        if (insertError) {
          console.error('Error creating transaction:', insertError);
          alert(`Error creating transaction: ${insertError.message}`);
          return;
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
      return;
    }

    setShowModal(false);
    setEditingTransaction(null);
    setFormData({
      amount: '',
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      currency: userCurrency,
    });
    await loadData();
    await checkLimits();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category_id: transaction.category_id || '',
      type: transaction.type,
      date: transaction.date,
      currency: (transaction as any).currency || userCurrency,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await supabase.from('transactions').delete().eq('id', id);
      await loadData();
      await checkLimits();
    }
  };

  const openModal = () => {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      currency: userCurrency,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="mb-8">
          <LoadingSpinner size="lg" text={t.title ? 'Loading transactions...' : 'Loading...'} />
        </div>
        <SkeletonTable rows={10} />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-0 sm:px-0 lg:px-0">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
                 <div className="flex gap-3">
                   <Link
                     href="/dashboard"
                     className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                   >
                     {t.backToDashboard}
                   </Link>
                   <button
                     onClick={openModal}
                     disabled={!transactionLimit.canAdd}
                     className={`rounded-lg px-4 py-2 font-semibold text-white transition-all ${
                       transactionLimit.canAdd
                         ? 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                         : 'bg-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {t.addTransaction}
                   </button>
                 </div>
        </div>

               {/* Transaction Limit Warning */}
               {transactionLimit.limit && (
                 <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                   <div className="flex items-center">
                     <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                     <div>
                       <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                         {t.limitWarning.replace('{current}', transactionLimit.current.toString()).replace('{limit}', transactionLimit.limit.toString())}
                         {!transactionLimit.canAdd && (
                           <span className="ml-2">
                             <Link href="/pricing" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100">
                               {t.upgradePrompt}
                             </Link>
                           </span>
                         )}
                       </p>
                     </div>
                   </div>
                 </div>
               )}

               {/* Filters Section - Pro Only */}
               {userPlan === 'pro' ? (
                 <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                     {t.filters}
                   </h2>
                   <button
                     onClick={clearFilters}
                     className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 font-medium"
                   >
                     {t.clearFilters}
                   </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {/* Date From */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.dateFrom}
                     </label>
                     <input
                       type="date"
                       value={filters.dateFrom}
                       onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   
                   {/* Date To */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.dateTo}
                     </label>
                     <input
                       type="date"
                       value={filters.dateTo}
                       onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   
                   {/* Description */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.description}
                     </label>
                     <input
                       type="text"
                       value={filters.description}
                       onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                       placeholder={language === 'es' ? 'Buscar en descripción...' : 'Search in description...'}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   
                   {/* Category */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.category}
                     </label>
                     <select
                       value={filters.category}
                       onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     >
                       <option value="">{t.all}</option>
                       {categories.map((category) => (
                         <option key={category.id} value={category.id}>
                           {category.is_system 
                             ? getTranslatedCategoryName(category.name, language)
                             : category.name}
                         </option>
                       ))}
                     </select>
                   </div>
                   
                   {/* Type */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.type}
                     </label>
                     <select
                       value={filters.type}
                       onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     >
                       <option value="">{t.allTypes}</option>
                       <option value="income">{t.income}</option>
                       <option value="expense">{t.expense}</option>
                     </select>
                   </div>
                   
                   {/* Amount Min */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.amountMin}
                     </label>
                     <input
                       type="number"
                       step="0.01"
                       value={filters.amountMin}
                       onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                       placeholder={language === 'es' ? 'Mínimo' : 'Min'}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   
                   {/* Amount Max */}
                   <div>
                     <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                       {t.amountMax}
                     </label>
                     <input
                       type="number"
                       step="0.01"
                       value={filters.amountMax}
                       onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                       placeholder={language === 'es' ? 'Máximo' : 'Max'}
                       className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   
                   {/* Created By (only if shared account) */}
                   {isSharedAccount && (
                     <div>
                       <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                         {t.createdBy}
                       </label>
                       <select
                         value={filters.createdBy}
                         onChange={(e) => setFilters({ ...filters, createdBy: e.target.value })}
                         className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                       >
                         <option value="">{t.all}</option>
                         <option value="me">{t.you}</option>
                         {Object.entries(createdByUsers).map(([userId, userData]) => (
                           userId !== user?.id && (
                             <option key={userId} value={userId}>
                               {userData.full_name || userData.email || userId}
                             </option>
                           )
                         ))}
                       </select>
                     </div>
                   )}
                 </div>
                 
                 {/* Results count */}
                 <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                   <p className="text-sm text-slate-600 dark:text-slate-400">
                     {language === 'es' 
                       ? `Mostrando ${filteredTransactions.length} de ${transactions.length} transacciones`
                       : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`}
                   </p>
                 </div>
               </div>
               ) : (
                 <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                         {t.filtersProOnly}
                       </h2>
                       <p className="text-sm text-slate-600 dark:text-slate-400">
                         {t.filtersProOnlyDesc}
                       </p>
                     </div>
                     <Link
                       href="/pricing"
                       className="ml-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow-md"
                     >
                       {t.upgradeToPro}
                     </Link>
                   </div>
                 </div>
               )}

               {/* Transactions List */}
               <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.description}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.category}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.type}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.amount}
                  </th>
                  {isSharedAccount && (
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {t.createdBy}
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={isSharedAccount ? 7 : 6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      {transactions.length === 0 ? t.noTransactions : (language === 'es' ? 'No se encontraron transacciones con los filtros aplicados' : 'No transactions found with applied filters')}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const getCreatedByDisplay = () => {
                      if (!isSharedAccount) return null;
                      const transactionAny = transaction as any;
                      const createdByUserId = transactionAny.created_by_user_id;
                      
                      if (!createdByUserId || createdByUserId === user?.id) {
                        return t.you;
                      }
                      
                      const createdByUser = createdByUsers[createdByUserId];
                      if (createdByUser) {
                        return createdByUser.full_name || createdByUser.email || t.you;
                      }
                      
                      return t.you;
                    };

                    return (
                      <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-center text-slate-900 dark:text-slate-50">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-50">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-slate-500 dark:text-slate-400">
                          {(() => {
                            const category = categories.find((c) => c.id === transaction.category_id);
                            if (category) {
                              return category.is_system 
                                ? getTranslatedCategoryName(category.name, language)
                                : category.name;
                            }
                            return t.uncategorized;
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                              transaction.type === 'income'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
                            }`}
                          >
                            {transaction.type === 'income' ? t.income : t.expense}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-semibold">
                          <span
                            className={
                              transaction.type === 'income'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {transaction.type === 'income' ? '+' : '-'}{formatTransactionCurrency(Math.abs(transaction.amount), (transaction as any).currency)}
                          </span>
                        </td>
                        {isSharedAccount && (
                          <td className="px-6 py-4 text-sm text-center text-slate-500 dark:text-slate-400">
                            {getCreatedByDisplay()}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-medium">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              {t.edit}
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                            >
                              {t.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-800">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t.currency}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'MXN' | 'GTQ' | 'EUR' })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  >
                    {getAllCurrencies().map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {language === 'es' ? curr.nameEs : curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {language === 'es' 
                      ? 'Nota: La moneda se guardará cuando ejecutes la migración de base de datos'
                      : 'Note: Currency will be saved when you run the database migration'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {t.category}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                  >
                    <option value="">{t.uncategorized}</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {getTranslatedCategoryName(category.name, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TransactionsPageContent />
    </Suspense>
  );
}
