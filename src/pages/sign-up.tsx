import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Auth.module.css';
import Link from 'next/link';

export default function SignUp() {
  return (
    <div>
      <Header />

      <section className={styles.authSection}>
        <h1>Join Edubridge</h1>
        <p>Welcome to the club. Let’s get you set up in no time.</p>
        <form className={styles.authForm}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Create a unique username"
          />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a secure password"
          />

          <button type="submit">Sign Up</button>
        </form>
        <p className={styles.switch}>
          Already have an account? <Link href="/sign-in">Sign In</Link>
        </p>
      </section>

      <Footer />
    </div>
  );
}
