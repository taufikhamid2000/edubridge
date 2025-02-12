import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Auth.module.css';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await signIn(email, password);
      if (session) {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }

    setLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.content}>
        <section className={styles.authSection}>
          <h1>Welcome Back</h1>
          <p>Log in and continue where you left off.</p>
          {error && <p className={styles.error}>{error}</p>}
          <form className={styles.authForm} onSubmit={handleSignIn}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className={styles.switch}>
            Don’t have an account? <Link href="/sign-up">Sign Up</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
