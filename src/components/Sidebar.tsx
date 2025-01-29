import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiBook,
  FiShoppingCart,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
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
          <button className={styles.logout} onClick={signOut}>
            <FiLogOut /> Sign Out
          </button>
        </nav>
      </aside>
    </>
  );
}
