// pages/terms.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Shared.module.css';
import Link from 'next/link';

export default function Terms() {
  return (
    <div>
      <Header />

      {/* Introduction */}
      <section className={styles.introSection}>
        <h1>Terms and Conditions (Yawn)</h1>
        <p>
          Welcome to the legal mumbo-jumbo page. Don’t worry, we’ve made it as
          painless as possible. Here’s what you need to know before you dive
          into EduBridge.
        </p>
      </section>

      {/* Q&A */}
      <section className={styles.qaSection}>
        <div className={styles.question}>
          <h2>1. Don’t Do Dumb Stuff</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Use EduBridge responsibly. Don’t hack it, spam it, or use it to do
            shady things. We’re not your babysitters, but we will kick you out
            if you ruin the vibe.
          </p>
        </div>

        <div className={styles.question}>
          <h2>2. No Guarantee of Success</h2>
        </div>
        <div className={styles.answer}>
          <p>
            If you don’t become a millionaire using EduBridge, that’s on you. We
            provide tools, not magic spells.
          </p>
        </div>

        <div className={styles.question}>
          <h2>3. Your Account, Your Responsibility</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Don’t share your password with your pet goldfish and then complain
            when it gets hacked. Keep your login details secure.
          </p>
        </div>

        <div className={styles.question}>
          <h2>4. Content You Post</h2>
        </div>
        <div className={styles.answer}>
          <p>
            If you post something illegal, offensive, or just plain dumb, that’s
            on you. We might remove it, and we won’t lose sleep over it.
          </p>
        </div>

        <div className={styles.question}>
          <h2>5. Updates to These Terms</h2>
        </div>
        <div className={styles.answer}>
          <p>
            We might change these terms from time to time. When we do, we’ll let
            you know. If you keep using EduBridge after that, congrats—you agree
            to the new terms!
          </p>
        </div>

        <div className={styles.question}>
          <h2>6. Liability (Or Lack Thereof)</h2>
        </div>
        <div className={styles.answer}>
          <p>
            If your cat deletes your project while you’re using EduBridge, don’t
            sue us. We’re not responsible for any losses, damages, or your
            questionable life choices.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Got More Questions?</h2>
        <p>
          We’re here, and we’re not shy. Reach out if you want more details—or
          if you just wanna rant. We can handle it.
        </p>
        <Link href="/contact" passHref>
          <button>Contact Us</button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
