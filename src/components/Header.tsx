import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initial = saved ?? 'dark';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    };
    init();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <header className="sticky top-0 bg-[var(--color-bg)] bg-opacity-70 backdrop-blur-sm z-50">
      <div className="container mx-auto flex items-center py-4 px-4">
        {/* Logo aligned left, made large */}
        <Link href="/" className="text-5xl md:text-6xl font-extrabold">
          EduBridge
        </Link>

        {/* Navigation aligned right */}
        <nav className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="btn">
                Dashboard
              </Link>
              <button
                className="btn"
                onClick={() => {
                  signOut();
                  setUser(null);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn">
                Join Now
              </Link>
            </>
          )}
          <button onClick={toggleTheme} className="btn p-2" aria-label="Toggle theme">
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}