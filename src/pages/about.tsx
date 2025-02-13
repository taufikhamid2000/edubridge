/* eslint-disable react/no-unescaped-entities */
// pages/QnA.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Shared.module.css';
import Link from 'next/link';

export default function About() {
  return (
    <div>
      <Header />

      {/* Introduction */}
      <section className={styles.introSection}>
        <h1>Questions You’ll Probably Ask (And Some You Won’t)</h1>
        <p>
          Look, we get it. You’ve got questions. Lucky for you, we’ve got
          answers. Some are genius-level, others are common sense. Either way,
          let’s do this.
        </p>
      </section>

      {/* Q&A */}
      <section className={styles.qaSection}>
        <div className={styles.question}>
          <h2>What is EduBridge?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            It's a platform. For students. And educators. We built it so you’d
            stop complaining about not having tools. You're welcome.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Why should I care?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Honestly? You don’t have to. But if you’re into learning, earning,
            or doing something useful with your life, you might want to stick
            around.
          </p>
        </div>

        <div className={styles.question}>
          <h2>How do I make money?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            You can sell stuff on UYE or share notes on SlideShare. Or, you
            know, just beg your parents for cash. We’re not judging.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Can I use EduBridge for free?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Yeah. For now, it’s free. Don’t get too comfortable though—we might
            decide we like money more than you.
          </p>
        </div>

        <div className={styles.question}>
          <h2>What makes EduBridge different from other platforms?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            It’s tailored for students and educators. Unlike others, we actually
            care about your growth. Wait, no, scratch that. We just know this
            niche pays well.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Is EduBridge safe?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Safer than clicking on that “You’ve won a million dollars” email.
            Your data is fine unless someone bribes us enough. (Just kidding. Or
            am I?)
          </p>
        </div>

        <div className={styles.question}>
          <h2>How does UYE work?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            You sell stuff. People buy it. You make money. It’s not rocket
            science. If you need a guide for this, we’re concerned.
          </p>
        </div>

        <div className={styles.question}>
          <h2>How do I get started?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Hit that “Get Started” button. If you can’t figure that out, this
            might not be the platform for you.
          </p>
        </div>

        <div className={styles.question}>
          <h2>Any hidden fees?</h2>
        </div>
        <div className={styles.answer}>
          <p>
            Nope. Unless you count the emotional toll of realizing you’re broke.
            But hey, we’re here to help with that.
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
