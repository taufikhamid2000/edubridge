import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  FiMenu,
  FiHome,
  FiUser,
  FiBook,
  FiShoppingCart,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import { signOut } from '@/lib/auth';
import styles from '@/styles/Sidebar.module.css';

export default function Sidebar({
  onToggle,
}: {
  onToggle: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Fix: Set theme from localStorage immediately to prevent flicker
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark'; // Default if localStorage is unavailable
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    onToggle(isOpen);
  }, [isOpen, onToggle]);

  // ✅ Apply dark mode class based on state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <>
      {!isOpen && (
        <button className={styles.menuButton} onClick={() => setIsOpen(true)}>
          <FiMenu />
        </button>
      )}

      <div
        className={`${styles.overlay} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isMobile ? styles.mobile : ''}`}
      >
        <div className={styles.logo}>EduBridge</div>
        <nav>
          <Link href="/dashboard">
            <FiHome /> Dashboard
          </Link>
          <Link href="/profile">
            <FiUser /> My Profile
          </Link>
          <Link href="/resources">
            <FiBook /> Resources
          </Link>
          <Link href="/marketplace">
            <FiShoppingCart /> Business Tools
          </Link>
          <Link href="/community">
            <FiMessageCircle /> Community
          </Link>
          <Link href="/settings">
            <FiSettings /> Settings
          </Link>

          {/* ✅ Dark Mode Toggle Button */}
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button className={styles.logout} onClick={signOut}>
            <FiLogOut /> Sign Out
          </button>
        </nav>
      </aside>
    </>
  );
}
