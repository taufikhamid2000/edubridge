/* eslint-disable react/no-unescaped-entities */
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
      <div className="bg-gradient-to-r from-red-500 to-blue-600 text-white py-16 px-8 md:px-20 text-center">
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

      <section className="py-16 px-8 md:ml-24 md:mr-24 text-left">
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
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Overview:</strong> Malaysia has approximately 1.1 million
            students in upper secondary education (Form 4 and Form 5 combined).
          </li>
          <li>
            Existing solutions (JomStudy, EduBijak) focus heavily on static
            notes or traditional AI tutors, often lacking engagement loops.
          </li>
        </ul>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Gaps Identified:</strong> Limited tools combining quick
            learning ⚡, habit formation, and tangible rewards 🏅.
          </li>
          <li>
            Traditional, resource-heavy apps are not mobile-data friendly,
            disadvantaging B40 groups.
          </li>
          <li>
            No major platform currently gamifies daily subject mastery at the
            secondary school level.
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-12 mb-4">🎯 Target Users</h3>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Primary:</strong> Form 4 and Form 5 students aiming to
            strengthen academic mastery 📚.
          </li>
          <li>
            <strong>Secondary:</strong> Students retaking secondary-level
            examinations 🔄.
          </li>
          <li>
            <strong>Tertiary:</strong> Parents and teachers seeking
            complementary study tools for their children or students 👨‍🏫.
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-12 mb-4">💡 Core Concept</h3>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Learning Method:</strong> Daily bite-sized quizzes covering
            key secondary school topics ❓.
          </li>
          <li>XP points earned for participation and mastery ✨.</li>
          <li>Streak rewards for consecutive daily engagement 🔥.</li>
          <li>Weekly and monthly cash prizes to drive motivation 💰.</li>
        </ul>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Platform Principles:</strong> Mobile-first 📱, Low-bandwidth
            usage 🌐, Gamification at the core 🎮, Independent and
            curriculum-neutral 🔍.
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          📅 Phase-by-Phase Plan
        </h3>
        <ol className="list-decimal list-inside text-lg mb-6">
          <li>
            <strong>Phase 1:</strong> MVP Development (0-4 months): Bahasa
            Melayu and Sejarah modules, XP, streak, leaderboard systems, Pilot
            version tested internally 🧪.
          </li>
          <li>
            <strong>Phase 2:</strong> Pilot Testing (4-6 months): Soft-launch
            with 2–3 schools 🏫, Target 100–500 students 🎯, Measure Day-2
            retention, weekly engagement 📊.
          </li>
          <li>
            <strong>Phase 3:</strong> Expansion (6–9 months): Add new subjects
            (Mathematics, Science) ➕, Improve UX based on pilot feedback 🔄.
          </li>
          <li>
            <strong>Phase 4:</strong> Malaysia-Wide Launch (9-15 months):
            Regional marketing efforts 📣, Introduce first formal sponsorship
            programs 🤝.
          </li>
          <li>
            <strong>Phase 5:</strong> Optional Regional Expansion (15+ months):
            Launch "Global Skills Track" (basic English, Math, Science quizzes)
            🌍, Offer flexible onboarding for regional markets 🛫.
          </li>
        </ol>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          💰 Revenue & Sustainability Plan
        </h3>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Freemium Access:</strong> Free quizzes with optional
            upgrades (analytics, offline packs) 🆓.
          </li>
          <li>
            <strong>Sponsored Rewards:</strong> Corporate sponsors for cash
            prizes and tournament events 🏆.
          </li>
          <li>
            <strong>B2B Licensing:</strong> Packages for tuition centers, NGOs,
            or community programs 🏢.
          </li>
          <li>
            <strong>Supporter Donations:</strong> Voluntary support from alumni,
            parents, or public backers 🎗️.
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-12 mb-4">
          ⚠️ Risks and Mitigation
        </h3>
        <ul className="list-disc list-inside text-lg mb-6">
          <li>
            <strong>Risk:</strong> Competition from existing apps.{' '}
            <strong>Mitigation:</strong> Focus on gamification and rewards, not
            static content.
          </li>
          <li>
            <strong>Risk:</strong> Low user retention.{' '}
            <strong>Mitigation:</strong> Gamified loops, cash incentives, social
            recognition.
          </li>
          <li>
            <strong>Risk:</strong> Abuse of prize system.{' '}
            <strong>Mitigation:</strong> Fraud prevention through ID checks,
            randomized audits.
          </li>
          <li>
            <strong>Risk:</strong> Funding shortages.{' '}
            <strong>Mitigation:</strong> Early sponsorship and low-cost hosting
            strategies.
          </li>
        </ul>

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
