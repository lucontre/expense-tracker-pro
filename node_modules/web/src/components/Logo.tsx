import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'full' | 'icon' | 'text';
}

export function Logo({ size = 'md', className = '', variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // const iconSizes = {
  //   sm: 24,
  //   md: 32,
  //   lg: 48,
  //   xl: 64,
  // };

  // const iconSize = iconSizes[size];

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
          
          {/* Chart Bars */}
          <rect x="25" y="35" width="8" height="25" rx="2" fill="#10b981" />
          <rect x="37" y="30" width="8" height="30" rx="2" fill="#0ea5e9" />
          <rect x="49" y="25" width="8" height="35" rx="2" fill="#8b5cf6" />
          <rect x="61" y="40" width="8" height="20" rx="2" fill="#f59e0b" />
          
          {/* Dollar Sign */}
          <path
            d="M50 20 L50 80 M42 30 L58 30 M42 70 L58 70"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Expense Tracker Pro
        </span>
      </div>
    );
  }

  // Full logo (icon + text) - Simplified and cleaner
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={sizeClasses[size]}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#3b82f6"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
          
          {/* Chart Bars */}
          <rect x="25" y="35" width="8" height="25" rx="2" fill="#10b981" />
          <rect x="37" y="30" width="8" height="30" rx="2" fill="#0ea5e9" />
          <rect x="49" y="25" width="8" height="35" rx="2" fill="#8b5cf6" />
          <rect x="61" y="40" width="8" height="20" rx="2" fill="#f59e0b" />
          
          {/* Dollar Sign */}
          <path
            d="M50 20 L50 80 M42 30 L58 30 M42 70 L58 70"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className={`font-bold text-slate-900 dark:text-slate-50 ${textSizeClasses[size]}`}>
        Expense Tracker Pro
      </span>
    </div>
  );
}

// Alternative logo with different design
export function LogoAlt({ size = 'md', className = '', variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="20"
            fill="url(#gradientBg)"
          />
          
          {/* Wallet/Coin Icon */}
          <circle cx="50" cy="40" r="15" fill="white" />
          <circle cx="50" cy="40" r="10" fill="url(#gradientCoin)" />
          
          {/* Chart Line */}
          <path
            d="M25 65 Q35 55 45 60 T65 55 T75 50"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Data Points */}
          <circle cx="25" cy="65" r="3" fill="white" />
          <circle cx="45" cy="60" r="3" fill="white" />
          <circle cx="65" cy="55" r="3" fill="white" />
          <circle cx="75" cy="50" r="3" fill="white" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="gradientCoin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Expense Tracker Pro
        </span>
      </div>
    );
  }

  // Full logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={sizeClasses[size]}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="20"
            fill="url(#gradientBg)"
          />
          
          {/* Wallet/Coin Icon */}
          <circle cx="50" cy="40" r="15" fill="white" />
          <circle cx="50" cy="40" r="10" fill="url(#gradientCoin)" />
          
          {/* Chart Line */}
          <path
            d="M25 65 Q35 55 45 60 T65 55 T75 50"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Data Points */}
          <circle cx="25" cy="65" r="3" fill="white" />
          <circle cx="45" cy="60" r="3" fill="white" />
          <circle cx="65" cy="55" r="3" fill="white" />
          <circle cx="75" cy="50" r="3" fill="white" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <linearGradient id="gradientCoin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
        Expense Tracker Pro
      </span>
    </div>
  );
}
