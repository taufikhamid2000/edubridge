import { supabase } from './supabase';

export const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) throw signInError;
  return signInData.session;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
};

export const signOut = async () => {
  try {
    // Sign out from both local session and server session
    await supabase.auth.signOut({ scope: 'global' });

    // Clear any locally stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
    }

    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
    // Force redirect to auth page even if there was an error
    window.location.href = '/auth';
  }
};
