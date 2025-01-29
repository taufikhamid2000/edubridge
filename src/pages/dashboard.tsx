import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
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
  }, [router]);

  return (
    <div>
      <Header />
      <section className="dashboard">
        <h1>Dashboard</h1>
        {user ? <p>Welcome, {user.email}!</p> : <p>Loading...</p>}
      </section>
      <Footer />
    </div>
  );
}
