import React from 'react';
import { User } from '@expense-tracker-pro/shared';

interface AvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export function Avatar({ user, size = 'md', className = '', showBorder = true }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getBackgroundColor = (name?: string, email?: string) => {
    const text = name || email || 'user';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (user?.avatar_url) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <img
          src={user.avatar_url}
          alt={`${user.fullName || user.email}'s avatar`}
          className={`${sizeClasses[size]} rounded-full object-cover ${
            showBorder ? 'border-2 border-slate-200 dark:border-slate-700' : ''
          }`}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor(user?.fullName, user?.email)} rounded-full flex items-center justify-center text-white font-semibold ${
        showBorder ? 'border-2 border-slate-200 dark:border-slate-700' : ''
      } ${className}`}
    >
      {getInitials(user?.fullName, user?.email)}
    </div>
  );
}

// Avatar with upload functionality
interface AvatarUploadProps extends AvatarProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
}

export function AvatarUpload({ user, size = 'md', className = '', showBorder = true, onUpload, uploading = false }: AvatarUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      onUpload(file);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar user={user} size={size} className={className} showBorder={showBorder} />
      
      {/* Upload overlay */}
      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        {uploading ? (
          <div className="text-white">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>
    </div>
  );
}
