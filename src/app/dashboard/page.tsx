'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect';
import Stopwatch from '@/components/Stopwatch';

// Import dashboard components
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import SubjectSearch from '@/components/dashboard/SubjectSearch';
import SubjectGrid from '@/components/dashboard/SubjectGrid';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import Achievements from '@/components/dashboard/Achievements';

interface User {
  email: string;
  display_name?: string;
  streak: number;
  xp: number;
  level: number;
  lastQuizDate: string;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  category_priority?: number;
  order_index?: number;
}

function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const subjectsPerPage = 6;

  // Use OAuth redirect hook to handle clean URLs after OAuth
  const { cleanUrlTokens } = useOAuthRedirect('/dashboard');

  useEffect(() => {
    // Set a 30 second timeout
    const timeoutId = setTimeout(() => {
      setError(
        'Connection timeout. Please refresh the page or check your internet connection.'
      );
      setLoading(false);
    }, 30000);

    const fetchData = async () => {
      try {
        // Clean URL tokens immediately if present
        cleanUrlTokens();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error('Session error:', sessionError);
          setError('Authentication error. Please try logging in again.');
          router.replace('/auth');
          return;
        }

        if (!session) {
          logger.info('No active session, redirecting to auth');
          router.replace('/auth');
          return;
        }

        // Clear timeout since we got past auth
        clearTimeout(timeoutId);

        try {
          // Fetch subjects from Supabase
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .order('order_index', { ascending: true });

          if (subjectsError) {
            throw subjectsError;
          }

          // Create a sorted copy of the subjects data
          const sortedSubjects = [...(subjectsData || [])].sort((a, b) => {
            const priorityA = a.category_priority ?? 999;
            const priorityB = b.category_priority ?? 999;
            return priorityA - priorityB;
          });

          setSubjects(sortedSubjects);

          // Extract unique categories
          const uniqueCategories = [
            'all',
            ...new Set(
              sortedSubjects.map((s) => s.category || 'Uncategorized')
            ),
          ];
          setCategories(uniqueCategories);

          // Fetch user profile
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            throw userError;
          }

          // Use profile data if available, or create default data
          setUser({
            email: session.user.email || '',
            display_name: userData?.display_name,
            streak: userData?.streak || 0,
            xp: userData?.xp || 0,
            level: userData?.level || 1,
            lastQuizDate:
              userData?.last_quiz_date ||
              new Date().toISOString().split('T')[0],
          });
        } catch (error) {
          logger.error('Error fetching data:', error);
          setError(
            error instanceof Error
              ? error.message
              : 'An error occurred loading your dashboard'
          );
        }
      } catch (error) {
        logger.error('Error in dashboard:', error);
        setError('Unable to load dashboard. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => clearTimeout(timeoutId);
  }, [router, cleanUrlTokens]);

  const handleSubjectClick = (subject: Subject) => {
    router.push(`/quiz/${subject.slug}/chapters`);
  };

  // Filter subjects based on search query and selected category
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      (subject.category || 'Uncategorized') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(
    indexOfFirstSubject,
    indexOfLastSubject
  );
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of subjects section
    document
      .getElementById('subjects-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  // Event handlers for search and category selection
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Achievement data
  const achievements = [
    {
      title: 'Quiz Master',
      description: 'Completed 10 quizzes in a week',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'High Scorer',
      description: 'Scored above 90% in 5 quizzes',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Consistent Learner',
      description: 'Maintained a 7-day streak',
      bgColor: 'bg-yellow-100',
    },
  ];
  if (loading) {
    return (
      <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <p className="text-lg text-blue-800 dark:text-blue-200">
              Loading your dashboard...
            </p>
            <p className="text-sm mt-2 text-blue-600 dark:text-blue-300">
              🚀 Connecting to Supabase
            </p>
            <Stopwatch />
            <p className="text-xs mt-2 text-blue-500 dark:text-blue-400">
              If this takes too long, try refreshing the page
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 rounded-lg bg-red-100 dark:bg-red-900/30">
            <p className="text-lg text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Welcome Section */} <WelcomeBanner user={user} />
        {/* Random Quizzes Section */}
        {/* Subjects Section with Search and Filters */}
        <section id="subjects-section">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 md:mb-0">
              Subjects
            </h2>
          </div>

          <SubjectSearch
            searchTerm={searchQuery}
            selectedCategory={selectedCategory}
            categories={categories}
            handleSearchChange={handleSearchChange}
            handleCategoryChange={handleCategoryChange}
          />

          {/* Subjects Grid with Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {currentSubjects.length} of {filteredSubjects.length}{' '}
              subjects
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
          </div>

          <SubjectGrid
            subjects={currentSubjects}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            handleSubjectClick={handleSubjectClick}
            handlePageChange={handlePageChange}
          />
        </section>
        {/* Weekly Progress Section */}
        <WeeklyProgress
          quizzesCompleted={7}
          quizzesTotal={10}
          averageScore={85}
        />
        {/* Recent Achievements Section */}
        <Achievements achievements={achievements} />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <DashboardClient />;
}
