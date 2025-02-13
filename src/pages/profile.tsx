/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import styles from '@/styles/Profile.module.css';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        router.push('/sign-in');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className={styles.pageContainer}>
      <Sidebar onToggle={(open) => setIsSidebarOpen(open)} />
      <div className={styles.contentContainer}>
        <main className={styles.mainContent}>
          <h1>My Profile</h1>
          <div className={styles.userInfo}>
            <p>
              <strong>Email: </strong> {user?.email}
            </p>
            <p>
              <strong>Username: </strong>{' '}
              {user?.user_metadata?.username || 'Not set'}
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className={styles.actionButton}
          >
            Edit Profile
          </button>
        </main>
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
