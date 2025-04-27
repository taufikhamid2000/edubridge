/* eslint-disable react/no-unescaped-entities */
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>EduBridge | Gamified Microlearning for Secondary Students</title>
        <meta
          name="description"
          content="EduBridge offers gamified daily quizzes for Malaysian Form 4 and Form 5 students to build consistent study habits and earn rewards."
        />
        <meta
          name="keywords"
          content="EduBridge, gamified learning, microlearning, secondary education, Form 4, Form 5, Malaysia"
        />
        <meta name="author" content="Taufik Hamid" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </Head>
      <div>
        <Header />

        {/* Introduction Section */}
        <section className="introductionSection">
          <h1>🎓 Welcome to EduBridge </h1>
          <p>
            EduBridge is a lightweight, gamified microlearning platform built to help Malaysian Form 4 and Form 5 students strengthen their academic skills through daily engagement. By offering fast, rewarding quiz experiences, EduBridge motivates students to build consistent study habits, earn recognition 🏆, and achieve measurable academic growth. The platform operates independently, without claiming alignment with any official examination board or curriculum.
          </p>
        </section>

        {/* Market Opportunity Section */}
        <section className="marketOpportunitySection">
          <h2>📊 Market Opportunity</h2>
          <h3>Overview</h3>
          <ul>
            <li>Malaysia has approximately 1.1 million students in upper secondary education (Form 4 and Form 5 combined).</li>
            <li>Existing solutions (JomStudy, EduBijak) focus heavily on static notes or traditional AI tutors, often lacking engagement loops.</li>
          </ul>
          <h3>Gaps Identified</h3>
          <ul>
            <li>Limited tools combining quick learning ⚡, habit formation, and tangible rewards 🏅.</li>
            <li>Traditional, resource-heavy apps are not mobile-data friendly, disadvantaging B40 groups.</li>
            <li>No major platform currently gamifies daily subject mastery at the secondary school level.</li>
          </ul>
        </section>

        {/* Target Users Section */}
        <section className="targetUsersSection">
          <h2>🎯 Target Users</h2>
          <ul>
            <li><strong>Primary:</strong> Form 4 and Form 5 students aiming to strengthen academic mastery 📚.</li>
            <li><strong>Secondary:</strong> Students retaking secondary-level examinations 🔄.</li>
            <li><strong>Tertiary:</strong> Parents and teachers seeking complementary study tools for their children or students 👨‍🏫.</li>
          </ul>
        </section>

        {/* Core Concept Section */}
        <section className="coreConceptSection">
          <h2>💡 Core Concept</h2>
          <h3>Learning Method</h3>
          <ul>
            <li>Daily bite-sized quizzes covering key secondary school topics ❓.</li>
            <li>XP points earned for participation and mastery ✨.</li>
            <li>Streak rewards for consecutive daily engagement 🔥.</li>
            <li>Weekly and monthly cash prizes to drive motivation 💰.</li>
          </ul>
          <h3>Platform Principles</h3>
          <ul>
            <li><strong>Mobile-first</strong> 📱</li>
            <li><strong>Low-bandwidth usage</strong> 🌐</li>
            <li><strong>Gamification at the core</strong> 🎮</li>
            <li><strong>Independent and curriculum-neutral</strong> 🔍</li>
          </ul>
        </section>

        {/* MVP Scope Section */}
        <section className="mvpScopeSection">
          <h2>🚀 Scope of First Launch (MVP)</h2>
          <h3>Subjects</h3>
          <ul>
            <li>Bahasa Melayu</li>
            <li>Sejarah</li>
          </ul>
          <h3>Core Features</h3>
          <ul>
            <li>Subject → Chapter → Topic flow 🔄</li>
            <li>Quiz engine with multiple-choice questions ✅</li>
            <li>XP system and streak tracking 📈</li>
            <li>Open leaderboard with "Most Improved" and "Top Climber" highlights 🏅</li>
            <li>Weekly RM reward disbursement system 💵</li>
          </ul>
          <h3>Technology Stack</h3>
          <ul>
            <li><strong>Frontend:</strong> Next.js (React) hosted on Vercel ⚛️</li>
            <li><strong>Backend & Data:</strong> Supabase (authentication, database, storage) 🛢️</li>
            <li><strong>AI Layer:</strong> GPT-3.5-turbo (optional limited feedback system) 🤖</li>
            <li><strong>Storage:</strong> Supabase Storage + Cloudinary optimization 📦</li>
          </ul>
        </section>

        {/* Phase-by-Phase Plan Section */}
        <section className="phasePlanSection">
          <h2>📅 Phase-by-Phase Plan</h2>
          <h3>Phase 1: MVP Development (0-4 months)</h3>
          <ul>
            <li>Bahasa Melayu and Sejarah modules</li>
            <li>XP, streak, leaderboard systems</li>
            <li>Pilot version tested internally 🧪</li>
          </ul>
          <h3>Phase 2: Pilot Testing (4-6 months)</h3>
          <ul>
            <li>Soft-launch with 2–3 schools 🏫</li>
            <li>Target 100–500 students 🎯</li>
            <li>Measure Day-2 retention, weekly engagement 📊</li>
          </ul>
          <h3>Phase 3: Expansion (6–9 months)</h3>
          <ul>
            <li>Add new subjects (Mathematics, Science) ➕</li>
            <li>Improve UX based on pilot feedback 🔄</li>
          </ul>
          <h3>Phase 4: Malaysia-Wide Launch (9-15 months)</h3>
          <ul>
            <li>Regional marketing efforts 📣</li>
            <li>Introduce first formal sponsorship programs 🤝</li>
          </ul>
          <h3>Phase 5: Optional Regional Expansion (15+ months)</h3>
          <ul>
            <li>Launch "Global Skills Track" (basic English, Math, Science quizzes) 🌍</li>
            <li>Offer flexible onboarding for regional markets 🛫</li>
          </ul>
        </section>

        {/* Revenue and Sustainability Section */}
        <section className="revenueSection">
          <h2>💰 Revenue & Sustainability Plan</h2>
          <ul>
            <li><strong>Freemium Access:</strong> Free quizzes with optional upgrades (analytics, offline packs) 🆓</li>
            <li><strong>Sponsored Rewards:</strong> Corporate sponsors for cash prizes and tournament events 🏆</li>
            <li><strong>B2B Licensing:</strong> Packages for tuition centers, NGOs, or community programs 🏢</li>
            <li><strong>Supporter Donations:</strong> Voluntary support from alumni, parents, or public backers 🎗️</li>
          </ul>
        </section>

        {/* Risks and Mitigation Section */}
        <section className="risksSection">
          <h2>⚠️ Risks and Mitigation</h2>
          <table>
            <thead>
              <tr><th>Risk</th><th>Mitigation</th></tr>
            </thead>
            <tbody>
              <tr><td>Competition from existing apps</td><td>Focus on gamification and rewards, not static content</td></tr>
              <tr><td>Low user retention</td><td>Gamified loops, cash incentives, social recognition</td></tr>
              <tr><td>Abuse of prize system</td><td>Fraud prevention through ID checks, randomized audits</td></tr>
              <tr><td>Funding shortages</td><td>Early sponsorship and low-cost hosting strategies</td></tr>
            </tbody>
          </table>
        </section>

        {/* Success Metrics Section */}
        <section className="successMetricsSection">
          <h2>📈 Success Metrics</h2>
          <ul>
            <li><strong>Retention:</strong> 45% Day-2 retention among pilot users.</li>
            <li><strong>Engagement:</strong> 30 quizzes/user/week.</li>
            <li><strong>Growth:</strong> 1,000 monthly active users by Month 4.</li>
            <li><strong>Impact:</strong> 70% of active users show measurable academic improvement over 3 months.</li>
          </ul>
        </section>

        {/* Conclusion Section */}
        <section className="conclusionSection">
          <h2>🔚 Conclusion</h2>
          <p>
            EduBridge addresses a critical gap in Malaysia's education ecosystem: the need for daily, engaging, rewarding, and low-data independent learning. Its initial launch in Malaysia gives it a clear target market with manageable competition. By validating user engagement and impact early, EduBridge can later expand to broader regions without losing focus.
          </p>
          <h3>Next Steps ➡️</h3>
          <ul>
            <li>Finalize MVP specifications.</li>
            <li>Build minimum content (Bahasa Melayu + Sejarah quizzes).</li>
            <li>Prepare early reward pool fund.</li>
            <li>Begin pilot partner outreach.</li>
          </ul>
        </section>

        {/* Call-to-Action Section */}
        <section className="ctaSection">
          <h2>🙌 Get Involved</h2>
          <p>Ready to empower students? Join EduBridge today and make a difference.</p>
          <Link href="/sign-up">
            <button className="btn">Sign Up Now</button>
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
