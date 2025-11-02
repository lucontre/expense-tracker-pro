import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fasorgicidamrakyeayz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc29yZ2ljaWRhbXJha3llYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTg2NTEsImV4cCI6MjA3NzA5NDY1MX0.OS6jRztVA237hBznT7tzW6C1LkyeokDP_5WahAQZa3E';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new browser client with cookie storage
  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}
