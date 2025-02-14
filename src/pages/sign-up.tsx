import { useState } from 'react';
import { signUp } from '@/lib/auth';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import sharedStyles from '@/styles/Shared.module.css';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== retypePassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const session = await signUp(email, password);
      if (session) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    }

    setLoading(false);
  };

  return (
    <div>
      <Header />

      {/* Introduction (Reusing Shared Styles) */}
      <section className={sharedStyles.introSection}>
        <h1>Join EduBridge</h1>
        <p>Welcome to the club. Let’s get you set up.</p>
      </section>

      {/* Sign Up Form (Reusing Shared Styles) */}
      <section className={sharedStyles.contactSection}>
        {error && <p className={sharedStyles.error}>{error}</p>}
        <form className={sharedStyles.contactForm} onSubmit={handleSignUp}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className={sharedStyles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={sharedStyles.passwordToggle}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label>Retype Password</label>
          <div className={sharedStyles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={sharedStyles.passwordToggle}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className={sharedStyles.ctaSection}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </section>

      {/* Call-to-Action (Reusing Shared Styles) */}
      <section className={sharedStyles.ctaSection}>
        <p>
          Already have an account? <Link href="/sign-in">Sign In</Link>
        </p>
      </section>

      <Footer />
    </div>
  );
}
