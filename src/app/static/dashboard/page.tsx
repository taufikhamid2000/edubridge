/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import EnhancedWelcomeBanner from '@/components/dashboard/EnhancedWelcomeBanner';
import SubjectSearch from '@/components/dashboard/SubjectSearch';
import SubjectGrid from '@/components/dashboard/SubjectGrid';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import Achievements from '@/components/dashboard/Achievements';
import { Subject } from '@/types/subject';

// Mock static data
const staticUser = {
  email: 'demo@example.com',
  display_name: 'Demo User',
  streak: 7,
  xp: 1500,
  level: 5,
  lastQuizDate: new Date().toISOString().split('T')[0],
};

const staticSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    slug: 'mathematics',
    description:
      'Master fundamental mathematical concepts and problem-solving skills',
    icon: '📐',
    category: 'Core Subjects',
  },
  {
    id: '2',
    name: 'Physics',
    slug: 'physics',
    description: 'Explore the laws that govern our universe',
    icon: '⚡',
    category: 'Science',
  },
  {
    id: '3',
    name: 'Chemistry',
    slug: 'chemistry',
    description: 'Study matter, its properties, and transformations',
    icon: '🧪',
    category: 'Science',
  },
  {
    id: '4',
    name: 'Biology',
    slug: 'biology',
    description: 'Discover the science of life and living organisms',
    icon: '🧬',
    category: 'Science',
  },
  {
    id: '5',
    name: 'History',
    slug: 'history',
    description: 'Learn about key events and figures that shaped our world',
    icon: '📚',
    category: 'Humanities',
  },
  {
    id: '6',
    name: 'Geography',
    slug: 'geography',
    description: "Study Earth's landscapes, environments, and societies",
    icon: '🌍',
    category: 'Humanities',
  },
];

const staticAchievements = [
  {
    title: 'Quiz Master',
    description: 'Complete 10 quizzes in a week',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'High Scorer',
    description: 'Score above 90% in 5 quizzes',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Consistent Learner',
    description: 'Maintain a 7-day streak',
    bgColor: 'bg-yellow-100',
  },
];

export default function StaticDashboardPage() {
  const router = useRouter();
  const categories = ['all', 'Core Subjects', 'Science', 'Humanities'];
  const handleSubjectClick = (subject: Subject) => {
    router.push('/static/subjects');
  };

  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
      <div className="sticky top-0 z-10 bg-gray-900 dark:bg-white py-2 px-4 -mx-4 sm:-mx-6 md:-mx-8 mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 dark:text-gray-600">
              ⚡ Static version for offline access
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Back to online version
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Welcome Section */}
        <EnhancedWelcomeBanner initialUser={staticUser} isStatic={true} />

        {/* Subjects Section */}
        <section id="subjects-section">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 md:mb-0">
              Subjects
            </h2>
          </div>

          <SubjectSearch
            searchTerm=""
            selectedCategory="all"
            categories={categories}
            handleSearchChange={() => {}}
            handleCategoryChange={() => {}}
          />

          {/* Subjects Grid with Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Showing {staticSubjects.length} subjects
            </p>
          </div>

          <SubjectGrid
            subjects={staticSubjects}
            error={null}
            currentPage={1}
            totalPages={1}
            handleSubjectClick={handleSubjectClick}
            handlePageChange={() => {}}
          />
        </section>

        {/* Weekly Progress Section */}
        <WeeklyProgress
          quizzesCompleted={7}
          quizzesTotal={10}
          averageScore={85}
        />

        {/* Recent Achievements Section */}
        <Achievements achievements={staticAchievements} isStatic={true} />
      </div>
    </main>
  );
}
