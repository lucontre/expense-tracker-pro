'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export default function PricingPage() {
  const [userPlan, setUserPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      title: 'Pricing Plans',
      subtitle: 'Choose the plan that works best for you',
      backToDashboard: 'Back to Dashboard',
      currentPlan: 'Current Plan',
      upgradeToPro: 'Upgrade to Pro',
      downgradeToFree: 'Downgrade to Free',
      freePlan: 'Free Plan',
      proPlan: 'Pro Plan',
      monthly: '/month',
      yearly: '/year',
      basicExpenseTracking: 'Basic expense tracking',
      upTo10Categories: 'Up to 10 categories',
      fiftyTransactionsPerMonth: '50 transactions per month',
      basicReports: 'Basic reports',
      mobileAppAccess: 'Mobile app access',
      basicCharts: 'Basic charts and graphs',
      basicBudgeting: 'Basic budgeting tools',
      unlimitedTransactions: 'Unlimited transactions',
      unlimitedCategories: 'Unlimited categories',
      advancedReports: 'Advanced reports',
      exportToPDFExcel: 'Export to PDF & Excel',
      customCategories: 'Custom categories',
      prioritySupport: 'Priority support',
      sharedAccounts: 'Shared accounts with family',
      advancedCharts: 'Advanced charts and analytics',
      savingsGoals: 'Savings goals tracking',
      notifications: 'Smart notifications',
      dataBackup: 'Cloud backup & sync',
      noCustomCategories: 'No custom categories',
      noAdvancedReports: 'No advanced reports',
      noExportFunctionality: 'No export functionality',
      noSharedAccounts: 'No shared accounts',
      limitedSupport: 'Limited support',
      getStarted: 'Get Started',
      upgradeNow: 'Upgrade Now',
      contactSupport: 'Contact Support',
    },
    es: {
      title: 'Planes de Precios',
      subtitle: 'Elige el plan que mejor funcione para ti',
      backToDashboard: 'Volver al Dashboard',
      currentPlan: 'Plan Actual',
      upgradeToPro: 'Actualizar a Pro',
      downgradeToFree: 'Cambiar a Gratuito',
      freePlan: 'Plan Gratuito',
      proPlan: 'Plan Pro',
      monthly: '/mes',
      yearly: '/año',
      basicExpenseTracking: 'Seguimiento básico de gastos',
      upTo10Categories: 'Hasta 10 categorías',
      fiftyTransactionsPerMonth: '50 transacciones por mes',
      basicReports: 'Reportes básicos',
      mobileAppAccess: 'Acceso a aplicación móvil',
      basicCharts: 'Gráficos y diagramas básicos',
      basicBudgeting: 'Herramientas básicas de presupuesto',
      unlimitedTransactions: 'Transacciones ilimitadas',
      unlimitedCategories: 'Categorías ilimitadas',
      advancedReports: 'Reportes avanzados',
      exportToPDFExcel: 'Exportar a PDF y Excel',
      customCategories: 'Categorías personalizadas',
      prioritySupport: 'Soporte prioritario',
      sharedAccounts: 'Cuentas compartidas con familia',
      advancedCharts: 'Gráficos y análisis avanzados',
      savingsGoals: 'Seguimiento de metas de ahorro',
      notifications: 'Notificaciones inteligentes',
      dataBackup: 'Respaldo en la nube y sincronización',
      noCustomCategories: 'Sin categorías personalizadas',
      noAdvancedReports: 'Sin reportes avanzados',
      noExportFunctionality: 'Sin funcionalidad de exportación',
      noSharedAccounts: 'Sin cuentas compartidas',
      limitedSupport: 'Soporte limitado',
      getStarted: 'Comenzar',
      upgradeNow: 'Actualizar Ahora',
      contactSupport: 'Contactar Soporte',
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's current plan
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_plan')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserPlan(userData.subscription_plan || 'free');
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth]);

  const plans = [
    {
      id: 'free',
      name: t.freePlan,
      price: '$0',
      period: t.monthly,
      description: 'Perfect for getting started with expense tracking',
      features: [
        t.basicExpenseTracking,
        t.upTo10Categories,
        t.fiftyTransactionsPerMonth,
        t.basicReports,
        t.basicCharts,
        t.basicBudgeting,
        t.mobileAppAccess,
      ],
      limitations: [
        t.noCustomCategories,
        t.noAdvancedReports,
        t.noExportFunctionality,
        t.noSharedAccounts,
        t.limitedSupport,
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'cursor-default',
      popular: false,
    },
    {
      id: 'pro',
      name: t.proPlan,
      price: '$9.99',
      period: t.monthly,
      description: 'Everything you need for complete financial management',
      features: [
        t.unlimitedTransactions,
        t.unlimitedCategories,
        t.advancedReports,
        t.advancedCharts,
        t.exportToPDFExcel,
        t.customCategories,
        t.sharedAccounts,
        t.savingsGoals,
        t.notifications,
        t.dataBackup,
        t.prioritySupport,
      ],
      limitations: [],
      buttonText: userPlan === 'pro' ? t.currentPlan : t.upgradeToPro,
      buttonStyle: userPlan === 'pro'
        ? ''
        : '',
      popular: true,
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'pro' && userPlan !== 'pro') {
      // Navigate to checkout
      router.push('/checkout');
    } else if (planId === 'pro' && userPlan === 'pro') {
      // Navigate to subscription management
      router.push('/settings/subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-slate-900 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToDashboard}
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-zinc-50 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-slate-900 dark:text-zinc-400">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800 ${plan.popular ? 'border-2' : 'border border-slate-200 dark:border-slate-700'} transition-all hover:shadow-xl`}
              style={plan.popular ? { borderColor: 'var(--primary)' } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span 
                    className="text-white px-4 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 mb-2">
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    {plan.description}
                  </p>
                )}
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-slate-900 dark:text-zinc-50">
                    {plan.price}
                  </span>
                  <span className="text-slate-900 dark:text-zinc-400 ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex-grow">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-300 mb-3 uppercase tracking-wide">
                  Features
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-slate-900 dark:text-zinc-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitations.length > 0 && (
                <div className="mb-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-sm text-slate-900 dark:text-zinc-400">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6">
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors ${plan.buttonStyle}`}
                  style={
                    plan.id === 'pro' && userPlan === 'pro'
                      ? { backgroundColor: 'var(--primary)' }
                      : plan.id === 'pro'
                      ? { backgroundColor: 'var(--primary)' }
                      : plan.id === 'free'
                      ? { backgroundColor: '#64748b', color: '#ffffff' }
                      : undefined
                  }
                  disabled={plan.id === 'free'}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-slate-900 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToDashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}
