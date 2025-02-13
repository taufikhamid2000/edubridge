import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    checkUser();

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="header">
      <Link href="/" className="logo">
        EduBridge
      </Link>
      <nav>
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

        <button onClick={toggleTheme} className="btn" aria-label="Toggle theme">
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
      </nav>
    </header>
  );
}
