'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { User } from '@expense-tracker-pro/shared';
import Link from 'next/link';

interface AccountSharing {
  id: string;
  primary_user_id: string;
  shared_user_id: string;
  sharing_code: string;
  permissions: 'read_only' | 'read_write';
  status: 'active' | 'pending' | 'revoked';
  created_at: string;
}

interface AccountSharingManagerProps {
  user: User;
  userPlan?: 'free' | 'pro';
}

export function AccountSharingManager({ user, userPlan = 'free' }: AccountSharingManagerProps) {
  const [sharingRelationships, setSharingRelationships] = useState<AccountSharing[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [joiningCode, setJoiningCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const supabase = createClient();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Shared Accounts',
      subtitle: 'Share your account with your partner or family members',
      generateCode: 'Generate Sharing Code',
      joinCode: 'Join with Code',
      sharingCode: 'Sharing Code',
      enterCode: 'Enter sharing code',
      join: 'Join Account',
      revoke: 'Revoke Access',
      permissions: 'Permissions',
      readOnly: 'Read Only',
      readWrite: 'Read & Write',
      status: 'Status',
      active: 'Active',
      pending: 'Pending',
      revoked: 'Revoked',
      noSharing: 'No shared accounts yet',
      generateNewCode: 'Generate New Code',
      codeGenerated: 'Sharing code generated!',
      codeJoined: 'Successfully joined account!',
      accessRevoked: 'Access revoked successfully!',
      errorGenerating: 'Error generating code',
      errorJoining: 'Error joining account',
      errorRevoking: 'Error revoking access',
      invalidCode: 'Invalid sharing code',
      alreadyShared: 'Account is already shared with this user',
      cannotShareSelf: 'Cannot share account with yourself',
      proFeature: 'Shared Accounts',
      proDescription: 'This is a Pro feature. Upgrade to share your account with family members.',
      upgradeToPro: 'Upgrade to Pro',
      proOnly: 'Pro Feature',
    },
    es: {
      title: 'Cuentas Compartidas',
      subtitle: 'Comparte tu cuenta con tu pareja o familiares',
      generateCode: 'Generar Código de Compartir',
      joinCode: 'Unirse con Código',
      sharingCode: 'Código de Compartir',
      enterCode: 'Ingresa el código de compartir',
      join: 'Unirse a Cuenta',
      revoke: 'Revocar Acceso',
      permissions: 'Permisos',
      readOnly: 'Solo Lectura',
      readWrite: 'Lectura y Escritura',
      status: 'Estado',
      active: 'Activo',
      pending: 'Pendiente',
      revoked: 'Revocado',
      noSharing: 'Aún no hay cuentas compartidas',
      generateNewCode: 'Generar Nuevo Código',
      codeGenerated: '¡Código de compartir generado!',
      codeJoined: '¡Te uniste exitosamente a la cuenta!',
      accessRevoked: '¡Acceso revocado exitosamente!',
      errorGenerating: 'Error generando código',
      errorJoining: 'Error uniéndose a la cuenta',
      errorRevoking: 'Error revocando acceso',
      invalidCode: 'Código de compartir inválido',
      alreadyShared: 'La cuenta ya está compartida con este usuario',
      cannotShareSelf: 'No puedes compartir la cuenta contigo mismo',
      proFeature: 'Cuentas Compartidas',
      proDescription: 'Esta es una función Pro. Actualiza para compartir tu cuenta con familiares.',
      upgradeToPro: 'Actualizar a Pro',
      proOnly: 'Función Pro',
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadSharingRelationships();
  }, []);

  const loadSharingRelationships = async () => {
    try {
      // First, check if the table exists by trying a simple query
      // const { data, error } = await supabase
      const { error } = await supabase
        .from('account_sharing')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error loading sharing relationships:', error);
        
        // Check if it's a table not found error
        if (error.message.includes('relation "account_sharing" does not exist') || 
            error.message.includes('does not exist')) {
          console.log('Account sharing table not created yet. Please run the migration.');
          setSharingRelationships([]);
          setLoading(false);
          return;
        }
        
        setError(`Error loading shared accounts: ${error.message}`);
        setLoading(false);
        return;
      }

      // If table exists, load the full data
      const { data: fullData, error: fullError } = await supabase
        .from('account_sharing')
        .select('*')
        .or(`primary_user_id.eq.${user.id},shared_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fullError) {
        console.error('Error loading full sharing relationships:', fullError);
        setError(`Error loading shared accounts: ${fullError.message}`);
        return;
      }

      setSharingRelationships(fullData || []);
    } catch (_err: any) {
      console.error('Error in loadSharingRelationships:', _err);
      setError('Failed to load shared accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSharingCode = async () => {
    setGeneratingCode(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.rpc('generate_sharing_code');

      if (error) {
        setError(t.errorGenerating);
        return;
      }

      // Create sharing relationship with generated code
      const { error: insertError } = await supabase
        .from('account_sharing')
        .insert({
          primary_user_id: user.id,
          sharing_code: data,
          permissions: 'read_write',
          status: 'pending'
        });

      if (insertError) {
        setError(t.errorGenerating);
        return;
      }

      setSuccess(`${t.codeGenerated} ${data}`);
      await loadSharingRelationships();
    } catch (_err) {
      void _err; // intentionally ignored in this context
      setError(t.errorGenerating);
    } finally {
      setGeneratingCode(false);
    }
  };

  const joinWithCode = async () => {
    if (!joiningCode.trim()) {
      setError('Please enter a sharing code');
      return;
    }

    setJoining(true);
    setError('');
    setSuccess('');

    try {
      // Find the sharing relationship by code
      const { data: sharingData, error: findError } = await supabase
        .from('account_sharing')
        .select('*')
        .eq('sharing_code', joiningCode.trim().toUpperCase())
        .eq('status', 'pending')
        .single();

      if (findError || !sharingData) {
        setError(t.invalidCode);
        return;
      }

      // Check if user is trying to share with themselves
      if (sharingData.primary_user_id === user.id) {
        setError(t.cannotShareSelf);
        return;
      }

      // Update the sharing relationship
      const { error: updateError } = await supabase
        .from('account_sharing')
        .update({
          shared_user_id: user.id,
          status: 'active'
        })
        .eq('id', sharingData.id);

      if (updateError) {
        setError(t.errorJoining);
        return;
      }

      setSuccess(t.codeJoined);
      setJoiningCode('');
      await loadSharingRelationships();
    } catch (_err) {
      void _err; // intentionally ignored in this context
      setError(t.errorJoining);
    } finally {
      setJoining(false);
    }
  };

  const revokeAccess = async (sharingId: string) => {
    try {
      const { error } = await supabase
        .from('account_sharing')
        .update({ status: 'revoked' })
        .eq('id', sharingId);

      if (error) {
        setError(t.errorRevoking);
        return;
      }

      setSuccess(t.accessRevoked);
      await loadSharingRelationships();
    } catch (err) {
      void err; // intentionally ignored in this context
      setError(t.errorRevoking);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center text-slate-600 dark:text-slate-400">
          Loading shared accounts...
        </div>
      </div>
    );
  }

  // Show Pro upgrade prompt for free users
  if (userPlan === 'free') {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t.proFeature}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t.proDescription}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                {t.proOnly}
              </span>
            </div>
            
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              {t.upgradeToPro}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
          {t.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200">
          {success}
        </div>
      )}

      {/* Generate Code Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-3">
          {t.generateCode}
        </h3>
        <button
          onClick={generateSharingCode}
          disabled={generatingCode}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generatingCode ? 'Generating...' : t.generateNewCode}
        </button>
      </div>

      {/* Join with Code Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-3">
          {t.joinCode}
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={joiningCode}
            onChange={(e) => setJoiningCode(e.target.value.toUpperCase())}
            placeholder={t.enterCode}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
            maxLength={6}
          />
          <button
            onClick={joinWithCode}
            disabled={joining || !joiningCode.trim()}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {joining ? 'Joining...' : t.join}
          </button>
        </div>
      </div>

      {/* Sharing Relationships */}
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-3">
          {t.title}
        </h3>
        
        {sharingRelationships.length === 0 ? (
          <div className="text-center text-slate-600 dark:text-slate-400 py-8">
            {t.noSharing}
          </div>
        ) : (
          <div className="space-y-3">
            {sharingRelationships.map((relationship) => (
              <div
                key={relationship.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {relationship.shared_user_id === user.id ? 'You' : 
                       relationship.shared_user_id ? `User ${relationship.shared_user_id.slice(0, 8)}` : 
                       'Pending User'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.permissions}: {relationship.permissions === 'read_only' ? t.readOnly : t.readWrite}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.status}: {relationship.status}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Code: {relationship.sharing_code}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Created: {new Date(relationship.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {relationship.status === 'active' && relationship.primary_user_id === user.id && (
                    <button
                      onClick={() => revokeAccess(relationship.id)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                    >
                      {t.revoke}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
