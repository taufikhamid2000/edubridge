/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { User } from '@supabase/supabase-js';
import styles from '@/styles/Dashboard.module.css';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/sign-in');
      } else {
        setUser(data.session.user);
      }
    };

    checkUser();

    const today = new Date();
    setFormattedDate(today.toLocaleDateString('en-GB'));
  }, [router]);

  return (
    <div className={`${styles.dashboardContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <Sidebar onToggle={(open) => setIsSidebarOpen(open)} />
      <div className={styles.dashboardContent}>
        <section className={styles.userOverview}>
          <h2>Welcome, {user?.email || 'User'}!</h2>
          <p>Your last login: {formattedDate || 'Loading...'}</p>
        </section>

        <section className={styles.quickActions}>
          <div className={styles.card}>
            <h3>📚 Resources</h3>
            <p>Browse study materials and shared documents.</p>
          </div>
          <div className={styles.card}>
            <h3>🛍️ Marketplace</h3>
            <p>View and manage your online sales.</p>
          </div>
          <div className={styles.card}>
            <h3>🎓 Community</h3>
            <p>Join discussions, webinars, and student groups.</p>
          </div>
        </section>

        <section className={styles.activity}>
          <h2>Recent Activity</h2>
          <ul>
            <li>✅ Completed "Intro to Python"</li>
            <li>📤 Uploaded new study notes</li>
            <li>💰 Earned 10 points in Veyoyee rewards</li>
          </ul>
        </section>

        <section className={styles.announcements}>
          <h2>📢 Announcements</h2>
          <p>New scholarship applications open this month! Apply now.</p>
        </section>
      </div>
    </div>
  );
}
