'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const translations = {
    en: {
      title: 'Contact Us',
      subtitle: 'Get in touch with our support team',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      type: 'Inquiry Type',
      general: 'General Inquiry',
      technical: 'Technical Support',
      billing: 'Billing Question',
      feature: 'Feature Request',
      bug: 'Bug Report',
      sendMessage: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      successMessage: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      backToDashboard: 'Back to Dashboard',
      faq: 'Frequently Asked Questions',
      faqItems: [
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.'
        },
        {
          question: 'How do I upgrade to Pro?',
          answer: 'Go to the Pricing page and click "Upgrade to Pro". You can start with a 7-day free trial.'
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes! Pro users can export their data in PDF, Excel, or JSON format from the Export page.'
        },
        {
          question: 'How do I share my account?',
          answer: 'Pro users can share their account with family members using the Account Sharing feature in Profile settings.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your financial data.'
        }
      ],
      emailSupport: 'Email Support',
      emailText: 'For immediate assistance, you can also email us directly:',
      emailAddress: 'support@expensetrackerpro.com',
      responseTime: 'We typically respond within 24 hours during business days.'
    },
    es: {
      title: 'Contáctanos',
      subtitle: 'Ponte en contacto con nuestro equipo de soporte',
      name: 'Nombre Completo',
      email: 'Dirección de Correo',
      subject: 'Asunto',
      message: 'Mensaje',
      type: 'Tipo de Consulta',
      general: 'Consulta General',
      technical: 'Soporte Técnico',
      billing: 'Pregunta de Facturación',
      feature: 'Solicitud de Función',
      bug: 'Reporte de Error',
      sendMessage: 'Enviar Mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado exitosamente!',
      successMessage: 'Gracias por contactarnos. Te responderemos dentro de 24 horas.',
      backToDashboard: 'Volver al Dashboard',
      faq: 'Preguntas Frecuentes',
      faqItems: [
        {
          question: '¿Cómo restablezco mi contraseña?',
          answer: 'Haz clic en "Olvidé mi contraseña" en la página de inicio de sesión y sigue las instrucciones enviadas a tu correo.'
        },
        {
          question: '¿Cómo actualizo a Pro?',
          answer: 'Ve a la página de Precios y haz clic en "Actualizar a Pro". Puedes comenzar con una prueba gratuita de 7 días.'
        },
        {
          question: '¿Puedo exportar mis datos?',
          answer: '¡Sí! Los usuarios Pro pueden exportar sus datos en formato PDF, Excel o JSON desde la página de Exportar.'
        },
        {
          question: '¿Cómo comparto mi cuenta?',
          answer: 'Los usuarios Pro pueden compartir su cuenta con familiares usando la función Compartir Cuenta en la configuración del Perfil.'
        },
        {
          question: '¿Mis datos están seguros?',
          answer: 'Sí, utilizamos medidas de seguridad y encriptación estándar de la industria para proteger tus datos financieros.'
        }
      ],
      emailSupport: 'Soporte por Correo',
      emailText: 'Para asistencia inmediata, también puedes enviarnos un correo directamente:',
      emailAddress: 'support@expensetrackerpro.com',
      responseTime: 'Normalmente respondemos dentro de 24 horas durante días hábiles.'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message (in a real app, this would send to your backend)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <AuthenticatedLayout>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t.success}
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              {t.successMessage}
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
              >
                {t.backToDashboard}
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
            {t.title}
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
              {t.title}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  placeholder={t.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  placeholder={t.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.type}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                >
                  <option value="general">{t.general}</option>
                  <option value="technical">{t.technical}</option>
                  <option value="billing">{t.billing}</option>
                  <option value="feature">{t.feature}</option>
                  <option value="bug">{t.bug}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.subject}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  placeholder={t.subject}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-800"
                  placeholder={t.message}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? t.sending : t.sendMessage}
              </button>
            </form>
          </div>

          {/* FAQ and Contact Info */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                {t.faq}
              </h2>
              <div className="space-y-4">
                {t.faqItems.map((item, index) => (
                  <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                      {item.question}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Support */}
            <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                {t.emailSupport}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {t.emailText}
              </p>
              <a
                href={`mailto:${t.emailAddress}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.emailAddress}
              </a>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">
                {t.responseTime}
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.backToDashboard}
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}