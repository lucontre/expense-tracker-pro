'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      await loadSubscription();
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth, router]);

  const loadSubscription = async () => {
    if (!user) return;

    const { data: subscriptionData } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setSubscription(subscriptionData);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features immediately.')) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Update subscription status if subscription exists
      if (subscription) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            cancel_at_period_end: true,
            status: 'cancelled'
          })
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Always update user's plan to free immediately
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          subscription_plan: 'free'
        })
        .eq('id', user.id);

      if (userUpdateError) {
        throw userUpdateError;
      }

      setSuccess('Subscription cancelled successfully. You no longer have access to Pro features.');
      await loadSubscription();
      
      // Reload the page after a short delay to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while cancelling subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setProcessing(true);
    setError('');

    try {
      // Reactivate subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          cancel_at_period_end: false,
          status: 'active'
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Subscription reactivated successfully!');
      await loadSubscription();
    } catch (err: any) {
      setError(err.message || 'An error occurred while reactivating subscription');
    } finally {
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            No Active Subscription
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            You don't have an active Pro subscription.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === 'active';
  const isCancelled = subscription.cancel_at_period_end;
  const nextBillingDate = new Date(subscription.current_period_end).toLocaleDateString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Subscription Management
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your Pro subscription and billing
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription Details */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Current Plan
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Plan</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Pro Plan
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                }`}>
                  {isActive ? 'Active' : 'Cancelled'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Next Billing</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {nextBillingDate}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  $4.99/month
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Actions
            </h2>
            
            <div className="space-y-4">
              {isActive && !isCancelled && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={processing}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
              
              {isCancelled && (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={processing}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reactivate Subscription'}
                </button>
              )}
              
              <Link
                href="/pricing"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                Change Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Billing History
          </h2>
          
          <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            <p>No billing history available</p>
            <p className="text-sm mt-2">In production, this would show your payment history</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
