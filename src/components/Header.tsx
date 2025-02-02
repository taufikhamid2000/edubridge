import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState('dark'); // Default to dark mode

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    checkUser();

    const savedTheme = localStorage.getItem('theme') || 'dark'; // Get theme from local storage
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark'); // Apply dark mode on load
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
            <Link href="/dashboard">
              <button className="btn">Dashboard</button>
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
            <button
              onClick={toggleTheme}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
            >
              {theme === 'dark' ? '🌞' : '🌙'}{' '}
              {/* Change icon based on theme */}
            </button>
            <Link href="/sign-in">
              <button className="btn">Sign In</button>
            </Link>
            <Link href="/sign-up">
              <button className="btn join">Join Now</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
