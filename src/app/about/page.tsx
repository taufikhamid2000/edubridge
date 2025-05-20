'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';

export default function AboutPage() {
  // Check session on page load to prevent unintended logout
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        // If there's an authentication error, attempt to recover the session
        if (error) {
          const { recoverSession } = await import('@/lib/supabase');
          await recoverSession();
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkSession();
  }, []);

  const openResearchPDF = () => {
    window.open('/docs/EduBridge%20Research.pdf', '_blank');
  };

  return (
    <>
      <Head>
        <title>About EduBridge</title>
      </Head>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">About EduBridge</h1>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            EduBridge is a lightweight, gamified microlearning platform built to
            help Malaysian Form 4 and Form 5 students strengthen their academic
            skills through daily engagement. By offering fast, rewarding quiz
            experiences, EduBridge motivates students to build consistent study
            habits, earn recognition, and achieve measurable academic growth.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            The platform operates independently, without claiming alignment with
            any official examination board or curriculum.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2 text-blue-600 dark:text-blue-400">
                Learning Method
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Daily bite-sized quizzes covering key secondary school topics
                </li>
                <li>XP points earned for participation and mastery</li>
                <li>Streak rewards for consecutive daily engagement</li>
                <li>Weekly and monthly prizes to drive motivation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-blue-600 dark:text-blue-400">
                Platform Principles
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Mobile-first design</li>
                <li>Low-bandwidth usage</li>
                <li>Gamification at the core</li>
                <li>Independent and curriculum-neutral</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Learn More</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Want to dive deeper into the EduBridge concept and vision? Read our
            detailed research document:
          </p>
          <button
            onClick={openResearchPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Read Our Research Paper 📄
          </button>
        </section>
      </div>
    </>
  );
}
