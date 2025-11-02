'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeInitializer() {
  // This component just needs to call useTheme to trigger the effect
  useTheme();
  return null;
}

