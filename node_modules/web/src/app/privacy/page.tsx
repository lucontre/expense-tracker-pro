'use client';

import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Privacy Policy',
      subtitle: 'Last updated: December 2024',
      backToDashboard: 'Back to Dashboard',
      introduction: 'Your Privacy is Important to Us',
      introductionText: 'This Privacy Policy explains how Expense Tracker Pro collects, uses, and protects your personal information when you use our application.',
      
      sections: {
        informationCollection: {
          title: '1. Information We Collect',
          content: 'We collect information you provide directly to us, such as when you create an account, add transactions, or contact us for support. This includes your email address, transaction data, and preferences.'
        },
        informationUse: {
          title: '2. How We Use Your Information',
          content: 'We use your information to provide and improve our services, process transactions, send you important updates, and provide customer support. We do not sell or share your personal information with third parties.'
        },
        dataStorage: {
          title: '3. Data Storage and Security',
          content: 'Your data is stored securely using industry-standard encryption. We use secure cloud infrastructure and implement multiple layers of security to protect your information from unauthorized access.'
        },
        dataSharing: {
          title: '4. Information Sharing',
          content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to protect our rights and the safety of our users.'
        },
        cookies: {
          title: '5. Cookies and Tracking',
          content: 'We use cookies and similar technologies to improve your experience, remember your preferences, and analyze how you use our application. You can control cookie settings through your browser.'
        },
        dataRetention: {
          title: '6. Data Retention',
          content: 'We retain your personal information for as long as necessary to provide our services and as required by law. You can request deletion of your account and associated data at any time.'
        },
        userRights: {
          title: '7. Your Rights',
          content: 'You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request a copy of your data.'
        },
        children: {
          title: '8. Children\'s Privacy',
          content: 'Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information.'
        },
        changes: {
          title: '9. Changes to This Policy',
          content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.'
        },
        contact: {
          title: '10. Contact Us',
          content: 'If you have any questions about this Privacy Policy, please contact us at privacy@expensetrackerpro.com or through the application support system.'
        }
      },
      
      footer: {
        title: 'We Protect Your Data',
        text: 'Your financial information is encrypted and stored securely. We follow industry best practices and regularly audit our security measures to ensure your data remains protected.',
        lastUpdated: 'Last updated: December 2024'
      }
    },
    es: {
      title: 'Política de Privacidad',
      subtitle: 'Última actualización: Diciembre 2024',
      backToDashboard: 'Volver al Dashboard',
      introduction: 'Su Privacidad es Importante para Nosotros',
      introductionText: 'Esta Política de Privacidad explica cómo Expense Tracker Pro recopila, usa y protege su información personal cuando utiliza nuestra aplicación.',
      
      sections: {
        informationCollection: {
          title: '1. Información que Recopilamos',
          content: 'Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, agrega transacciones o nos contacta para soporte. Esto incluye su dirección de correo electrónico, datos de transacciones y preferencias.'
        },
        informationUse: {
          title: '2. Cómo Usamos Su Información',
          content: 'Utilizamos su información para proporcionar y mejorar nuestros servicios, procesar transacciones, enviarle actualizaciones importantes y brindar soporte al cliente. No vendemos ni compartimos su información personal con terceros.'
        },
        dataStorage: {
          title: '3. Almacenamiento y Seguridad de Datos',
          content: 'Sus datos se almacenan de forma segura utilizando encriptación estándar de la industria. Utilizamos infraestructura de nube segura e implementamos múltiples capas de seguridad para proteger su información del acceso no autorizado.'
        },
        dataSharing: {
          title: '4. Compartir Información',
          content: 'No vendemos, intercambiamos o transferimos de otra manera su información personal a terceros sin su consentimiento, excepto según lo requiera la ley o para proteger nuestros derechos y la seguridad de nuestros usuarios.'
        },
        cookies: {
          title: '5. Cookies y Seguimiento',
          content: 'Utilizamos cookies y tecnologías similares para mejorar su experiencia, recordar sus preferencias y analizar cómo utiliza nuestra aplicación. Puede controlar la configuración de cookies a través de su navegador.'
        },
        dataRetention: {
          title: '6. Retención de Datos',
          content: 'Retenemos su información personal durante el tiempo necesario para proporcionar nuestros servicios y según lo requiera la ley. Puede solicitar la eliminación de su cuenta y datos asociados en cualquier momento.'
        },
        userRights: {
          title: '7. Sus Derechos',
          content: 'Tiene derecho a acceder, actualizar o eliminar su información personal. También puede optar por no recibir ciertas comunicaciones y solicitar una copia de sus datos.'
        },
        children: {
          title: '8. Privacidad de Menores',
          content: 'Nuestro servicio no está destinado a niños menores de 13 años. No recopilamos conscientemente información personal de niños menores de 13 años. Si nos enteramos de dicha recopilación, eliminaremos la información.'
        },
        changes: {
          title: '9. Cambios a Esta Política',
          content: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos de cualquier cambio material publicando la nueva política en esta página y actualizando la fecha de "Última actualización".'
        },
        contact: {
          title: '10. Contáctenos',
          content: 'Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos en privacy@expensetrackerpro.com o a través del sistema de soporte de la aplicación.'
        }
      },
      
      footer: {
        title: 'Protegemos Sus Datos',
        text: 'Su información financiera está encriptada y almacenada de forma segura. Seguimos las mejores prácticas de la industria y auditamos regularmente nuestras medidas de seguridad para asegurar que sus datos permanezcan protegidos.',
        lastUpdated: 'Última actualización: Diciembre 2024'
      }
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
          
          <div className="text-center">
            <Logo size="lg" variant="full" className="justify-center mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              {t.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
            {t.introduction}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.introductionText}
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {Object.entries(t.sections).map(([key, section]) => (
            <div
              key={key}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {section.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100 mb-4">
              {t.footer.title}
            </h3>
            <p className="text-green-800 dark:text-green-200 leading-relaxed mb-4">
              {t.footer.text}
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              {t.footer.lastUpdated}
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
