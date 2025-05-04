import { createClient } from '@supabase/supabase-js';

// Add environment information logs to help diagnose issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Missing Supabase credentials!', { 
    urlExists: !!supabaseUrl, 
    keyExists: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
    isVercel: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  });
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
    },
    global: {
      // Add request headers for tracking the source environment
      headers: {
        'x-app-env': process.env.NODE_ENV || 'unknown',
        'x-is-vercel': process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'true' : 'false'
      }
    }
  }
);
