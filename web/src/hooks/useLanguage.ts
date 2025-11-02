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

  const updateLanguage = async (newLanguage: 'en' | 'es') => {
    try {
      console.log('Updating language to:', newLanguage);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('users')
        .update({ language: newLanguage })
        .eq('id', user.id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Language updated successfully in database');
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      console.log('Language state updated to:', newLanguage);
    } catch (error) {
      console.error('Error updating language:', error);
      throw error; // Re-throw to let the caller handle it
    }
  };

  return { language, setLanguage: updateLanguage, loading };
}
