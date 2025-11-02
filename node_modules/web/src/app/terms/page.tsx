'use client';

import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function TermsConditionsPage() {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Terms and Conditions',
      subtitle: 'Last updated: December 2024',
      backToDashboard: 'Back to Dashboard',
      introduction: 'Welcome to Expense Tracker Pro',
      introductionText: 'These Terms and Conditions ("Terms") govern your use of our expense tracking application and services. By using our app, you agree to be bound by these Terms.',
      
      sections: {
        acceptance: {
          title: '1. Acceptance of Terms',
          content: 'By accessing and using Expense Tracker Pro, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        dataProtection: {
          title: '2. Data Protection and Privacy',
          content: 'We are committed to protecting your personal and financial information. Your data is encrypted and stored securely using industry-standard security measures. We will never sell, share, or misuse your personal information.'
        },
        dataSecurity: {
          title: '3. Data Security',
          content: 'All your financial data is encrypted in transit and at rest. We use secure cloud infrastructure and follow best practices for data protection. Your information is only accessible to you and authorized personnel for technical support.'
        },
        userResponsibilities: {
          title: '4. User Responsibilities',
          content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as necessary. You must not use the service for any illegal or unauthorized purpose.'
        },
        serviceAvailability: {
          title: '5. Service Availability',
          content: 'We strive to maintain high service availability but cannot guarantee uninterrupted access. We may perform maintenance that temporarily affects service availability.'
        },
        subscriptionTerms: {
          title: '6. Subscription Terms',
          content: 'Pro subscriptions are billed monthly or annually. You can cancel your subscription at any time. Refunds are provided according to our refund policy. Free trial periods are subject to terms and conditions.'
        },
        intellectualProperty: {
          title: '7. Intellectual Property',
          content: 'The Expense Tracker Pro application, including its design, functionality, and content, is protected by intellectual property laws. You may not copy, modify, or distribute our software without permission.'
        },
        limitations: {
          title: '8. Limitations of Liability',
          content: 'Expense Tracker Pro is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.'
        },
        changes: {
          title: '9. Changes to Terms',
          content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the application. Continued use constitutes acceptance of modified terms.'
        },
        contact: {
          title: '10. Contact Information',
          content: 'If you have any questions about these Terms and Conditions, please contact us through the application or at support@expensetrackerpro.com.'
        }
      },
      
      footer: {
        title: 'Your Privacy Matters',
        text: 'We take your privacy seriously and are committed to protecting your financial information. Our security measures are regularly updated to ensure the highest level of protection for your data.',
        lastUpdated: 'Last updated: December 2024'
      }
    },
    es: {
      title: 'Términos y Condiciones',
      subtitle: 'Última actualización: Diciembre 2024',
      backToDashboard: 'Volver al Dashboard',
      introduction: 'Bienvenido a Expense Tracker Pro',
      introductionText: 'Estos Términos y Condiciones ("Términos") rigen su uso de nuestra aplicación de seguimiento de gastos y servicios. Al usar nuestra aplicación, usted acepta estar sujeto a estos Términos.',
      
      sections: {
        acceptance: {
          title: '1. Aceptación de los Términos',
          content: 'Al acceder y usar Expense Tracker Pro, usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo con lo anterior, por favor no use este servicio.'
        },
        dataProtection: {
          title: '2. Protección de Datos y Privacidad',
          content: 'Estamos comprometidos a proteger su información personal y financiera. Sus datos están encriptados y almacenados de forma segura usando medidas de seguridad estándar de la industria. Nunca venderemos, compartiremos o mal usaremos su información personal.'
        },
        dataSecurity: {
          title: '3. Seguridad de Datos',
          content: 'Todos sus datos financieros están encriptados en tránsito y en reposo. Utilizamos infraestructura de nube segura y seguimos las mejores prácticas para la protección de datos. Su información solo es accesible para usted y el personal autorizado para soporte técnico.'
        },
        userResponsibilities: {
          title: '4. Responsabilidades del Usuario',
          content: 'Usted es responsable de mantener la confidencialidad de las credenciales de su cuenta. Usted acepta proporcionar información precisa y actualizarla según sea necesario. No debe usar el servicio para ningún propósito ilegal o no autorizado.'
        },
        serviceAvailability: {
          title: '5. Disponibilidad del Servicio',
          content: 'Nos esforzamos por mantener una alta disponibilidad del servicio pero no podemos garantizar acceso ininterrumpido. Podemos realizar mantenimiento que afecte temporalmente la disponibilidad del servicio.'
        },
        subscriptionTerms: {
          title: '6. Términos de Suscripción',
          content: 'Las suscripciones Pro se facturan mensual o anualmente. Puede cancelar su suscripción en cualquier momento. Los reembolsos se proporcionan según nuestra política de reembolsos. Los períodos de prueba gratuita están sujetos a términos y condiciones.'
        },
        intellectualProperty: {
          title: '7. Propiedad Intelectual',
          content: 'La aplicación Expense Tracker Pro, incluyendo su diseño, funcionalidad y contenido, está protegida por las leyes de propiedad intelectual. No puede copiar, modificar o distribuir nuestro software sin permiso.'
        },
        limitations: {
          title: '8. Limitaciones de Responsabilidad',
          content: 'Expense Tracker Pro se proporciona "tal como está" sin garantías. No somos responsables de daños indirectos, incidentales o consecuenciales que surjan del uso del servicio.'
        },
        changes: {
          title: '9. Cambios en los Términos',
          content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Notificaremos a los usuarios sobre cambios significativos por correo electrónico o a través de la aplicación. El uso continuado constituye aceptación de los términos modificados.'
        },
        contact: {
          title: '10. Información de Contacto',
          content: 'Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos a través de la aplicación o en support@expensetrackerpro.com.'
        }
      },
      
      footer: {
        title: 'Su Privacidad Importa',
        text: 'Nos tomamos en serio su privacidad y estamos comprometidos a proteger su información financiera. Nuestras medidas de seguridad se actualizan regularmente para asegurar el más alto nivel de protección para sus datos.',
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

        {/* Terms Sections */}
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
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              {t.footer.title}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed mb-4">
              {t.footer.text}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300">
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
