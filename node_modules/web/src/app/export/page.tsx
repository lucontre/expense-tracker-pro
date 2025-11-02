'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { ProRestriction } from '@/components/ProRestriction';
import { DataExporter, ExportData } from '@/utils/dataExporter';
import { LoadingSpinner, LoadingButton } from '@/components/Loading';

export default function ExportPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [data, setData] = useState<ExportData | null>(null);
  
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const supabase = createClient();
  const exporter = new DataExporter();

  const translations = {
    en: {
      title: 'Export Data',
      subtitle: 'Download your financial data in various formats',
      proFeature: 'Pro Feature',
      upgradeRequired: 'This feature is available for Pro users only',
      upgradeNow: 'Upgrade to Pro',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      exportFormat: 'Export Format',
      pdfReport: 'PDF Report',
      pdfDescription: 'Professional report with charts and tables',
      excelData: 'Excel Spreadsheet',
      excelDescription: 'Raw data in spreadsheet format',
      jsonBackup: 'JSON Backup',
      jsonDescription: 'Complete data backup in JSON format',
      exportData: 'Export Data',
      exporting: 'Exporting...',
      exportSettings: 'Export Settings',
      dataSummary: 'Data Summary',
      totalTransactions: 'Total Transactions',
      totalBudgets: 'Total Budgets',
      totalSavingsGoals: 'Total Savings Goals',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      noData: 'No data found for the selected period',
      selectPeriod: 'Please select a date range to export data',
    },
    es: {
      title: 'Exportar Datos',
      subtitle: 'Descarga tus datos financieros en varios formatos',
      proFeature: 'Función Pro',
      upgradeRequired: 'Esta función está disponible solo para usuarios Pro',
      upgradeNow: 'Actualizar a Pro',
      dateRange: 'Rango de Fechas',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      exportFormat: 'Formato de Exportación',
      pdfReport: 'Reporte PDF',
      pdfDescription: 'Reporte profesional con gráficos y tablas',
      excelData: 'Hoja de Cálculo Excel',
      excelDescription: 'Datos sin procesar en formato de hoja de cálculo',
      jsonBackup: 'Respaldo JSON',
      jsonDescription: 'Respaldo completo de datos en formato JSON',
      exportData: 'Exportar Datos',
      exporting: 'Exportando...',
      exportSettings: 'Configuración de Exportación',
      dataSummary: 'Resumen de Datos',
      totalTransactions: 'Total de Transacciones',
      totalBudgets: 'Total de Presupuestos',
      totalSavingsGoals: 'Total de Metas de Ahorro',
      totalIncome: 'Total de Ingresos',
      totalExpenses: 'Total de Gastos',
      balance: 'Balance',
      noData: 'No se encontraron datos para el período seleccionado',
      selectPeriod: 'Por favor selecciona un rango de fechas para exportar datos',
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user && dateRange.start && dateRange.end) {
      loadExportData();
    }
  }, [user, dateRange]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUser({
        ...user,
        ...userData
      });
    }
    setLoading(false);
  };

  const loadExportData = async () => {
    if (!user) return;

    try {
      // Load transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false });

      // Load budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Load savings goals
      const { data: savingsGoals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      // Load categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      setData({
        transactions: transactions || [],
        budgets: budgets || [],
        savingsGoals: savingsGoals || [],
        categories: categories || [],
        user,
        period: {
          start: dateRange.start,
          end: dateRange.end
        }
      });
    } catch (error) {
      console.error('Error loading export data:', error);
    }
  };

  const handleExport = async () => {
    if (!data) return;

    setExporting(true);
    try {
      switch (exportType) {
        case 'pdf':
          await exporter.exportToPDF(data, language);
          break;
        case 'excel':
          await exporter.exportToExcel(data, language);
          break;
        case 'json':
          await exporter.exportToJSON(data);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <LoadingSpinner size="lg" text="Loading export data..." fullScreen />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Check if user is Pro
  if (!user || user.subscription_plan !== 'pro') {
    return <ProRestriction feature="export" />;
  }

  const totalIncome = data?.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalExpenses = data?.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {t.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
              {t.exportSettings}
            </h2>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t.dateRange}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                {t.exportFormat}
              </label>
              <div className="space-y-3">
                {[
                  { value: 'pdf', label: t.pdfReport, description: t.pdfDescription, icon: '📄' },
                  { value: 'excel', label: t.excelData, description: t.excelDescription, icon: '📊' },
                  { value: 'json', label: t.jsonBackup, description: t.jsonDescription, icon: '💾' }
                ].map((format) => (
                  <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="exportType"
                      value={format.value}
                      checked={exportType === format.value}
                      onChange={(e) => setExportType(e.target.value as 'pdf' | 'excel' | 'json')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{format.icon}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {format.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {format.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || !data}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {exporting ? (
                <LoadingButton text={t.exporting || 'Exporting...'} />
              ) : (
                <span>{t.exportData}</span>
              )}
            </button>
          </div>

          {/* Data Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6">
              {t.dataSummary}
            </h2>

            {data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {t.totalTransactions}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {data.transactions.length}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {t.totalBudgets}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {data.budgets.length}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t.totalSavingsGoals}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {data.savingsGoals.length}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-600">
                    <span className="text-slate-600 dark:text-slate-400">{t.totalIncome}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-600">
                    <span className="text-slate-600 dark:text-slate-400">{t.totalExpenses}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 dark:text-slate-400">{t.balance}</span>
                    <span className={`font-semibold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(totalIncome - totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">
                  {t.selectPeriod}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}