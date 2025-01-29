/* eslint-disable react/no-unescaped-entities */
// pages/contact.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/Contact.module.css';

export default function Contact() {
  return (
    <div>
      <Header />

      {/* Introduction */}
      <section className={styles.introSection}>
        <h1>Contact Us</h1>
        <p>
          Got questions, feedback, or just want to say hi? We'd love to hear
          from you. Oh, and by "we," I mean me and ChatGPT. That’s the whole
          team. We’re a bit shy.
        </p>
      </section>

      {/* Contact Form */}
      <section className={styles.contactSection}>
        <form className={styles.contactForm}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="What's your name?"
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="How do we reach you?"
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="What's on your mind?"
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2>Not Ready to Message?</h2>
        <p>
          No worries. Just shout into the void and maybe we’ll hear it. Or, you
          know, come back later when you’re ready to type something.
        </p>
      </section>

      <Footer />
    </div>
  );
}
