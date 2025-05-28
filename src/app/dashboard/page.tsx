'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useOAuthRedirect } from '@/hooks/useOAuthRedirect';

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

  // State for search, pagination, and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const subjectsPerPage = 6;

  // Use OAuth redirect hook to handle clean URLs after OAuth
  const { cleanUrlTokens } = useOAuthRedirect('/dashboard');

  useEffect(() => {
    // Clean URL tokens immediately if present
    cleanUrlTokens();

    const fetchData = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('Session error:', sessionError);
        router.replace('/auth');
        return;
      }

      if (!session) {
        router.replace('/auth');
        return;
      }

      try {
        logger.log('Fetching subjects from Supabase...');
        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('order_index', { ascending: true });

        if (subjectsError) {
          logger.error('Error fetching subjects:', subjectsError);
          setError(subjectsError.message);
          throw subjectsError;
        } // Create a sorted copy of the subjects data
        const sortedSubjects = [...(subjectsData || [])];

        // Sort the subjects array using the category_priority field from the database
        sortedSubjects.sort((a, b) => {
          // First, try to sort by category_priority if present
          const priorityA = a.category_priority ?? 999;
          const priorityB = b.category_priority ?? 999;

          // First sort by category priority
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Then sort by the existing order_index within the same category
          return (a.order_index || 0) - (b.order_index || 0);
        });
        logger.log('Subjects data sorted:', sortedSubjects);
        setSubjects(sortedSubjects);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            sortedSubjects.map((subject) => subject.category || 'Uncategorized')
          )
        ) as string[];
        setCategories(['all', ...uniqueCategories]); // Fetch user profile data from Supabase
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('display_name, streak, xp, level, last_quiz_date')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          // PGRST116 means no profile found, which we'll handle by creating default data
          logger.error('Error fetching user profile:', userError);
        }

        // Use profile data if available, or create default data
        setUser({
          email: session.user.email || '',
          display_name: userData?.display_name,
          streak: userData?.streak || 0,
          xp: userData?.xp || 0,
          level: userData?.level || 1,
          lastQuizDate:
            userData?.last_quiz_date || new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        logger.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, cleanUrlTokens]);

  const handleSubjectClick = (slug: string) => {
    router.push(`/quiz/${slug}/chapters`);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
        {/* Welcome Section */}
        <WelcomeBanner user={user} />

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
