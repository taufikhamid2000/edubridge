/* eslint-disable react/no-unescaped-entities */
// pages/sign-in.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Auth.module.css';

export default function SignIn() {
  return (
    <div>
      <Header />

      {/* Sign In Form */}
      <section className={styles.authSection}>
        <h1>Welcome Back</h1>
        <p>Log in and continue where you left off.</p>
        <form className={styles.authForm}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
          />

          <button type="submit">Sign In</button>
        </form>
        <p className={styles.switch}>
          Don’t have an account? <a href="/sign-up">Sign Up</a>
        </p>
      </section>

      <Footer />
    </div>
  );
}
