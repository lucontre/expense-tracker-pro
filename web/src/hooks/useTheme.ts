'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useLanguage() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('language')
            .eq('id', user.id)
            .single();

          if (userData?.language) {
            setLanguage(userData.language);
          }
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadLanguage();
      } else if (event === 'SIGNED_OUT') {
        setLanguage('en');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return { language, setLanguage, loading };
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
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
            setTheme(userData.theme);
            applyTheme(userData.theme);
          } else {
            // Default to light theme
            applyTheme('light');
          }
        } else {
          // Load from localStorage if not authenticated
          const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light theme
        applyTheme('light');
      } finally {
        setLoading(false);
      }
    };

    loadTheme();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadTheme();
      } else if (event === 'SIGNED_OUT') {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const htmlElement = document.documentElement;
    
    // Remove existing theme classes
    htmlElement.classList.remove('dark', 'light-theme', 'dark-theme');
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark', 'dark-theme');
    } else {
      htmlElement.classList.add('light-theme');
    }
    
    // Force update the CSS variables
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#1E1E21');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#1E1E21');
      root.style.setProperty('--primary', '#1E5F74');
      root.style.setProperty('--secondary', '#55CCA1');
      root.style.setProperty('--muted', '#f9fafb');
      root.style.setProperty('--muted-foreground', '#4a5568');
      root.style.setProperty('--accent', '#B2B5E0');
      root.style.setProperty('--success', '#2EB873');
      root.style.setProperty('--destructive', '#E57373');
      root.style.setProperty('--border', '#e5e7eb');
    } else {
      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--foreground', '#f1f5f9');
      root.style.setProperty('--card', '#1e293b');
      root.style.setProperty('--card-foreground', '#f1f5f9');
      root.style.setProperty('--primary', '#6366f1');
      root.style.setProperty('--secondary', '#334155');
      root.style.setProperty('--muted', '#1e293b');
      root.style.setProperty('--accent', '#312e81');
      root.style.setProperty('--border', '#334155');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    applyTheme(newTheme);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .update({ theme: newTheme })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return { theme, setTheme: updateTheme, loading };
}
