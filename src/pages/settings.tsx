/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import styles from '@/styles/Profile.module.css'; // Now using shared CSS

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        router.push('/sign-in');
      } else {
        setUser(data.user);
        setUsername(data.user.user_metadata?.username || '');
        setProfileImageUrl(data.user.user_metadata?.profileImage || '');
      }
    };

    fetchUser();
  }, [router]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updates = {
      username,
      profileImage: profileImageUrl,
    };

    const { error } = await supabase.auth.updateUser({ data: updates });
    setLoading(false);

    if (error) {
      alert('Error updating profile.');
    } else {
      alert('Profile updated successfully!');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setProfileImage(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage.from('profiles').upload(filePath, file, {
      upsert: true,
    });

    if (error) {
      alert('Error uploading image.');
    } else {
      const publicUrl = `${supabase.storage.from('profiles').getPublicUrl(filePath).data.publicUrl}`;
      setProfileImageUrl(publicUrl);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className={styles.pageContainer}>
      <Sidebar onToggle={(open) => setIsSidebarOpen(open)} />
      <div className={styles.contentContainer}>
        <main className={styles.mainContent}>
          <h1>Edit Profile</h1>

          <div className={styles.profileImageContainer}>
            {profileImageUrl && <img src={profileImageUrl} alt="Profile" className={styles.profileImage} />}
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className={styles.formGroup}>
            <label>Username </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <button onClick={handleUpdateProfile} disabled={loading} className={styles.actionButton}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </main>
        <div className={styles.footerContainer}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
