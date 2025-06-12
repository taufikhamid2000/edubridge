'use client';

// src/components/Header.tsx
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { verifyAdminAccess } from '@/services/adminAuthService';
import type { User } from '@supabase/supabase-js';
import { JSX } from 'react/jsx-dev-runtime';
import Image from 'next/image';

export default function Header(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Check admin status if user is logged in
      if (session?.user) {
        try {
          const { isAdmin: adminStatus } = await verifyAdminAccess();
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const initial = saved ?? 'dark';
      setTheme(initial);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initial);
    }
    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // Check admin status when auth state changes
      if (session?.user) {
        try {
          const { isAdmin: adminStatus } = await verifyAdminAccess();
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = document.querySelector('.header-menu');
      if (menuElement && !menuElement.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const openResearchPDF = () => {
    window.open('/docs/EduBridge%20Research.pdf', '_blank');
  };

  return (
    <header className="sticky top-0 bg-[var(--color-bg)] bg-opacity-95 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="header-container">
        <Link href="/" className="header-link">
          <Image
            src="/favicon.ico"
            alt="EduBridge Logo"
            width={32}
            height={32}
            className="w-8 h-8 mr-2"
            priority
          />
          <span className="hidden sm:inline">EduBridge</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <div className={`header-menu ${menuOpen ? 'open' : ''}`}>
              <button
                className={`header-menu-button flex items-center space-x-2 md:space-x-3 ${
                  isMobile ? 'p-2' : 'px-4 py-2'
                }`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span className="hidden sm:inline">Menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={isMobile ? 'h-6 w-6' : 'h-5 w-5'}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div
                className={`header-menu-dropdown ${
                  menuOpen ? 'block' : 'hidden'
                } ${isMobile ? 'w-screen left-0 right-0 fixed mt-0' : 'w-48'}`}
              >
                <div className={isMobile ? 'max-h-[80vh] overflow-y-auto' : ''}>
                  <Link href="/dashboard" className="header-menu-link">
                    Dashboard
                  </Link>

                  <div className="py-1 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/leaderboard" className="header-menu-link">
                      Student Rankings
                    </Link>
                    <Link
                      href="/leaderboard/schools"
                      className="header-menu-link"
                    >
                      School Rankings
                    </Link>
                  </div>

                  <Link href="/profile" className="header-menu-link">
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link href="/admin" className="header-menu-link">
                      Admin
                    </Link>
                  )}

                  <button
                    type="button"
                    className="header-menu-link w-full text-left"
                    onClick={openResearchPDF}
                  >
                    Research
                  </button>

                  <button
                    type="button"
                    className="header-menu-link w-full text-left text-red-600 dark:text-red-400"
                    onClick={async () => {
                      setUser(null);
                      setMenuOpen(false);
                      await signOut();
                      document.location.href = '/';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/auth"
              className={`btn bg-[var(--color-accent)] text-white hover:bg-opacity-90 ${
                isMobile ? 'px-4 py-2 text-sm' : ''
              }`}
            >
              Get Started
            </Link>
          )}

          <button
            type="button"
            className={`header-theme-button ${
              isMobile ? 'p-2 ml-2' : 'p-2 ml-4'
            }`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
