'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  useEffect(() => {
    // Try to get the session with recovery in case of token issues
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // If there's an authentication error, attempt to recover
          const { recoverSession } = await import('@/lib/supabase');
          await recoverSession();
          // Error already handled, stay on login page
          return;
        }

        if (data.session) {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkSession();
  }, [router]);
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          // Specify scopes to ensure token refresh works correctly
          scopes: 'email profile',
          // Use PKCE flow for better security and cleaner redirects
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        // If there's a token-related error, try recovery
        if (
          error.message.includes('token') ||
          error.message.includes('Token')
        ) {
          const { recoverSession } = await import('@/lib/supabase');
          await recoverSession();
          // Try again after recovery
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/dashboard',
              scopes: 'email profile',
            },
          });
        } else {
          setError(error.message);
          setLoadingGoogle(false);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google login error:', err);
      setLoadingGoogle(false);
    }
  };

  const handleManualAuth = async () => {
    setLoadingManual(true);
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoadingManual(false);
      return;
    }
    try {
      let res;
      if (isSignUp) {
        res = await supabase.auth.signUp({ email, password });
      } else {
        res = await supabase.auth.signInWithPassword({ email, password });
        if (!res.error) router.replace('/dashboard');
      }

      if (res.error) {
        // If there's an auth error related to tokens, try recovery
        if (
          res.error.message.includes('token') ||
          res.error.message.includes('Token')
        ) {
          const { recoverSession } = await import('@/lib/supabase');
          await recoverSession();
          // Try auth again after recovery
          if (isSignUp) {
            res = await supabase.auth.signUp({ email, password });
          } else {
            res = await supabase.auth.signInWithPassword({ email, password });
            if (!res.error) router.replace('/dashboard');
          }

          // If still error after recovery
          if (res.error) setError(res.error.message);
        } else {
          setError(res.error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoadingManual(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleManualAuth();
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-50 p-4">
      <div className="w-full max-w-md bg-gray-800 dark:bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {loadingGoogle ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-2 my-10">
          <hr className="flex-grow border-t border-gray-600 dark:border-gray-300" />
          <span className="text-gray-400 dark:text-gray-500">or</span>
          <hr className="flex-grow border-t border-gray-600 dark:border-gray-300" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-300 dark:text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-gray-300 dark:text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>

          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-gray-300 dark:text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loadingManual}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 mt-8"
          >
            {loadingManual
              ? isSignUp
                ? 'Creating…'
                : 'Signing in…'
              : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp((prev) => !prev)}
            className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </section>
  );
}
