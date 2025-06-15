'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Using a simple arrow character instead of HeroIcons
interface ArrowLeftIconProps {
  className?: string;
}

const ArrowLeftIcon = ({ className = 'w-6 h-6' }: ArrowLeftIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const STATIC_CHAPTERS = [
  {
    id: '1',
    title: 'Chapter 1: Fundamentals',
    description: 'Master the basic concepts and foundational principles',
    quizCount: 5,
    progress: 80,
  },
  {
    id: '2',
    title: 'Chapter 2: Intermediate Topics',
    description:
      'Explore more advanced concepts and problem-solving techniques',
    quizCount: 4,
    progress: 60,
  },
  {
    id: '3',
    title: 'Chapter 3: Advanced Applications',
    description: 'Apply your knowledge to complex real-world scenarios',
    quizCount: 6,
    progress: 30,
  },
  {
    id: '4',
    title: 'Chapter 4: Practice Problems',
    description:
      'Test your understanding with comprehensive practice exercises',
    quizCount: 8,
    progress: 0,
  },
];

const SUBJECT_DETAILS = {
  mathematics: {
    name: 'Mathematics',
    icon: '📐',
    description:
      'Master fundamental mathematical concepts and problem-solving skills',
  },
  physics: {
    name: 'Physics',
    icon: '⚡',
    description: 'Explore the laws that govern our universe',
  },
  chemistry: {
    name: 'Chemistry',
    icon: '🧪',
    description: 'Study matter, its properties, and transformations',
  },
  biology: {
    name: 'Biology',
    icon: '🧬',
    description: 'Discover the science of life and living organisms',
  },
  history: {
    name: 'History',
    icon: '📚',
    description: 'Learn about key events and figures that shaped our world',
  },
  geography: {
    name: 'Geography',
    icon: '🌍',
    description: "Study Earth's landscapes, environments, and societies",
  },
};

interface StaticQuizPageProps {
  params: Promise<{ subjectSlug: string }>;
}

export default function StaticQuizPage({ params }: StaticQuizPageProps) {
  const { subjectSlug } = React.use(params);
  const router = useRouter();
  const subject = SUBJECT_DETAILS[subjectSlug as keyof typeof SUBJECT_DETAILS];

  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Subject Not Found
          </h1>
          <p className="text-gray-400 dark:text-gray-600 mb-6">
            The subject you are looking for does not exist in the static
            version.
          </p>
          <Link
            href="/static/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button and Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/static/dashboard')}
          className="mb-4 flex items-center text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{subject.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {subject.name}
          </h1>
        </div>
        <p className="text-gray-400 dark:text-gray-600">
          {subject.description}
        </p>
      </div>

      {/* Chapters Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {STATIC_CHAPTERS.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-gray-800 dark:bg-white rounded-lg shadow-md border border-gray-700 dark:border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {chapter.title}
            </h3>
            <p className="text-gray-400 dark:text-gray-600 mb-4">
              {chapter.description}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {chapter.quizCount} quizzes
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {chapter.progress}% complete
              </span>
            </div>
            <div className="w-full bg-gray-700 dark:bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${chapter.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Notice */}
      <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        This is a static preview page. The same content is shown for all
        subjects in the demo version.
      </div>
    </div>
  );
}
