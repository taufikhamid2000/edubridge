/* eslint-disable react/no-unescaped-entities */
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Edubridge | Empowering Students and Educators</title>
        <meta
          name="description"
          content="Edubridge connects students and educators with tools to learn, earn, and grow. Join a thriving community today!"
        />
        <meta
          name="keywords"
          content="education platform, student tools, earn while learning, Edubridge features"
        />
        <meta name="author" content="Edubridge Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Edubridge",
              "url": "https://www.edubridge.com",
              "description":
                "Empowering students and educators with tools to learn, earn, and grow.",
              "sameAs": [
                "https://www.facebook.com/edubridge",
                "https://www.twitter.com/edubridge",
              ],
            }),
          }}
        />
      </Head>
      <div>
        <Header />

        {/* Hero Section */}
        <section className="heroSection">
          <h1>Empowering Students and Educators to Succeed</h1>
          <p>
            Discover tools, resources, and a community to support learning,
            entrepreneurship, and career growth.
          </p>
          <Link href="/sign-up"><button>Get Started Today</button></Link>
        </section>

        {/* Features Section */}
        <section className="featuresSection">
          <h2>Why Choose Edubridge?</h2>
          <div className="features">
            <div className="feature">
              <h3>UYE</h3>
              <p>
                Launch and grow your business on a dedicated eCommerce platform
                for students.
              </p>
            </div>
            <div className="feature">
              <h3>Veyoyee</h3>
              <p>
                Earn rewards while contributing to surveys and research that
                matter.
              </p>
            </div>
            <div className="feature">
              <h3>SlideShare</h3>
              <p>
                Share study materials, help others, and earn extra income
                effortlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonialsSection" data-aos="fade-up">
          <h2 data-aos="zoom-in">What Our Users Say</h2>
          <p data-aos="slide-left" data-aos-delay="200">
            "StudentHub helped me start my own business while still in college!"
            - Aiman
          </p>
          <p data-aos="slide-right" data-aos-delay="400">
            "I love how easy it is to share notes and earn rewards." - Sarah
          </p>
        </section>

        {/* Call-to-Action Section */}
        <section className="ctaSection" data-aos="fade-up">
          <h2 data-aos="slide-right">Join Us Today</h2>
          <p data-aos="slide-left">
            Be part of a growing community of students and educators making a
            difference.
          </p>
          <Link href="/sign-up"><button data-aos="zoom-in">Sign Up Now</button></Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
