import { useState, useEffect } from 'react';
import { initializeTheme, setTheme as setGlobalTheme } from '@/lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Initialize theme on component mount
    const initialTheme = initializeTheme();
    setThemeState(initialTheme);
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setGlobalTheme(newTheme);
    setThemeState(newTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}
