/* eslint-disable react/no-unescaped-entities */
'use client';

import Head from 'next/head';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | EduBridge</title>
      </Head>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="mb-4 italic text-gray-600 dark:text-gray-400 text-center">
            Last Updated: May 18, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300">
              EduBridge ("we", "our", or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, and
              share information about you when you use our website, mobile
              application, and services (collectively, the "Services").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium mb-2 text-blue-600 dark:text-blue-400">
              2.1 Information You Provide
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-700 dark:text-gray-300">
              <li>Create an account (name, email address, password)</li>
              <li>Complete your profile (school, grade level)</li>
              <li>Participate in quizzes and educational activities</li>
              <li>Contact our support team</li>
            </ul>

            <h3 className="text-xl font-medium mb-2 text-blue-600 dark:text-blue-400">
              2.2 Automatically Collected Information
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              When you use our Services, we automatically collect certain
              information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Device information (device type, operating system)</li>
              <li>Log information (access times, pages viewed)</li>
              <li>Usage statistics (quiz completion, streak data)</li>
              <li>Performance data (response times, error rates)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">
              3. How We Use Your Information
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Provide, maintain, and improve our Services</li>
              <li>Create and maintain your account</li>
              <li>
                Track your progress and provide personalized learning
                experiences
              </li>
              <li>
                Send you technical notices, updates, and administrative messages
              </li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent security incidents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">
              4. Data Sharing and Disclosure
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                With service providers who need access to such information to
                carry out work on our behalf
              </li>
              <li>
                In response to a request for information if we believe
                disclosure is required by law
              </li>
              <li>
                If we believe your actions are inconsistent with our user
                agreements or policies
              </li>
              <li>
                To protect the rights, property, and safety of EduBridge or
                others
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact us at privacy@edubridge.example.com.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
