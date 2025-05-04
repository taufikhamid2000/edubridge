import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

interface User {
  email: string;
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
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
        return;
      }

      try {
        console.log('Fetching subjects from Supabase...');
        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('order_index', { ascending: true });

        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
          setError(subjectsError.message);
          throw subjectsError;
        }

        console.log('Subjects data received:', subjectsData);
        setSubjects(subjectsData || []);

        // TODO: Fetch user data from Supabase
        setUser({
          email: session.user.email || '',
          streak: 5,
          xp: 1250,
          level: 3,
          lastQuizDate: new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubjectClick = (slug: string) => {
    router.push(`/quiz/${slug}/chapters`);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>EduBridge · Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <main className="container mx-auto py-6 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
          {/* Welcome Section */}
          <section className="dashboard-section welcome bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Welcome back, {user?.email}
              </h1>
              <p className="text-base sm:text-lg">
                Ready to continue your learning journey?
              </p>
              <p className="mt-4 text-sm sm:text-base">
                Your current streak: <strong>{user?.streak} days</strong>
              </p>
            </div>
          </section>

          {/* Subjects Section */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
              Subjects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {error ? (
                <div className="text-red-500 bg-red-100 p-3 sm:p-4 rounded dark:bg-red-900">
                  Error loading subjects: {error}
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center p-3 sm:p-4 dark:text-gray-300">
                  <p>No subjects available yet. Please check back later.</p>
                </div>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:text-gray-200"
                    onClick={() => handleSubjectClick(subject.slug)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-3xl sm:text-4xl">{subject.icon}</div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-dashboard-blue">
                          {subject.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {subject.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Weekly Progress Section */}
          <section className="dashboard-section progress bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              Weekly Progress
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Quizzes This Week</span>
                <div className="w-2/3 bg-gray-300 rounded-full h-3 sm:h-4 dark:bg-gray-700">
                  <div
                    className="bg-blue-500 h-3 sm:h-4 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
                <span className="text-sm sm:text-base">7/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base">Average Score</span>
                <div className="w-2/3 bg-gray-300 rounded-full h-3 sm:h-4 dark:bg-gray-700">
                  <div
                    className="bg-green-500 h-3 sm:h-4 rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <span className="text-sm sm:text-base">85%</span>
              </div>
            </div>
          </section>

          {/* Recent Achievements Section */}
          <section className="dashboard-section achievements bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              Recent Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="achievement-card bg-blue-100 p-3 sm:p-4 rounded-lg shadow dark:bg-blue-900">
                <h3 className="text-base sm:text-lg font-semibold">
                  Quiz Master
                </h3>
                <p className="text-xs sm:text-sm">
                  Completed 10 quizzes in a week
                </p>
              </div>
              <div className="achievement-card bg-green-100 p-3 sm:p-4 rounded-lg shadow dark:bg-green-900">
                <h3 className="text-base sm:text-lg font-semibold">
                  High Scorer
                </h3>
                <p className="text-xs sm:text-sm">
                  Scored above 90% in 5 quizzes
                </p>
              </div>
              <div className="achievement-card bg-yellow-100 p-3 sm:p-4 rounded-lg shadow dark:bg-yellow-900">
                <h3 className="text-base sm:text-lg font-semibold">
                  Consistent Learner
                </h3>
                <p className="text-xs sm:text-sm">Maintained a 7-day streak</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
