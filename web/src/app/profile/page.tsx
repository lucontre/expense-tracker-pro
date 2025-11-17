'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useTheme } from '@/hooks/useTheme';
import { AvatarUpload } from '@/components/Avatar';
import { DatabaseSetup } from '@/components/DatabaseSetup';
import { AccountSharingManager } from '@/components/AccountSharingManager';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Translations, currency, and theme
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency, getAllCurrencies } = useCurrency();
  const { theme, setTheme: updateTheme } = useTheme();
  const [fullName, setFullName] = useState<string>('');

  const handleLanguageChange = async (newLanguage: 'en' | 'es') => {
    try {
      await setLanguage(newLanguage);
      console.log('Language changed to:', newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
      // Show error message to user
      setError('Error changing language. Please try again.');
    }
  };

  const translations = {
    en: {
      title: 'Profile Settings',
      subtitle: 'Manage your account preferences',
      personalInfo: 'Personal Information',
      email: 'Email',
      fullName: 'Full Name',
      preferences: 'Preferences',
      profilePhoto: 'Profile Photo',
      uploadPhoto: 'Upload Photo',
      removePhoto: 'Remove Photo',
      language: 'Language',
      theme: 'Theme',
      currency: 'Currency',
      light: 'Light',
      dark: 'Dark',
      english: 'English',
      spanish: 'Spanish',
      subscription: 'Subscription',
      currentPlan: 'Current Plan',
      trialDaysLeft: 'Trial Days Left',
      startTrial: 'Start 7-Day Free Trial',
      cancelSubscription: 'Cancel Subscription',
      manageSubscription: 'Manage Subscription',
      upgradeToPro: 'Upgrade to Pro',
      saveChanges: 'Save Changes',
      backToDashboard: 'Back to Dashboard',
      logout: 'Logout',
      success: 'Settings saved successfully!',
      error: 'Error saving settings',
      trialStarted: '7-day trial started!',
      trialEnded: 'Your trial has ended',
      cancelConfirm: 'Are you sure you want to cancel your subscription?',
      startTrialConfirm: 'Start your 7-day free trial of Pro features?',
    },
    es: {
      title: 'Configuración de Perfil',
      subtitle: 'Gestiona las preferencias de tu cuenta',
      personalInfo: 'Información Personal',
      email: 'Correo Electrónico',
      fullName: 'Nombre Completo',
      preferences: 'Preferencias',
      profilePhoto: 'Foto de Perfil',
      uploadPhoto: 'Subir Foto',
      removePhoto: 'Eliminar Foto',
      language: 'Idioma',
      theme: 'Tema',
      currency: 'Moneda',
      light: 'Claro',
      dark: 'Oscuro',
      english: 'Inglés',
      spanish: 'Español',
      subscription: 'Suscripción',
      currentPlan: 'Plan Actual',
      trialDaysLeft: 'Días de Prueba Restantes',
      startTrial: 'Iniciar Prueba Gratuita de 7 Días',
      cancelSubscription: 'Cancelar Suscripción',
      manageSubscription: 'Gestionar Suscripción',
      upgradeToPro: 'Actualizar a Pro',
      saveChanges: 'Guardar Cambios',
      backToDashboard: 'Volver al Dashboard',
      logout: 'Cerrar Sesión',
      success: '¡Configuración guardada exitosamente!',
      error: 'Error al guardar configuración',
      trialStarted: '¡Prueba de 7 días iniciada!',
      trialEnded: 'Tu prueba ha terminado',
      cancelConfirm: '¿Estás seguro de que quieres cancelar tu suscripción?',
      startTrialConfirm: '¿Iniciar tu prueba gratuita de 7 días de funciones Pro?',
    }
  };

  const t = translations[language];

  function DeleteAccountForm({ userEmail }: { userEmail: string }) {
    const [confirmEmail, setConfirmEmail] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const supabaseClient = createClient();

    const handleDelete = async (e: React.FormEvent) => {
      e.preventDefault();
      setDeleteError('');
      setDeleteSuccess('');
      if (confirmEmail.trim().toLowerCase() !== (userEmail || '').toLowerCase()) {
        setDeleteError(language === 'es' ? 'El correo no coincide.' : 'Email does not match.');
        return;
      }
      if (!confirm('This will delete your account permanently. Continue?')) return;
      setDeleting(true);
      try {
        const res = await fetch('/api/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmEmail }),
        });
        const json = await res.json();
        if (!res.ok) {
          setDeleteError(json.error || 'Failed to delete account');
        } else {
          setDeleteSuccess(language === 'es' ? 'Cuenta eliminada. Cerrando sesión…' : 'Account deleted. Signing out…');
          await supabaseClient.auth.signOut();
          setTimeout(() => { window.location.href = '/login'; }, 1200);
        }
      } catch (err: any) {
        setDeleteError(err?.message || 'Failed to delete account');
      } finally {
        setDeleting(false);
      }
    };

    return (
      <form onSubmit={handleDelete} className="space-y-3">
        {deleteError && (
          <div className="rounded-lg bg-white/60 border border-rose-300 p-2 text-rose-800 dark:bg-rose-900/10 dark:text-rose-200">
            {deleteError}
          </div>
        )}
        {deleteSuccess && (
          <div className="rounded-lg bg-slate-900 border border-slate-700 p-2 text-white dark:bg-emerald-900/20 dark:text-emerald-200">
            {deleteSuccess}
          </div>
        )}
        <input
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={language === 'es' ? 'Confirma tu correo' : 'Confirm your email'}
          className="block w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 dark:border-rose-700 dark:bg-slate-800 dark:text-slate-50"
        />
        <button
          type="submit"
          disabled={deleting}
          className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {deleting ? (language === 'es' ? 'Eliminando…' : 'Deleting…') : (language === 'es' ? 'Eliminar Cuenta' : 'Delete Account')}
        </button>
      </form>
    );
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth, router]);

  useEffect(() => {
    if (user && !loading) {
      console.log('useEffect triggered - loading user data');
      loadUserData();
    }
  }, [user?.id]); // Solo depende del ID del usuario, no del objeto completo

  // Reload user data when page becomes visible or gets focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !loading) {
        console.log('Page became visible, reloading user data...');
        loadUserData();
      }
    };

    const handleFocus = () => {
      if (user && !loading) {
        console.log('Window focused, reloading user data...');
        loadUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loading]);

  const loadUserData = async () => {
    if (!user) return;

    console.log('loadUserData called for user:', user.id);
    console.log('Current fullName state before load:', fullName);

    try {
      // Load user preferences
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
        // If columns don't exist, use defaults
        setLanguage('en');
        return;
      }

      if (userData) {
        setLanguage(userData.language || 'en');
        
        // Update user state with loaded data including avatar_url
        setUser(prev => prev ? { 
          ...prev, 
          fullName: userData.full_name || prev.fullName,
          avatar_url: userData.avatar_url || prev.avatar_url,
          language: userData.language || prev.language,
          theme: userData.theme || prev.theme,
          currency: userData.currency || prev.currency,
          subscription_plan: userData.subscription_plan || prev.subscription_plan
        } : null);
        
        // Update separate fullName state
        console.log('Setting fullName from database:', userData.full_name);
        setFullName(userData.full_name || '');
        console.log('fullName state set to:', userData.full_name || '');
        
        // Load subscription if Pro
        if (userData.subscription_plan === 'pro') {
          const { data: subscriptionData } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          setSubscription(subscriptionData);
        }
      }
    } catch (err) {
      console.error('Error in loadUserData:', err);
      // Use defaults if there's any error
      setLanguage('en');
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('Saving settings for user:', user.id);
      console.log('Data to save:', {
        full_name: fullName,
        language,
        theme,
        currency,
      });

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          language,
          theme,
          currency,
        })
        .eq('id', user.id);

      console.log('Update result:', { updateError });

      if (updateError) {
        console.error('Update error:', updateError);
        // If columns don't exist, show helpful message
        if (updateError.message.includes('language') || updateError.message.includes('theme')) {
          setError('Please run the database migration first. The language and theme columns need to be added to the users table.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      console.log('Settings saved successfully');
      setSuccess(t.success);
      
      // Update user state with new fullName (but don't trigger loadUserData)
      setUser(prev => prev ? { ...prev, fullName: fullName } : null);
      
      // Apply theme immediately
      document.documentElement.classList.toggle('dark', theme === 'dark');
      
      // Store theme in localStorage for persistence
      localStorage.setItem('theme', theme);
      localStorage.setItem('language', language);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setError(err.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setError('');

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('new row violates row-level security policy')) {
          setError('Please run the database migration first. The avatar storage bucket needs to be configured.');
          setShowDatabaseSetup(true);
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        if (updateError.message.includes('column "avatar_url" does not exist')) {
          setError('Please run the database migration first. The avatar_url column needs to be added to the users table.');
          setShowDatabaseSetup(true);
        } else {
          setError(`Update failed: ${updateError.message}`);
        }
        return;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setSuccess('Profile photo updated successfully!');
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !user.avatar_url) return;

    setSaving(true);
    setError('');

    try {
      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, avatar_url: undefined } : null);
      setSuccess('Profile photo removed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to remove photo');
    } finally {
      setSaving(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) return;

    if (!confirm(t.startTrialConfirm)) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      // Update user to Pro with trial
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_plan: 'pro',
          trial_started_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Create trial subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: 'pro',
          status: 'trial',
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndDate.toISOString(),
        });

      if (subscriptionError) throw subscriptionError;

      setSuccess(t.trialStarted);
      await loadUserData();
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    if (!confirm(t.cancelConfirm)) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update subscription to cancel at period end
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          cancel_at_period_end: true,
          status: 'cancelled'
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('Subscription cancelled successfully');
      await loadUserData();
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getTrialDaysLeft = () => {
    if (!user?.trial_started_at) return 0;
    
    const trialStart = new Date(user.trial_started_at);
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const isTrialActive = () => {
    return user?.subscription_plan === 'pro' && subscription?.status === 'trial';
  };

  const isTrialExpired = () => {
    return isTrialActive() && getTrialDaysLeft() === 0;
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t.backToDashboard}
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div 
            className="mb-6 rounded-xl border border-slate-700 p-4 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200"
            style={{ backgroundColor: '#1E1E21', color: '#ffffff' }}
          >
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Photo */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {t.profilePhoto}
              </h2>
              
              <div className="flex flex-col items-center gap-4">
                <AvatarUpload
                  user={user}
                  size="xl"
                  onUpload={handleUploadPhoto}
                  uploading={uploading}
                />
                
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {user?.avatar_url ? 'Click on your photo to change it' : 'Upload a profile photo to personalize your account'}
                  </p>
                  
                  {user?.avatar_url && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={saving}
                      className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium disabled:opacity-50"
                    >
                      {t.removePhoto}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {t.personalInfo}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      console.log('Input onChange triggered:', e.target.value);
                      console.log('Current fullName state:', fullName);
                      setFullName(e.target.value);
                      console.log('fullName state updated to:', e.target.value);
                    }}
                    onFocus={() => console.log('Input focused, current value:', fullName)}
                    onBlur={() => console.log('Input blurred, current value:', fullName)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                {t.preferences}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.language}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'es')}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  >
                    <option value="en">{t.english}</option>
                    <option value="es">{t.spanish}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.theme}
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => updateTheme(e.target.value as 'light' | 'dark')}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  >
                    <option value="light">{t.light}</option>
                    <option value="dark">{t.dark}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t.currency}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'MXN' | 'GTQ' | 'EUR')}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                  >
                    {getAllCurrencies().map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {language === 'es' ? curr.nameEs : curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Sharing */}
          <div className="lg:col-span-2 space-y-6">
            <AccountSharingManager user={user as User} userPlan={user?.subscription_plan || 'free'} />
            
            {/* Subscription */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
              {t.subscription}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t.currentPlan}</span>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.subscription_plan === 'pro'
                      ? 'dark:bg-blue-900/20 dark:text-blue-200'
                      : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                  style={user?.subscription_plan === 'pro' ? { backgroundColor: '#1E1E21', color: '#ffffff' } : undefined}
                >
                  {user?.subscription_plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </span>
              </div>

              {isTrialActive() && !isTrialExpired() && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t.trialDaysLeft}</span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    {getTrialDaysLeft()} days
                  </span>
                </div>
              )}

              {isTrialExpired() && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {t.trialEnded}
                </div>
              )}

              <div className="flex gap-4">
                {user?.subscription_plan === 'free' && (
                  <button
                    onClick={handleStartTrial}
                    disabled={saving}
                    className="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--success)' }}
                  >
                    {t.startTrial}
                  </button>
                )}

                {user?.subscription_plan === 'pro' && subscription?.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={saving}
                    className="rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--destructive)' }}
                  >
                    {t.cancelSubscription}
                  </button>
                )}

                {user?.subscription_plan === 'pro' && (
                  <Link
                    href="/settings/subscription"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700"
                  >
                    {t.manageSubscription}
                  </Link>
                )}

                {user?.subscription_plan === 'free' && (
                  <Link
                    href="/pricing"
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    {t.upgradeToPro}
                  </Link>
                )}
              </div>
            </div>
            </div>

            {/* Danger Zone - Delete Account */}
            <div className="rounded-xl bg-rose-50 p-6 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
              <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-200 mb-2">
                {language === 'es' ? 'Eliminar Cuenta' : 'Delete Account'}
              </h3>
              <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">
                {language === 'es'
                  ? 'Esta acción es permanente y eliminará tus datos y acceso. Escribe tu correo para confirmar y presiona "Eliminar Cuenta".'
                  : 'This action is permanent and will remove your data and access. Type your email to confirm and press "Delete Account".'}
              </p>
              <DeleteAccountForm userEmail={user?.email || ''} />
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 lg:col-span-3">
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="rounded-lg px-6 py-2 font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {saving ? 'Saving...' : t.saveChanges}
              </button>
              
              <button
                onClick={handleLogout}
                className="rounded-lg px-6 py-2 font-medium text-white"
                style={{ backgroundColor: 'var(--destructive)' }}
              >
                {t.logout}
              </button>
            </div>
            
            {/* Terms and Conditions Link */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                By using this service, you agree to our{' '}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                >
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Database Setup Modal */}
      {showDatabaseSetup && (
        <DatabaseSetup onClose={() => setShowDatabaseSetup(false)} />
      )}
    </AuthenticatedLayout>
  );
}
