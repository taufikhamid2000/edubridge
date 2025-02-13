/* eslint-disable react/no-unescaped-entities */
// pages/QnA.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Shared.module.css';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div>
      <Header />

      {/* Introduction */}
      <section className={styles.introSection}>
        <h1>Privacy Policy (Because, You Know, It’s Required)</h1>
        <p>
          Let’s cut to the chase: you want to know if we’re secretly selling
          your data to alien overlords. Short answer: no. Long answer? Well,
          keep reading.
        </p>
      </section>

      {/* Q&A */}
      <section className={styles.qaSection}>
        <div className={styles.question}>
          <h2>What data do you collect?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Just the basics: your name, email, and anything else you willingly
            hand over. We’re not hackers. We just need enough to make things
            work. Chill. You're welcome.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Do you sell my data?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Nope. Your data stays with us. Frankly, we’re too busy building cool
            stuff to bother selling your email address to sketchy advertisers.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Do you use cookies?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Yes, but not the chocolate chip kind (sadly). These cookies help our
            site function. If you don’t like it, you can block them—but don’t
            blame us when things break.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Is my data secure?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            As secure as humanly possible. We’ve got firewalls, encryption, and
            other techie stuff. But hey, if you use "password123," we can’t help
            you there.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Can I delete my data?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Absolutely. Drop us a message, and we’ll nuke your data from orbit.
            (Okay, not literally, but you get the point.)
          </p>
        </div>

        <div className={styles.question}>
          <h2>Will this policy ever change?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Probably. If it does, we’ll let you know. No surprises, no fine
            print. We’re not those people.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Got More Questions?</h2>
        <p>
          If you’re still paranoid, feel free to reach out. We’ll clear up your
          concerns—or at least make you feel slightly better about trusting us.
        </p>
        <Link href="/contact" passHref>
          <button className="btn">Contact Us</button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
