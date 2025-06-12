'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function StaticAboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white dark:bg-gray-800 bg-opacity-70 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/static" className="flex items-center">
            <Image
              src="/favicon.ico"
              alt="EduBridge Logo"
              width={32}
              height={32}
              className="w-8 h-8 mr-2"
            />
            <span className="text-xl font-bold">EduBridge</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6">About EduBridge</h1>

          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p>
              EduBridge is an innovative educational platform designed to bridge
              the gap between traditional learning and modern technology. Our
              mission is to make quality education accessible to everyone,
              anywhere in the world.
            </p>

            <div>
              <h2 className="text-xl font-semibold mb-3">Our Vision</h2>
              <p>
                We envision a world where quality education is not limited by
                geographical or economic barriers. Through our platform, we aim
                to create a global community of learners and educators who can
                share knowledge and experiences freely.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Key Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interactive learning experiences</li>
                <li>Comprehensive course materials</li>
                <li>Progress tracking and analytics</li>
                <li>Community-driven content</li>
                <li>Mobile-friendly platform</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">
                Research-Backed Approach
              </h2>
              <p>
                Our platform is built on extensive research in educational
                technology and learning methodologies. We continuously refine
                our approach based on user feedback and academic research.
              </p>
              <div className="mt-4">
                <Link
                  href="/docs/EduBridge%20Research.pdf"
                  className="text-blue-500 hover:underline flex items-center"
                  target="_blank"
                >
                  📄 Read our research paper
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Get Started</h2>
              <p>
                Ready to start learning? Check out our{' '}
                <Link
                  href="/static/courses"
                  className="text-blue-500 hover:underline"
                >
                  course catalog
                </Link>{' '}
                or{' '}
                <Link href="/" className="text-blue-500 hover:underline">
                  return to the main site
                </Link>{' '}
                for the full interactive experience.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
