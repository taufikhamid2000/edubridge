/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function StaticHomePage() {
  const [isParallaxEnabled, setIsParallaxEnabled] = useState(false);

  // Unified parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!isParallaxEnabled) return;
      document.documentElement.style.setProperty(
        '--scroll',
        window.pageYOffset.toString()
      );
    };

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsParallaxEnabled(!isMobile);

      if (isMobile) {
        document.documentElement.style.setProperty('--scroll', '0');
        window.removeEventListener('scroll', handleScroll);
      } else {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      }
    };

    // Initial setup
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Only add scroll listener if parallax is enabled
    if (isParallaxEnabled) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isParallaxEnabled]);

  return (
    <>
      <Head>
        <title>EduBridge Static - Learn, Compete, Succeed</title>
      </Head>

      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-8 md:px-20 overflow-hidden">
        {/* Static version banner */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500/20 text-white text-center py-2">
          📱 Static Version - Better for Mobile & Slow Connections
        </div>

        {/* Parallax decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white transform translate-y-[calc(var(--scroll)*0.2px)]"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white transform translate-y-[calc(var(--scroll)*-0.3px)]"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white transform translate-y-[calc(var(--scroll)*0.15px)]"></div>
          <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-white transform translate-y-[calc(var(--scroll)*-0.1px)]"></div>
          <div className="absolute bottom-1/3 left-1/5 w-24 h-24 rounded-full bg-white transform translate-y-[calc(var(--scroll)*0.25px)]"></div>
          <div className="absolute top-1/5 right-1/3 w-28 h-28 rounded-lg rotate-45 bg-white transform translate-y-[calc(var(--scroll)*0.13px)] opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 rounded-full bg-yellow-300 mix-blend-screen transform translate-y-[calc(var(--scroll)*-0.18px)] opacity-25"></div>
          <div className="absolute top-2/3 right-1/5 w-10 h-10 rounded-md bg-white transform translate-y-[calc(var(--scroll)*0.22px)] rotate-12"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
            <span className="inline-block">Edu</span>
            <span className="inline-block text-yellow-300">Bridge</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Earn up to RM1000 when you join EduBridge – and make your school
            proud!
          </p>{' '}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/static/dashboard"
              className="inline-block uppercase tracking-wide rounded-full shadow-lg transition-all duration-300 ease-in-out px-8 py-4 bg-white text-blue-600 font-medium hover:bg-gray-100 hover:scale-105 transform"
            >
              Access Dashboard 📚
            </Link>
            <Link
              href="/docs/EduBridge%20Research.pdf"
              target="_blank"
              className="inline-block uppercase tracking-wide rounded-full shadow-lg transition-all duration-300 ease-in-out px-8 py-4 bg-transparent border-2 border-white text-white font-medium hover:bg-white/10 hover:scale-105 transform"
            >
              Learn More 📄
            </Link>
          </div>
          {/* Stats preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 transform transition-all hover:scale-105">
              <div className="text-4xl font-bold text-yellow-300">1.1M+</div>
              <div className="text-sm mt-2">Malaysian Students</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 transform transition-all hover:scale-105">
              <div className="text-4xl font-bold text-yellow-300">30+</div>
              <div className="text-sm mt-2">Quizzes per Week</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 transform transition-all hover:scale-105">
              <div className="text-4xl font-bold text-yellow-300">70%</div>
              <div className="text-sm mt-2">Academic Improvement</div>
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="py-20 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16 relative">
          {/* About us parallax background */}
          <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-50/30 dark:bg-blue-900/5 rounded-full blur-3xl transform translate-y-[calc(var(--scroll)*0.06px)]"></div>
            <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-indigo-50/30 dark:bg-indigo-900/5 rounded-full blur-3xl transform translate-y-[calc(var(--scroll)*-0.04px)]"></div>
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4 dark:bg-blue-900/30 dark:text-blue-300 relative">
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full transform translate-y-[calc(var(--scroll)*0.25px)]"></span>
            ABOUT US
          </span>
          <h2 className="text-4xl font-bold mb-6">
            Welcome to{' '}
            <span className="text-blue-600 dark:text-blue-400 relative inline-block">
              EduBridge
            </span>
          </h2>
          <div className="h-1 w-20 bg-yellow-400 mx-auto"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-16 border border-gray-100 dark:border-gray-700 transform transition-all hover:shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                Earn up to RM1000 when you join EduBridge – and make your school
                proud!
              </h2>

              <p className="text-lg mb-6">
                EduBridge isn't just about preparing for your SPM – it's a
                revolution in how Malaysian students learn, compete, and get
                rewarded.
              </p>

              <p className="text-lg mb-6">
                As a Quiz Answerer, you'll complete quizzes, collect points, and
                climb the leaderboard. But this isn't just about personal glory:
                at the end of the year, the top students will win up to RM1000
                in cash prizes! Imagine walking into your exam hall knowing
                you've already scored a major win.
              </p>

              <p className="text-lg mb-6">
                But why stop at solo success? EduBridge lets you represent your
                school. Your points don't just boost your own ranking – they
                contribute to your school's total. Imagine Sekolah Menengah
                Kebangsaan Ayer Jernih outperforming MRSM Tawau. Pergh. The
                bragging rights would be legendary! Watch the leaderboard as
                your school rises through the ranks, bringing pride (yeah its
                impossible tho).
              </p>

              <p className="text-lg mb-6">
                And it's not just the students paying attention. KPM be like:
                "Alamak, this analytics says students from Klang, Selangor are
                actually far behind. What are they doing? Maybe we gotta send in
                some reinforcement." EduBridge doesn't just gamify studying – it
                generates real insights that spotlight where schools shine and
                where they need extra support.
              </p>

              <p className="text-lg mb-6">
                Here's the kicker: The KPM tried to switch away from exam-based
                education. Oh yeah? Watch this. EduBridge isn't just embracing
                exams – we're making them worth your time.
              </p>

              <p className="text-lg mb-6">
                If you've got a knack for creativity, become a Quiz Maker.
                Design quizzes that attract thousands of answers, and you'll
                earn real money. With ad engagement rates of RM2–RM6.50 per 1000
                attempts, your viral quizzes could generate hundreds – maybe
                even RM1000 or more. Yes, this one's open to all, not just
                students.
              </p>

              <p className="text-lg mb-6">
                Whether you're competing solo, representing your school, or
                creating quizzes, EduBridge is your chance to turn study time
                into earning time.
              </p>

              <p className="text-lg mb-6 font-semibold">
                Join EduBridge today. Master your subjects, make money, and
                maybe even watch your school crush the competition.
              </p>

              <p className="text-lg italic">
                "Hey Taufik, isn't this a scam?"
                <br />
                Yes. Yes it is. (For legal purposes, this is also a joke.)
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12 mt-20 relative">
          {/* Market info parallax elements */}
          <div className="absolute pointer-events-none -z-10 opacity-5">
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-green-500 transform translate-y-[calc(var(--scroll)*-0.05px)]"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-500 transform translate-y-[calc(var(--scroll)*0.05px)]"></div>
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-4 dark:bg-green-900/30 dark:text-green-300">
            OPPORTUNITY
          </span>
          <h3 className="text-3xl font-bold mb-6">Market Opportunity</h3>
          <div className="h-1 w-20 bg-yellow-400 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Market Overview
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>1.1 million</strong> students in Malaysian upper
                  secondary education (Form 4 and 5)
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Competitors focus on static notes or traditional AI tutors
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Current options lack proper engagement loops
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Gaps Identified
              </h4>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Limited tools combining quick learning ⚡, habit formation,
                  and tangible rewards 🏅
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Traditional apps are not mobile-data friendly, disadvantaging
                  B40 groups
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  No major platform currently gamifies daily subject mastery at
                  secondary school level
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mb-12 mt-20 relative">
          {/* Target users parallax elements */}
          <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-10 -left-5 w-20 h-20 rounded-lg bg-yellow-500/5 transform translate-y-[calc(var(--scroll)*0.1px)] rotate-12"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 rounded-lg bg-yellow-500/5 transform translate-y-[calc(var(--scroll)*-0.15px)] -rotate-12"></div>
            <div className="absolute -bottom-5 left-1/3 w-16 h-16 rounded-full bg-yellow-500/5 transform translate-y-[calc(var(--scroll)*0.08px)]"></div>
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-4 dark:bg-yellow-900/30 dark:text-yellow-300 relative">
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full transform translate-y-[calc(var(--scroll)*0.3px)]"></span>
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full transform translate-y-[calc(var(--scroll)*-0.3px)]"></span>
            AUDIENCE
          </span>
          <h3 className="text-3xl font-bold mb-6">🎯 Target Users</h3>
          <div className="h-1 w-20 bg-yellow-400 mx-auto mb-8 relative">
            <div className="absolute w-3 h-3 rounded-full bg-yellow-300 -left-4 -top-1 transform translate-y-[calc(var(--scroll)*-0.25px)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-100">
              Primary
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Form 4 and Form 5 students aiming to strengthen academic mastery
              📚
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-100">
              Secondary
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Students retaking secondary-level examinations 🔄
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center text-gray-800 dark:text-gray-100">
              Quiz Makers
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Educators and content creators looking to earn through quiz
              creation 💡
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Return to Main Site →
          </Link>
        </div>
      </section>
    </>
  );
}
