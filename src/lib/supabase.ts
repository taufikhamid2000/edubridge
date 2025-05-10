import { createClient } from '@supabase/supabase-js';

// Add environment information logs to help diagnose issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 Missing Supabase credentials!', {
    urlExists: !!supabaseUrl,
    keyExists: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
    isVercel: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  });
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
  },
  global: {
    // Add request headers for tracking the source environment
    headers: {
      'x-app-env': process.env.NODE_ENV || 'unknown',
      'x-is-vercel':
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'true' : 'false',
    },
  },
});

// Create a Supabase admin client with service role key
// This client bypasses RLS policies - USE WITH CAUTION
// Only use this for server-side operations where needed
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl || '', supabaseServiceKey)
  : supabase; // Fall back to regular client if no service key
