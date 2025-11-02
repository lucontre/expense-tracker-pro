'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface ProRestrictionProps {
  feature: string;
  children?: React.ReactNode;
}

export function ProRestriction({ feature, children }: ProRestrictionProps) {
  const { language } = useLanguage();

  const translations = {
    en: {
      proFeature: 'Pro Feature',
      upgradeRequired: 'Upgrade to Pro Required',
      description: 'This feature is available for Pro users only. Upgrade to Pro to unlock all premium features.',
      upgradeNow: 'Upgrade to Pro',
      learnMore: 'Learn More',
      features: {
        export: 'Data Export',
        sharing: 'Account Sharing',
        advancedReports: 'Advanced Reports',
        unlimitedTransactions: 'Unlimited Transactions',
        prioritySupport: 'Priority Support'
      }
    },
    es: {
      proFeature: 'Función Pro',
      upgradeRequired: 'Actualización a Pro Requerida',
      description: 'Esta función está disponible solo para usuarios Pro. Actualiza a Pro para desbloquear todas las funciones premium.',
      upgradeNow: 'Actualizar a Pro',
      learnMore: 'Saber Más',
      features: {
        export: 'Exportación de Datos',
        sharing: 'Compartir Cuenta',
        advancedReports: 'Reportes Avanzados',
        unlimitedTransactions: 'Transacciones Ilimitadas',
        prioritySupport: 'Soporte Prioritario'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        {/* Pro Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold mb-6">
          <span className="mr-2">💎</span>
          {t.proFeature}
        </div>

        {/* Feature Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full flex items-center justify-center">
          <span className="text-2xl">
            {feature === 'export' && '📊'}
            {feature === 'sharing' && '👥'}
            {feature === 'advancedReports' && '📈'}
            {feature === 'unlimitedTransactions' && '💰'}
            {feature === 'prioritySupport' && '🎧'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          {t.upgradeRequired}
        </h1>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {t.description}
        </p>

        {/* Feature Name */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {t.features[feature as keyof typeof t.features]}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {feature === 'export' && (language === 'es' 
              ? 'Exporta tus datos en PDF, Excel y JSON'
              : 'Export your data in PDF, Excel, and JSON formats'
            )}
            {feature === 'sharing' && (language === 'es'
              ? 'Comparte tu cuenta con familiares y socios'
              : 'Share your account with family and business partners'
            )}
            {feature === 'advancedReports' && (language === 'es'
              ? 'Reportes detallados y análisis avanzados'
              : 'Detailed reports and advanced analytics'
            )}
            {feature === 'unlimitedTransactions' && (language === 'es'
              ? 'Sin límite en el número de transacciones'
              : 'No limit on the number of transactions'
            )}
            {feature === 'prioritySupport' && (language === 'es'
              ? 'Soporte técnico prioritario y respuesta rápida'
              : 'Priority technical support and fast response'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {t.upgradeNow}
          </Link>
          
          <Link
            href="/contact"
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {t.learnMore}
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'es' 
              ? 'Prueba Pro gratis por 7 días'
              : 'Try Pro free for 7 days'
            }
          </p>
        </div>

        {/* Custom Content */}
        {children && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
