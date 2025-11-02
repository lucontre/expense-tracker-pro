'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

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

  const handleUpgrade = async () => {
    setProcessing(true);
    setError('');

    try {
      // For now, we'll simulate the upgrade process
      // In production, this would integrate with Stripe
      
      // Update user's subscription plan to 'pro'
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_plan: 'pro' })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Create a subscription record
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: 'pro',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });

      if (subscriptionError) {
        throw subscriptionError;
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?upgraded=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred during upgrade');
      setProcessing(false);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Upgrade to Pro
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Unlock unlimited features and advanced analytics
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              $9.99
            </div>
            <div className="text-zinc-600 dark:text-zinc-400">per month</div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Pro Features:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Unlimited transactions</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Unlimited categories</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Export reports (PDF/Excel)</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Custom categories with icons</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-700 dark:text-zinc-300">Priority support</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={processing}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Upgrade to Pro - $9.99/month'}
            </button>
            
            <div className="text-center">
              <Link
                href="/pricing"
                className="text-sm text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ← Back to pricing
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              * This is a demo upgrade. In production, this would integrate with Stripe for secure payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
