import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '../lib/supabase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    error: string;
    success: string;
  };
}

const lightColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#3b82f6',
  error: '#ef4444',
  success: '#10b981',
};

const darkColors = {
  background: '#1a1a1a',
  card: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  primary: '#60a5fa',
  error: '#f87171',
  success: '#34d399',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const supabase = createClient();

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('theme')
          .eq('id', user.id)
          .single();

        if (userData?.theme) {
          setThemeState(userData.theme as Theme);
          await AsyncStorage.setItem('theme', userData.theme);
        } else {
          // Load from AsyncStorage as fallback
          const storedTheme = await AsyncStorage.getItem('theme');
          if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
            setThemeState(storedTheme as Theme);
          }
        }
      } else {
        // Load from AsyncStorage when not authenticated
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme as Theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Load from AsyncStorage as fallback
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setThemeState(storedTheme as Theme);
      }
    }
  };

  const updateTheme = async (newTheme: Theme) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ theme: newTheme })
          .eq('id', user.id);

        if (!error) {
          setThemeState(newTheme);
          await AsyncStorage.setItem('theme', newTheme);
        }
      } else {
        setThemeState(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: updateTheme,
      isDark: theme === 'dark',
      colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

