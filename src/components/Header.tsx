'use client';

// src/components/Header.tsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { JSX } from 'react/jsx-dev-runtime';

export default function Header(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initial = saved ?? 'dark';
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    }
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
        <Link href="/" className="text-8xl md:text-6xl font-extrabold">
          EduBridge
        </Link>

        <nav className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="btn">
                Dashboard
              </Link>
              <button
                type="button"
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
            <Link href="/auth" className="btn">
              Get Started
            </Link>
          )}

          <button
            type="button"
            className="btn p-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
