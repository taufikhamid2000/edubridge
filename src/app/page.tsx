'use client';

import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>EduBridge</title>
      </Head>
      <div className="bg-gradient-to-r from-red-500 to-blue-600 text-white py-16 px-4 md:px-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">EduBridge</h1>
        <p className="text-lg md:text-xl mb-6">
          Your platform for educational resources and quizzes.
        </p>
        <button
          className="inline-block uppercase tracking-wide rounded-full shadow-md transition-all duration-300 ease-in-out px-6 py-3 sm:px-8 sm:py-3 bg-white text-blue-500 font-medium hover:bg-gray-100"
          onClick={() => router.push('/auth')}
        >
          Get Started 🌞
        </button>
      </div>

      <section className="py-16 px-4 md:px-16 text-left">
        <h2 className="text-3xl font-bold mb-8">🎓 Welcome to EduBridge</h2>
        <p className="text-lg md:text-xl mb-6">
          EduBridge is a lightweight, gamified microlearning platform built to
          help Malaysian Form 4 and Form 5 students strengthen their academic
          skills through daily engagement. By offering fast, rewarding quiz
          experiences, EduBridge motivates students to build consistent study
          habits, earn recognition 🏆, and achieve measurable academic growth.
          The platform operates independently, without claiming alignment with
          any official examination board or curriculum.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">📊 Market Opportunity</h3>
        <p className="text-lg mb-6">
          <strong>Overview</strong>
          <br />
          Malaysia has approximately 1.1 million students in upper secondary
          education (Form 4 and Form 5 combined). Existing solutions (JomStudy,
          EduBijak) focus heavily on static notes or traditional AI tutors,
          often lacking engagement loops.
        </p>
        <p className="text-lg mb-6">
          <strong>Gaps Identified</strong>
          <br />
          Limited tools combining quick learning ⚡, habit formation, and
          tangible rewards 🏅. Traditional, resource-heavy apps are not
          mobile-data friendly, disadvantaging B40 groups. No major platform
          currently gamifies daily subject mastery at the secondary school
          level.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">🎯 Target Users</h3>
        <p className="text-lg mb-6">
          <strong>Primary:</strong> Form 4 and Form 5 students aiming to
          strengthen academic mastery 📚.
          <br />
          <strong>Secondary:</strong> Students retaking secondary-level
          examinations 🔄.
          <br />
          <strong>Tertiary:</strong> Parents and teachers seeking complementary
          study tools for their children or students 👨‍🏫.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">💡 Core Concept</h3>
        <p className="text-lg mb-6">
          <strong>Learning Method</strong>
          <br />
          Daily bite-sized quizzes covering key secondary school topics ❓. XP
          points earned for participation and mastery ✨. Streak rewards for
          consecutive daily engagement 🔥. Weekly and monthly cash prizes to
          drive motivation 💰.
        </p>
        <p className="text-lg mb-6">
          <strong>Platform Principles</strong>
          <br />
          Mobile-first 📱, Low-bandwidth usage 🌐, Gamification at the core 🎮,
          Independent and curriculum-neutral 🔍.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          🚀 Scope of First Launch (MVP)
        </h3>
        <p className="text-lg mb-6">
          <strong>Subjects:</strong> Bahasa Melayu, Sejarah.
          <br />
          <strong>Core Features:</strong> Subject → Chapter → Topic flow 🔄,
          Quiz engine with multiple-choice questions ✅, XP system and streak
          tracking 📈, Open leaderboard with &rdquo;Most Improved&rdquo; and
          &rdquo;Top Climber&rdquo; highlights 🏅, Weekly RM reward disbursement
          system 💵.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          📅 Phase-by-Phase Plan
        </h3>
        <p className="text-lg mb-6">
          <strong>Phase 1:</strong> MVP Development (0-4 months): Bahasa Melayu
          and Sejarah modules, XP, streak, leaderboard systems, Pilot version
          tested internally 🧪.
          <br />
          <strong>Phase 2:</strong> Pilot Testing (4-6 months): Soft-launch with
          2–3 schools 🏫, Target 100–500 students 🎯, Measure Day-2 retention,
          weekly engagement 📊.
          <br />
          <strong>Phase 3:</strong> Expansion (6–9 months): Add new subjects
          (Mathematics, Science) ➕, Improve UX based on pilot feedback 🔄.
          <br />
          <strong>Phase 4:</strong> Malaysia-Wide Launch (9-15 months): Regional
          marketing efforts 📣, Introduce first formal sponsorship programs 🤝.
          <br />
          <strong>Phase 5:</strong> Optional Regional Expansion (15+ months):
          Launch &rdquo;Global Skills Track&rdquo; (basic English, Math, Science
          quizzes) 🌍, Offer flexible onboarding for regional markets 🛫.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          💰 Revenue & Sustainability Plan
        </h3>
        <p className="text-lg mb-6">
          <strong>Freemium Access:</strong> Free quizzes with optional upgrades
          (analytics, offline packs) 🆓.
          <br />
          <strong>Sponsored Rewards:</strong> Corporate sponsors for cash prizes
          and tournament events 🏆.
          <br />
          <strong>B2B Licensing:</strong> Packages for tuition centers, NGOs, or
          community programs 🏢.
          <br />
          <strong>Supporter Donations:</strong> Voluntary support from alumni,
          parents, or public backers 🎗️.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          ⚠️ Risks and Mitigation
        </h3>
        <p className="text-lg mb-6">
          <strong>Risk:</strong> Competition from existing apps.
          <br />
          <strong>Mitigation:</strong> Focus on gamification and rewards, not
          static content.
          <br />
          <strong>Risk:</strong> Low user retention.
          <br />
          <strong>Mitigation:</strong> Gamified loops, cash incentives, social
          recognition.
          <br />
          <strong>Risk:</strong> Abuse of prize system.
          <br />
          <strong>Mitigation:</strong> Fraud prevention through ID checks,
          randomized audits.
          <br />
          <strong>Risk:</strong> Funding shortages.
          <br />
          <strong>Mitigation:</strong> Early sponsorship and low-cost hosting
          strategies.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">📈 Success Metrics</h3>
        <p className="text-lg mb-6">
          <strong>Retention:</strong> 45% Day-2 retention among pilot users.
          <br />
          <strong>Engagement:</strong> 30 quizzes/user/week.
          <br />
          <strong>Growth:</strong> 1,000 monthly active users by Month 4.
          <br />
          <strong>Impact:</strong> 70% of active users show measurable academic
          improvement over 3 months.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">🔚 Conclusion</h3>
        <p className="text-lg mb-6">
          EduBridge addresses a critical gap in Malaysia&rsquo;s education
          ecosystem: the need for daily, engaging, rewarding, and low-data
          independent learning. Its initial launch in Malaysia gives it a clear
          target market with manageable competition. By validating user
          engagement and impact early, EduBridge can later expand to broader
          regions without losing focus.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">Next Steps ➡️</h3>
        <p className="text-lg mb-6">
          Finalize MVP specifications.
          <br />
          Build minimum content (Bahasa Melayu + Sejarah quizzes).
          <br />
          Prepare early reward pool fund.
          <br />
          Begin pilot partner outreach.
        </p>

        <h3 className="text-2xl font-bold mt-12 mb-4">🙌 Get Involved</h3>
        <p className="text-lg mb-6">
          Ready to empower students? Join EduBridge today and make a difference.
        </p>
        <button
          className="inline-block uppercase tracking-wide rounded-full shadow-md transition-all duration-300 ease-in-out px-6 py-3 sm:px-8 sm:py-3 bg-blue-500 text-white font-medium hover:bg-blue-600"
          onClick={() => router.push('/auth')}
        >
          Sign Up Now
        </button>
      </section>
    </>
  );
}
