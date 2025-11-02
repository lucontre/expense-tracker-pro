'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Logo } from '@/components/Logo';
import { TermsModal } from '@/components/TermsModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  // const [pendingSignUp, setPendingSignUp] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  // const router = useRouter();
  
  // Get the singleton client
  const supabase = createClient();
  const { language } = useLanguage();

  // Translations
  const translations = {
    en: {
      title: 'Expense Tracker Pro',
      subtitle: 'Sign in to your account or create a new one',
      email: 'Email address',
      password: 'Password',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      loading: 'Loading...',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot your password?',
      resetPassword: 'Reset Password',
      sendResetLink: 'Send reset link',
      resetEmailPlaceholder: 'Enter your email to receive a reset link',
      resetSent: 'We sent you an email with a password reset link.',
    },
    es: {
      title: 'Expense Tracker Pro',
      subtitle: 'Inicia sesión en tu cuenta o crea una nueva',
      email: 'Dirección de correo electrónico',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      loading: 'Cargando...',
      emailPlaceholder: 'Ingresa tu correo electrónico',
      passwordPlaceholder: 'Ingresa tu contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer Contraseña',
      sendResetLink: 'Enviar enlace de restablecimiento',
      resetEmailPlaceholder: 'Ingresa tu correo para recibir el enlace',
      resetSent: 'Te enviamos un correo con el enlace para restablecer tu contraseña.',
    }
  };

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      setLoading(false);
      // Force navigation to dashboard
      window.location.href = '/dashboard';
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Show terms modal first
    // setPendingSignUp(true);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setShowTermsModal(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        // setPendingSignUp(false);
        return;
      }

      if (data.user) {
        // Update user record to mark terms as accepted
        const { error: updateError } = await supabase
          .from('users')
          .update({
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating terms acceptance:', updateError);
          // Continue anyway, don't block the signup
        }

        setSuccess('Account created successfully! Signing you in...');
        
        // Wait a moment before signing in
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sign in after creating account
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          setError(`Account created but sign in failed: ${signInError.message}`);
          setSuccess('');
          setLoading(false);
        } else {
          setLoading(false);
          // Force navigation to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setError('Sign up completed but no user was returned');
        setLoading(false);
      }
    } catch (err) {
      void err; // intentionally ignored
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    // setPendingSignUp(false);
    // setPendingSignUp(false);
    setError('You must accept the terms and conditions to create an account.');
  };

  const openResetModal = () => {
    setResetEmail(email || '');
    setShowResetModal(true);
    setError('');
    setSuccess('');
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    setSuccess('');
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(t.resetSent);
        setShowResetModal(false);
      }
    } catch (err) {
      void err; // intentionally ignored
      setError('Could not send reset email. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div>
          <div className="flex justify-center mb-6">
            <Logo size="lg" variant="full" />
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-center">
            {t.subtitle}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400"
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400"
              placeholder={t.passwordPlaceholder}
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={openResetModal}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {t.forgotPassword}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {loading ? t.loading : t.signIn}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              {t.signUp}
            </button>
          </div>
        </form>
      </div>
      
      {/* Terms and Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-50">
              {t.resetPassword}
            </h2>
            <form onSubmit={handleSendReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-400"
                  placeholder={t.resetEmailPlaceholder}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {t.sendResetLink}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
