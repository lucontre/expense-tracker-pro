'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Logo } from '@/components/Logo';

export function Navigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { /* theme, setTheme */ } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const translations = {
    en: {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      budgets: 'Budgets',
      reports: 'Reports',
      savings: 'Savings Goals',
      notifications: 'Notifications',
      sharing: 'Account Sharing',
      profile: 'Profile',
      contact: 'Contact Us',
      export: 'Export Data',
      pricing: 'Pricing',
      logout: 'Logout',
      menu: 'Menu',
      close: 'Close',
      more: 'More',
    },
    es: {
      dashboard: 'Panel',
      transactions: 'Transacciones',
      budgets: 'Presupuestos',
      reports: 'Reportes',
      savings: 'Metas de Ahorro',
      notifications: 'Notificaciones',
      sharing: 'Compartir Cuenta',
      profile: 'Perfil',
      contact: 'Contáctanos',
      export: 'Exportar Datos',
      pricing: 'Precios',
      logout: 'Cerrar Sesión',
      menu: 'Menú',
      close: 'Cerrar',
      more: 'Más',
    },
  };

  const t = translations[language];

  // Solo los elementos más importantes en la navegación principal
  const navigationItems = [
    { href: '/dashboard', label: t.dashboard, icon: '📊' },
    { href: '/transactions', label: t.transactions, icon: '💰' },
    { href: '/budgets', label: t.budgets, icon: '📈' },
    { href: '/reports', label: t.reports, icon: '📋' },
  ];

  // Elementos secundarios que van en un menú desplegable
  // Notificaciones y Account Sharing ocultos en web (solo disponibles en mobile)
  const secondaryItems = [
    { href: '/savings-goals', label: t.savings, icon: '🎯' },
    // { href: '/notifications', label: t.notifications, icon: '🔔' }, // Oculto en web
    // { href: '/account-sharing', label: t.sharing, icon: '👥' }, // Oculto en web
    { href: '/export', label: t.export, icon: '📊' },
    { href: '/contact', label: t.contact, icon: '📧' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    // Implement logout logic here
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Logo size="md" variant="full" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* More Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="text-base">⋯</span>
                <span>{t.more}</span>
              </button>
              
              {isMoreMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  {secondaryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-base">👤</span>
                      <span>{t.profile}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/pricing"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t.pricing}
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t.logout}
            </button>
          </div>

          {/* Tablet Navigation - Show more items */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {navigationItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <Link
              href="/pricing"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              {t.pricing}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Main navigation items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Secondary items */}
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span>{t.profile}</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-lg">📧</span>
                  <span>{t.contact}</span>
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors mx-3 mt-2"
                >
                  <span className="text-lg">💎</span>
                  <span>{t.pricing}</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-lg">🚪</span>
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
