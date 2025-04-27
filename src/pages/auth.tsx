// pages/auth.tsx
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message);
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

    let res;
    if (isSignUp) {
      res = await supabase.auth.signUp({ email, password });
    } else {
      res = await supabase.auth.signInWithPassword({ email, password });
      if (!res.error) router.replace('/dashboard');
    }

    if (res.error) setError(res.error.message);
    setLoadingManual(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleManualAuth();
  };

  return (
    <>
      <Head>
        <title>EduBridge · {isSignUp ? 'Sign Up' : 'Sign In'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <section className="authSection">
        <div className="authCard">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="btn w-full mb-6"
          >
            {loadingGoogle ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-2 my-10">
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="text-[var(--color-subtext)]">or</span>
            <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-8">
            <div className="formField">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="formField">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isSignUp && (
              <div className="formField">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loadingManual}
              className="btn w-full mt-8"
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
              className="underline text-[var(--color-accent)]"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
