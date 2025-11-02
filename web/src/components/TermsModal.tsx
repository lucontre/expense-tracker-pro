'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsModal({ isOpen, onAccept, onDecline }: TermsModalProps) {
  const { language } = useLanguage();
  const [hasScrolled, setHasScrolled] = useState(false);

  const translations = {
    en: {
      title: 'Terms and Conditions',
      subtitle: 'Please read and accept our terms to continue',
      content: `
        By using Expense Tracker Pro, you agree to the following terms and conditions:

        1. **Data Collection and Usage**
        - We collect and store your financial data securely
        - Your data is encrypted and protected with industry-standard security measures
        - We use your data only to provide our services and improve user experience

        2. **Privacy and Security**
        - We never sell or share your personal information with third parties
        - All data transmission is encrypted using SSL/TLS
        - We implement strict access controls and regular security audits

        3. **Service Availability**
        - We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service
        - We reserve the right to perform maintenance and updates
        - We may temporarily suspend service for security reasons

        4. **User Responsibilities**
        - You are responsible for maintaining the security of your account
        - You must provide accurate and up-to-date information
        - You agree not to use the service for illegal activities

        5. **Data Retention**
        - We retain your data as long as your account is active
        - You can request data deletion at any time
        - We may retain certain data for legal compliance purposes

        6. **Changes to Terms**
        - We may update these terms from time to time
        - We will notify you of significant changes
        - Continued use constitutes acceptance of new terms

        7. **Limitation of Liability**
        - Our service is provided "as is" without warranties
        - We are not liable for any financial losses or damages
        - Our liability is limited to the amount you paid for the service

        For more detailed information, please read our full Privacy Policy.
      `,
      accept: 'I Accept',
      decline: 'I Decline',
      mustAccept: 'You must accept the terms to continue',
      scrollToContinue: 'Please scroll to the bottom to continue',
      privacyPolicy: 'Privacy Policy',
      termsAndConditions: 'Terms and Conditions'
    },
    es: {
      title: 'Términos y Condiciones',
      subtitle: 'Por favor lee y acepta nuestros términos para continuar',
      content: `
        Al usar Expense Tracker Pro, aceptas los siguientes términos y condiciones:

        1. **Recopilación y Uso de Datos**
        - Recopilamos y almacenamos tus datos financieros de forma segura
        - Tus datos están encriptados y protegidos con medidas de seguridad estándar de la industria
        - Usamos tus datos solo para proporcionar nuestros servicios y mejorar la experiencia del usuario

        2. **Privacidad y Seguridad**
        - Nunca vendemos o compartimos tu información personal con terceros
        - Toda la transmisión de datos está encriptada usando SSL/TLS
        - Implementamos controles de acceso estrictos y auditorías de seguridad regulares

        3. **Disponibilidad del Servicio**
        - Nos esforzamos por mantener un 99.9% de tiempo de actividad pero no podemos garantizar un servicio ininterrumpido
        - Nos reservamos el derecho de realizar mantenimiento y actualizaciones
        - Podemos suspender temporalmente el servicio por razones de seguridad

        4. **Responsabilidades del Usuario**
        - Eres responsable de mantener la seguridad de tu cuenta
        - Debes proporcionar información precisa y actualizada
        - Aceptas no usar el servicio para actividades ilegales

        5. **Retención de Datos**
        - Retenemos tus datos mientras tu cuenta esté activa
        - Puedes solicitar la eliminación de datos en cualquier momento
        - Podemos retener ciertos datos para fines de cumplimiento legal

        6. **Cambios en los Términos**
        - Podemos actualizar estos términos de vez en cuando
        - Te notificaremos de cambios significativos
        - El uso continuado constituye la aceptación de los nuevos términos

        7. **Limitación de Responsabilidad**
        - Nuestro servicio se proporciona "tal como está" sin garantías
        - No somos responsables de pérdidas financieras o daños
        - Nuestra responsabilidad está limitada al monto que pagaste por el servicio

        Para información más detallada, por favor lee nuestra Política de Privacidad completa.
      `,
      accept: 'Acepto',
      decline: 'Rechazo',
      mustAccept: 'Debes aceptar los términos para continuar',
      scrollToContinue: 'Por favor desplázate hasta el final para continuar',
      privacyPolicy: 'Política de Privacidad',
      termsAndConditions: 'Términos y Condiciones'
    }
  };

  const t = translations[language];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setHasScrolled(isAtBottom);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-xl dark:bg-slate-800">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {t.title}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        {/* Content */}
        <div 
          className="max-h-96 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
              {t.content}
            </pre>
          </div>
          
          {!hasScrolled && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              <p className="text-sm font-medium">
                {t.scrollToContinue}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 dark:border-slate-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-4">
              <Link
                href="/terms"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t.termsAndConditions}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t.privacyPolicy}
              </Link>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onDecline}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {t.decline}
              </button>
              <button
                onClick={onAccept}
                disabled={!hasScrolled}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.accept}
              </button>
            </div>
          </div>
          
          {!hasScrolled && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {t.mustAccept}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
