/* eslint-disable react/no-unescaped-entities */
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="heroSection">
        <h1>Empowering Students and Educators to Succeed</h1>
        <p>Discover tools, resources, and a community to support learning, entrepreneurship, and career growth.</p>
        <button>Get Started Today</button>
      </section>

      {/* Features Section */}
      <section className="featuresSection">
        <h2>Why Choose Edubridge?</h2>
        <div className="features">
          <div className="feature">
            <h3>UYE</h3>
            <p>Launch and grow your business on a dedicated eCommerce platform for students.</p>
          </div>
          <div className="feature">
            <h3>Veyoyee</h3>
            <p>Earn rewards while contributing to surveys and research that matter.</p>
          </div>
          <div className="feature">
            <h3>SlideShare</h3>
            <p>Share study materials, help others, and earn extra income effortlessly.</p>
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
        <button data-aos="zoom-in">Sign Up Now</button>
      </section>

      <Footer />
    </div>
  );
}
