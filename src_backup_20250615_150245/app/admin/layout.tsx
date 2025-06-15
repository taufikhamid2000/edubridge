'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage and handle admin page access logging
  useEffect(() => {
    setIsMounted(true);

    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme ?? 'dark';
    setTheme(initialTheme);

    // Apply theme class to html element
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);

    // Log admin page access for monitoring/security
    const logAdminAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          logger.log('Admin area accessed by user:', session.user.id);
        }
      } catch (error) {
        logger.error('Error logging admin access:', error);
      }
    };

    logAdminAccess();
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    return null;
  }

  return <div className="admin-layout dark:bg-gray-900">{children}</div>;
}
