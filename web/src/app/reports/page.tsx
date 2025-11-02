'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Transaction, Category } from '@expense-tracker-pro/shared';
import { canExportReports, canUseAdvancedAnalytics } from '@/lib/plan-limits';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslatedCategoryName } from '@/lib/categoryTranslations';
import { LoadingSpinner, LoadingButton } from '@/components/Loading';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function ReportsPage() {
  // const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [canExport, setCanExport] = useState(false);
  const [canUseAdvanced, setCanUseAdvanced] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    type: '',
    currency: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();
  const { getAllCurrencies } = useCurrency();

  // Translations
  const translations = {
    en: {
      title: 'Reports',
      subtitle: 'View your financial insights and analytics',
      backToDashboard: 'Back to Dashboard',
      exportNotice: 'Export functionality is available for Pro users only.',
      upgradePrompt: 'Upgrade to Pro to export reports',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      spendingByCategory: 'Spending by Category',
      monthlyTrends: 'Monthly Trends',
      noData: 'No expense data available',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      advancedAnalytics: 'Advanced Analytics',
      averageSpending: 'Average Spending',
      topCategory: 'Top Category',
      spendingTrend: 'Spending Trend',
      incomeVsExpenses: 'Income vs Expenses',
      categoryBreakdown: 'Category Breakdown',
      monthlyComparison: 'Monthly Comparison',
      yearOverYear: 'Year over Year',
      filters: 'Filters',
      showFilters: 'Show Filters',
      hideFilters: 'Hide Filters',
      clearFilters: 'Clear Filters',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      category: 'Category',
      type: 'Type',
      currency: 'Currency',
      allCategories: 'All Categories',
      allTypes: 'All Types',
      allCurrencies: 'All Currencies',
      income: 'Income',
      expense: 'Expense',
      uncategorized: 'Uncategorized',
      savingsAnalysis: 'Savings Analysis',
      savingsRate: 'Savings Rate',
      totalSavings: 'Total Savings',
      totalIncomeLabel: 'Total Income',
      savingsRateExplanation: 'Savings Rate is calculated as: (Total Savings / Total Income) × 100%',
      spendingVelocity: 'Spending Velocity (Last 30 Days)',
      totalSpent: 'Total Spent',
      dailyAverage: 'Daily Average',
      transactions: 'Transactions',
      topTransactions: 'Top Transactions',
      noMonthlyData: 'No monthly data available',
      noTransactionsAvailable: 'No transactions available',
      upgradeToPro: 'Upgrade to Pro',
      unlockAdvanced: 'Unlock detailed insights, savings analysis, spending velocity, and monthly trends with Pro.',
      description: 'Description',
    },
    es: {
      title: 'Reportes',
      subtitle: 'Ve tus análisis financieros e insights',
      backToDashboard: 'Volver al Dashboard',
      exportNotice: 'La funcionalidad de exportación está disponible solo para usuarios Pro.',
      upgradePrompt: 'Actualiza a Pro para exportar reportes',
      totalIncome: 'Ingresos Totales',
      totalExpenses: 'Gastos Totales',
      balance: 'Balance',
      spendingByCategory: 'Gastos por Categoría',
      monthlyTrends: 'Tendencias Mensuales',
      noData: 'No hay datos de gastos disponibles',
      exportPDF: 'Exportar PDF',
      exportExcel: 'Exportar Excel',
      advancedAnalytics: 'Análisis Avanzados',
      averageSpending: 'Gasto Promedio',
      topCategory: 'Categoría Principal',
      spendingTrend: 'Tendencia de Gastos',
      incomeVsExpenses: 'Ingresos vs Gastos',
      categoryBreakdown: 'Desglose por Categoría',
      monthlyComparison: 'Comparación Mensual',
      yearOverYear: 'Año tras Año',
      filters: 'Filtros',
      showFilters: 'Mostrar Filtros',
      hideFilters: 'Ocultar Filtros',
      clearFilters: 'Limpiar Filtros',
      dateFrom: 'Fecha Desde',
      dateTo: 'Fecha Hasta',
      category: 'Categoría',
      type: 'Tipo',
      currency: 'Moneda',
      allCategories: 'Todas las Categorías',
      allTypes: 'Todos los Tipos',
      allCurrencies: 'Todas las Monedas',
      income: 'Ingreso',
      expense: 'Gasto',
      uncategorized: 'Sin Categorizar',
      savingsAnalysis: 'Análisis de Ahorros',
      savingsRate: 'Tasa de Ahorro',
      totalSavings: 'Ahorros Totales',
      totalIncomeLabel: 'Ingresos Totales',
      savingsRateExplanation: 'La Tasa de Ahorro se calcula como: (Ahorros Totales / Ingresos Totales) × 100%',
      spendingVelocity: 'Velocidad de Gasto (Últimos 30 Días)',
      totalSpent: 'Total Gastado',
      dailyAverage: 'Promedio Diario',
      transactions: 'Transacciones',
      topTransactions: 'Transacciones Principales',
      noMonthlyData: 'No hay datos mensuales disponibles',
      noTransactionsAvailable: 'No hay transacciones disponibles',
      upgradeToPro: 'Actualizar a Pro',
      unlockAdvanced: 'Desbloquea insights detallados, análisis de ahorros, velocidad de gasto y tendencias mensuales con Pro.',
      description: 'Descripción',
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

      // setUser(user);
      await loadData();
      await checkPermissions();
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth, router]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load transactions
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transactionsData) {
      setTransactions(transactionsData as Transaction[]);
    }

    // Load categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesData) {
      setCategories(categoriesData as Category[]);
    }
  };

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const exportPermission = await canExportReports(user.id);
    const advancedPermission = await canUseAdvancedAnalytics(user.id);
    
    setCanExport(exportPermission);
    setCanUseAdvanced(advancedPermission);
  };

  // Filter transactions based on filters
  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      // Date filter
      if (filters.dateFrom && new Date(t.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(t.date) > new Date(filters.dateTo)) return false;
      
      // Category filter
      if (filters.category && t.category_id !== filters.category) return false;
      
      // Type filter
      if (filters.type && t.type !== filters.type) return false;
      
      // Currency filter
      if (filters.currency && t.currency !== filters.currency) return false;
      
      return true;
    });
  };

  // Format currency for display
  const formatTransactionCurrency = (amount: number, transactionCurrency?: string) => {
    const currencies = getAllCurrencies();
    const currencyInfo = currencies.find(c => c.code === transactionCurrency) || currencies[0];
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return `${currencyInfo.symbol}${formattedAmount}`;
  };

  const calculateStats = () => {
    const filtered = getFilteredTransactions();
    
    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  const getCategorySpending = () => {
    const filtered = getFilteredTransactions();
    const categoryTotals: { [key: string]: number } = {};
    
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        const category = categories.find((c) => c.id === transaction.category_id);
        const categoryName = category 
          ? (category.is_system ? getTranslatedCategoryName(category.name, language) : category.name)
          : t.uncategorized;
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Advanced Analytics Functions (Pro only)
  const getMonthlyTrends = () => {
    const filtered = getFilteredTransactions();
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    filtered.forEach((transaction) => {
      const month = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getTopTransactions = () => {
    const filtered = getFilteredTransactions();
    return filtered
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 10);
  };

  const getSpendingVelocity = () => {
    const filtered = getFilteredTransactions();
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentExpenses = filtered.filter(
      (t) => t.type === 'expense' && new Date(t.date) >= last30Days
    );
    
    const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = totalSpent / 30;
    
    return {
      totalSpent,
      dailyAverage,
      transactionCount: recentExpenses.length,
    };
  };

  /**
   * Calculates Savings Analysis metrics:
   * 
   * 1. Total Savings = Total Income - Total Expenses
   *    Example: If income is $2583.00 and expenses are $808.00, savings = $1775.00
   * 
   * 2. Savings Rate = (Total Savings / Total Income) × 100%
   *    Example: ($1775.00 / $2583.00) × 100% = 68.7%
   * 
   * This shows what percentage of income is being saved rather than spent.
   * A higher savings rate indicates better financial health.
   */
  const getSavingsRate = () => {
    const filtered = getFilteredTransactions();
    
    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    return {
      savings,
      savingsRate,
      totalIncome,
      totalExpenses,
    };
  };

  const exportToPDF = async () => {
    if (!canExport) {
      alert(language === 'es' 
        ? 'La funcionalidad de exportación está disponible solo para usuarios Pro. Por favor, actualiza tu plan.'
        : 'Export functionality is only available for Pro users. Please upgrade your plan.');
      return;
    }

    setExporting(true);
    
    try {
      const stats = calculateStats();
      const categorySpending = getCategorySpending();
      const filteredTransactions = getFilteredTransactions();
      
      // Helper to format currency for export
      const formatCurrencyForExport = (amount: number, currencyCode?: string) => {
        const currency = currencyCode || filters.currency || 'USD';
        const currencies = getAllCurrencies();
        const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
      };

      // Get date format based on language
      const formatDateForExport = (date: string) => {
        return new Date(date).toLocaleDateString(language === 'es' ? 'es-GT' : 'en-US');
      };

      // Get active filter labels
      const activeFilters: string[] = [];
      if (filters.dateFrom || filters.dateTo) {
        const dateRange = filters.dateFrom && filters.dateTo
          ? `${formatDateForExport(filters.dateFrom)} - ${formatDateForExport(filters.dateTo)}`
          : filters.dateFrom
          ? `${language === 'es' ? 'Desde' : 'From'} ${formatDateForExport(filters.dateFrom)}`
          : `${language === 'es' ? 'Hasta' : 'Until'} ${formatDateForExport(filters.dateTo)}`;
        activeFilters.push(`${language === 'es' ? 'Período' : 'Period'}: ${dateRange}`);
      }
      if (filters.category) {
        const cat = categories.find(c => c.id === filters.category);
        const catName = cat ? (cat.is_system ? getTranslatedCategoryName(cat.name, language) : cat.name) : '';
        activeFilters.push(`${t.category}: ${catName}`);
      }
      if (filters.type) {
        activeFilters.push(`${t.type}: ${filters.type === 'income' ? t.income : t.expense}`);
      }
      if (filters.currency) {
        const curr = currencies.find(c => c.code === filters.currency);
        activeFilters.push(`${t.currency}: ${curr ? (language === 'es' ? curr.nameEs : curr.name) : filters.currency}`);
      }

      const reportHTML = `
        <!DOCTYPE html>
        <html lang="${language}">
          <head>
            <meta charset="UTF-8">
            <title>${t.title}</title>
            <style>
              @media print {
                @page { margin: 1cm; }
                body { margin: 0; }
                .no-print { display: none; }
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
              }
              h1 { 
                color: #1e293b; 
                margin-bottom: 10px;
                font-size: 28px;
              }
              .report-header {
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e2e8f0;
              }
              .report-info {
                color: #64748b;
                font-size: 14px;
                margin: 5px 0;
              }
              .filters-info {
                margin-top: 10px;
                padding: 10px;
                background: #f1f5f9;
                border-radius: 6px;
                font-size: 12px;
                color: #475569;
              }
              .filters-info strong {
                color: #334155;
              }
              .stats { 
                display: flex; 
                gap: 20px; 
                margin: 30px 0; 
                flex-wrap: wrap;
              }
              .stat { 
                background: #f8fafc; 
                padding: 20px; 
                border-radius: 8px; 
                border: 1px solid #e2e8f0;
                flex: 1;
                min-width: 200px;
              }
              .stat h3 { 
                margin: 0 0 10px 0; 
                color: #64748b; 
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .stat p { 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
              }
              .income { color: #10B981; }
              .expense { color: #EF4444; }
              .balance { color: #3B82F6; }
              h2 {
                color: #1e293b;
                margin: 30px 0 15px 0;
                font-size: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e2e8f0;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
                font-size: 13px;
              }
              th, td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #e2e8f0; 
              }
              th { 
                background: #f1f5f9; 
                color: #334155;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
              }
              tr:hover {
                background: #f8fafc;
              }
              .transaction-type-income {
                color: #10B981;
                font-weight: 600;
              }
              .transaction-type-expense {
                color: #EF4444;
                font-weight: 600;
              }
              .section {
                page-break-inside: avoid;
                margin-bottom: 40px;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <h1>${t.title}</h1>
              <div class="report-info">
                ${language === 'es' ? 'Generado el:' : 'Generated on:'} ${formatDateForExport(new Date().toISOString())}
              </div>
              ${activeFilters.length > 0 ? `
                <div class="filters-info">
                  <strong>${language === 'es' ? 'Filtros Aplicados:' : 'Applied Filters:'}</strong><br>
                  ${activeFilters.join(' | ')}
                </div>
              ` : ''}
            </div>
            
            <div class="section">
              <h2>${language === 'es' ? 'Resumen' : 'Summary'}</h2>
              <div class="stats">
                <div class="stat">
                  <h3>${t.totalIncome}</h3>
                  <p class="income">${formatCurrencyForExport(stats.totalIncome)}</p>
                </div>
                <div class="stat">
                  <h3>${t.totalExpenses}</h3>
                  <p class="expense">${formatCurrencyForExport(stats.totalExpenses)}</p>
                </div>
                <div class="stat">
                  <h3>${t.balance}</h3>
                  <p class="balance">${formatCurrencyForExport(stats.balance)}</p>
                </div>
              </div>
            </div>
            
            ${categorySpending.length > 0 ? `
              <div class="section">
                <h2>${t.spendingByCategory}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>${t.category}</th>
                      <th>${language === 'es' ? 'Monto' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${categorySpending.map(cat => `
                      <tr>
                        <td>${cat.category}</td>
                        <td>${formatCurrencyForExport(cat.amount)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
            
            ${filteredTransactions.length > 0 ? `
              <div class="section">
                <h2>${language === 'es' ? 'Todas las Transacciones' : 'All Transactions'}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>${language === 'es' ? 'Fecha' : 'Date'}</th>
                      <th>${t.description}</th>
                      <th>${t.type}</th>
                      <th>${t.category}</th>
                      <th>${language === 'es' ? 'Monto' : 'Amount'}</th>
                      <th>${t.currency}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredTransactions.map(transaction => {
                      const category = categories.find(c => c.id === transaction.category_id);
                      const categoryName = category 
                        ? (category.is_system ? getTranslatedCategoryName(category.name, language) : category.name)
                        : t.uncategorized;
                      
                      return `
                        <tr>
                          <td>${formatDateForExport(transaction.date)}</td>
                          <td>${transaction.description}</td>
                          <td class="transaction-type-${transaction.type}">${transaction.type === 'income' ? t.income : t.expense}</td>
                          <td>${categoryName}</td>
                          <td>${formatCurrencyForExport(transaction.amount, transaction.currency)}</td>
                          <td>${transaction.currency || 'USD'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="section">
                <p style="color: #64748b;">${t.noTransactionsAvailable}</p>
              </div>
            `}
          </body>
        </html>
      `;

      // Open in new window for printing/saving as PDF
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(reportHTML);
        newWindow.document.close();
        // Wait a moment for styles to load before printing
        setTimeout(() => {
          newWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(language === 'es' 
        ? 'Error al generar el reporte PDF'
        : 'Error generating PDF report');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    if (!canExport) {
      alert(language === 'es' 
        ? 'La funcionalidad de exportación está disponible solo para usuarios Pro. Por favor, actualiza tu plan.'
        : 'Export functionality is only available for Pro users. Please upgrade your plan.');
      return;
    }

    setExporting(true);
    
    try {
      const stats = calculateStats();
      const categorySpending = getCategorySpending();
      const filteredTransactions = getFilteredTransactions();
      
      // Helper to format currency for export
      const formatCurrencyForExport = (amount: number, currencyCode?: string) => {
        const currency = currencyCode || filters.currency || 'USD';
        const currencies = getAllCurrencies();
        const currencyInfo = currencies.find(c => c.code === currency) || currencies[0];
        return `${currencyInfo.symbol}${amount.toFixed(2)}`;
      };

      // Get date format based on language
      const formatDateForExport = (date: string) => {
        return new Date(date).toLocaleDateString(language === 'es' ? 'es-GT' : 'en-US');
      };

      // Create CSV content with proper translations and currencies
      const csvContent = [
        [t.title], // "Reportes" or "Reports"
        [language === 'es' ? 'Generado el:' : 'Generated on:', formatDateForExport(new Date().toISOString())],
        [''],
        [language === 'es' ? 'Resumen' : 'Summary'],
        [t.totalIncome, formatCurrencyForExport(stats.totalIncome)],
        [t.totalExpenses, formatCurrencyForExport(stats.totalExpenses)],
        [t.balance, formatCurrencyForExport(stats.balance)],
        [''],
        [t.spendingByCategory], // "Gastos por Categoría" or "Spending by Category"
        [t.category, language === 'es' ? 'Monto' : 'Amount'],
        ...categorySpending.map(cat => [cat.category, formatCurrencyForExport(cat.amount)]),
        [''],
        [language === 'es' ? 'Todas las Transacciones' : 'All Transactions'],
        [
          language === 'es' ? 'Fecha' : 'Date',
          t.description,
          t.type,
          t.category,
          language === 'es' ? 'Monto' : 'Amount',
          t.currency
        ],
        ...filteredTransactions.map(transaction => {
          const category = categories.find(c => c.id === transaction.category_id);
          const categoryName = category 
            ? (category.is_system ? getTranslatedCategoryName(category.name, language) : category.name)
            : t.uncategorized;
          
          return [
            formatDateForExport(transaction.date),
            transaction.description,
            transaction.type === 'income' ? t.income : t.expense,
            categoryName,
            formatCurrencyForExport(transaction.amount, transaction.currency),
            transaction.currency || 'USD'
          ];
        })
      ].map(row => row.join(',')).join('\n');

      // Download CSV file with UTF-8 BOM for proper encoding
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = language === 'es' 
        ? `reporte-gastos-${new Date().toISOString().split('T')[0]}.csv`
        : `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(language === 'es' 
        ? 'Error al generar el reporte de Excel'
        : 'Error generating Excel report');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      category: '',
      type: '',
      currency: '',
    });
  };

  const currencies = getAllCurrencies();

  const stats = calculateStats();
  const categorySpending = getCategorySpending();
  const monthlyTrends = getMonthlyTrends();
  const topTransactions = getTopTransactions();
  const spendingVelocity = getSpendingVelocity();
  const savingsData = getSavingsRate();

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner size="lg" text={t.title ? 'Loading reports...' : 'Loading...'} fullScreen />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            {canExport && (
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                >
                  {exporting ? <LoadingButton text={t.exportPDF || 'Exporting...'} /> : t.exportPDF}
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                >
                  {exporting ? <LoadingButton text={t.exportExcel || 'Exporting...'} /> : t.exportExcel}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{t.filters}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {showFilters ? t.hideFilters : t.showFilters}
              </button>
              {showFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>
          </div>
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.dateFrom}
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.dateTo}
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.category}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">{t.allCategories}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.is_system ? getTranslatedCategoryName(cat.name, language) : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.currency}
                </label>
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">{t.allCurrencies}</option>
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {language === 'es' ? curr.nameEs : curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Export Notice */}
        {!canExport && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  {t.exportNotice}
                  <Link href="/pricing" className="ml-2 font-semibold underline hover:text-blue-900 dark:hover:text-blue-100">
                    {t.upgradePrompt}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.totalIncome}</h3>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">${stats.totalIncome.toFixed(2)}</p>
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
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.totalExpenses}</h3>
                <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">${stats.totalExpenses.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-rose-100 p-3 dark:bg-rose-900/30">
                <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.balance}</h3>
                <p className={`mt-2 text-3xl font-bold ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ${stats.balance.toFixed(2)}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${stats.balance >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                <svg className={`h-6 w-6 ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Spending */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
            {t.spendingByCategory}
          </h2>
          {categorySpending.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{t.noData}</p>
          ) : (
            <div className="space-y-3">
              {categorySpending.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Analytics (Pro only) */}
        {canUseAdvanced ? (
          <>
            {/* Savings Analysis */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                💰 {t.savingsAnalysis}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {t.savingsRateExplanation}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {savingsData.savingsRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.savingsRate}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatTransactionCurrency(savingsData.savings, filters.currency || undefined)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.totalSavings}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {formatTransactionCurrency(savingsData.totalIncome, filters.currency || undefined)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.totalIncomeLabel}</div>
                </div>
              </div>
            </div>

            {/* Spending Velocity */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                📊 {t.spendingVelocity}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatTransactionCurrency(spendingVelocity.totalSpent, filters.currency || undefined)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.totalSpent}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatTransactionCurrency(spendingVelocity.dailyAverage, filters.currency || undefined)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.dailyAverage}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {spendingVelocity.transactionCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t.transactions}</div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                📈 {t.monthlyTrends}
              </h2>
              {monthlyTrends.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">{t.noMonthlyData}</p>
              ) : (
                <div className="space-y-3">
                  {monthlyTrends.slice(-6).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                          {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {t.totalIncome}: {formatTransactionCurrency(trend.income, filters.currency || undefined)} | {t.totalExpenses}: {formatTransactionCurrency(trend.expenses, filters.currency || undefined)}
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        trend.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatTransactionCurrency(trend.balance, filters.currency || undefined)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Transactions */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                🏆 {t.topTransactions}
              </h2>
              {topTransactions.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">{t.noTransactionsAvailable}</p>
              ) : (
                <div className="space-y-3">
                  {topTransactions.map((transaction /* , index */) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(transaction.date).toLocaleDateString()} • {categories.find(c => c.id === transaction.category_id) 
                            ? (categories.find(c => c.id === transaction.category_id)!.is_system 
                                ? getTranslatedCategoryName(categories.find(c => c.id === transaction.category_id)!.name, language)
                                : categories.find(c => c.id === transaction.category_id)!.name)
                            : t.uncategorized}
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatTransactionCurrency(Math.abs(transaction.amount), transaction.currency || filters.currency || undefined)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🔒 {t.advancedAnalytics}
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                {t.unlockAdvanced}
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.upgradeToPro}
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}