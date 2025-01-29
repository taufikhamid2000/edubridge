import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="header">
      <Link href="/" className="logo">
        EduBridge
      </Link>
      <nav>
        {user ? (
          <>
            <Link href="/dashboard">
              <button className="btn">Dashboard</button>
            </Link>
            <button
              className="btn"
              onClick={() => {
                signOut();
                setUser(null);
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/sign-in">
              <button className="btn">Sign In</button>
            </Link>
            <Link href="/sign-up">
              <button className="btn join">Join Now</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
