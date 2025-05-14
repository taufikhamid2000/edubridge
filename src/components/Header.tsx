'use client';

// src/components/Header.tsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { JSX } from 'react/jsx-dev-runtime';
import Image from 'next/image';

export default function Header(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initial = saved ?? 'dark';
      setTheme(initial);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initial);
    }
    init();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = document.querySelector('.header-menu');
      if (menuElement && !menuElement.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(next);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 bg-[var(--color-bg)] bg-opacity-70 backdrop-blur-sm z-50">
      <div className="header-container">
        <Link href="/" className="header-link">
          <Image
            src="/favicon.ico"
            alt="EduBridge Logo"
            width={32}
            height={32}
            className="w-8 h-8 mr-2"
          />
          EduBridge
        </Link>

        <nav className="header-nav">
          {user ? (
            <div className={`header-menu ${menuOpen ? 'open' : ''}`}>
              <button className="header-menu-button" onClick={toggleMenu}>
                Menu
              </button>{' '}
              <div className="header-menu-dropdown">
                <Link href="/dashboard" className="header-menu-link">
                  Dashboard
                </Link>
                <Link href="/leaderboard" className="header-menu-link">
                  Leaderboard
                </Link>
                <Link href="/profile" className="header-menu-link">
                  Profile
                </Link>
                <button
                  type="button"
                  className="header-menu-link"
                  onClick={() => {
                    signOut();
                    setUser(null);
                    setMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth" className="btn">
              Get Started
            </Link>
          )}

          <button
            type="button"
            className="header-theme-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <span role="img" aria-label="Light Mode" className="text-xl">
                🌞
              </span>
            ) : (
              <span role="img" aria-label="Dark Mode" className="text-xl">
                🌙
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
