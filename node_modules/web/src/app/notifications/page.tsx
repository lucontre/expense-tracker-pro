'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/Loading';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Notification } from '@expense-tracker-pro/shared';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { language } = useLanguage();

  // Redirigir al dashboard ya que las notificaciones no están disponibles en web
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  const translations = {
    en: {
      title: 'Notifications',
      subtitle: 'Stay updated with your financial activity',
      backToDashboard: 'Back to Dashboard',
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications yet',
      budgetExceeded: 'Budget Exceeded',
      budgetWarning: 'Budget Warning',
      goalAchieved: 'Goal Achieved',
      goalMilestone: 'Goal Milestone',
      trialEnding: 'Trial Ending',
      read: 'Read',
      unread: 'Unread',
      delete: 'Delete',
      deleteAll: 'Delete All',
    },
    es: {
      title: 'Notificaciones',
      subtitle: 'Mantente actualizado con tu actividad financiera',
      backToDashboard: 'Volver al Dashboard',
      markAllRead: 'Marcar Todo como Leído',
      noNotifications: 'Aún no hay notificaciones',
      budgetExceeded: 'Presupuesto Excedido',
      budgetWarning: 'Advertencia de Presupuesto',
      goalAchieved: 'Objetivo Logrado',
      goalMilestone: 'Hito del Objetivo',
      trialEnding: 'Prueba Terminando',
      read: 'Leído',
      unread: 'No Leído',
      delete: 'Eliminar',
      deleteAll: 'Eliminar Todo',
    }
  };

  const t = translations[language];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      await loadNotifications();
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth, router]);

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notificationsData) {
      setNotifications(notificationsData);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      await loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      await loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      await loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      await loadNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to delete all notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return (
          <div className="rounded-lg bg-rose-100 p-2 dark:bg-rose-900/30">
            <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'budget_warning':
        return (
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'goal_achieved':
        return (
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'goal_milestone':
        return (
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'trial_ending':
        return (
          <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/30">
            <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900/30">
            <svg className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586A2 2 0 018.828 4h8.344a2 2 0 011.414.586L21.172 7H4.828z" />
            </svg>
          </div>
        );
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return t.budgetExceeded;
      case 'budget_warning':
        return t.budgetWarning;
      case 'goal_achieved':
        return t.goalAchieved;
      case 'goal_milestone':
        return t.goalMilestone;
      case 'trial_ending':
        return t.trialEnding;
      default:
        return 'Notification';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" text="Loading notifications..." fullScreen />
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {t.title}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t.subtitle}
              </p>
              {unreadCount > 0 && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {t.markAllRead}
                  </button>
                )}
                <button
                  onClick={deleteAllNotifications}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700 transition-colors"
                >
                  {t.deleteAll}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586-2.586A2 2 0 018.828 4h8.344a2 2 0 011.414.586L21.172 7H4.828z" />
              </svg>
              <p className="text-lg font-medium">{t.noNotifications}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl bg-white p-6 shadow-sm border transition-all hover:shadow-md dark:bg-slate-800 ${
                  notification.isRead 
                    ? 'border-slate-200 dark:border-slate-700' 
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          notification.isRead
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        }`}>
                          {notification.isRead ? t.read : t.unread}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                      
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
