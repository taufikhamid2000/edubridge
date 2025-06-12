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
  FiX,
} from 'react-icons/fi';
import { signOut } from '@/lib/auth';

export default function Sidebar({
  onToggle,
}: {
  onToggle: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    onToggle(isOpen);
  }, [isOpen, onToggle]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed bottom-4 right-4 z-50 md:hidden bg-[var(--color-accent)] text-white p-3 rounded-full shadow-lg"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-900 shadow-xl
          transition-transform duration-300 ease-in-out transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-[80vw] max-w-[320px]' : 'w-64'}
          md:relative md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold">EduBridge</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <Link href="/dashboard" className="nav-link">
              <FiHome /> <span>Dashboard</span>
            </Link>
            <Link href="/profile" className="nav-link">
              <FiUser /> <span>My Profile</span>
            </Link>
            <Link href="/resources" className="nav-link">
              <FiBook /> <span>Resources</span>
            </Link>
            <Link href="/marketplace" className="nav-link">
              <FiShoppingCart /> <span>Business Tools</span>
            </Link>
            <Link href="/community" className="nav-link">
              <FiMessageCircle /> <span>Community</span>
            </Link>
            <Link href="/settings" className="nav-link">
              <FiSettings /> <span>Settings</span>
            </Link>
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              className="nav-link mb-2 w-full justify-center"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              className="nav-link w-full justify-center text-red-600 dark:text-red-400"
              onClick={signOut}
            >
              <FiLogOut />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
