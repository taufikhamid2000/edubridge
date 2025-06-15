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
  console.log('SignOut function started');
  try {
    // Sign out from both local session and server session
    console.log('Calling supabase.auth.signOut()...');
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error('Supabase signOut error:', error);
    } else {
      console.log('Supabase signOut successful');
    }

    // Clear any locally stored auth data
    if (typeof window !== 'undefined') {
      console.log('Removing auth token from localStorage');
      localStorage.removeItem('supabase.auth.token');
    }

    // Delay to ensure signout operations complete
    console.log('Redirecting to homepage...');

    // Use a hard redirect that won't be caught by Next.js router
    document.location.href = '/';
    return true; // Signal that signout completed successfully
  } catch (error) {
    console.error('Error signing out:', error);
    // Force redirect to auth page even if there was an error
    document.location.href = '/auth';
    return false;
  }
};
