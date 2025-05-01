import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

      <main className="container py-8">
        <div className="flex flex-col gap-12">
          {/* Welcome Section */}
          <section className="dashboard-section welcome">
            <div>
              <h1>Welcome back, {user?.email}</h1>
              <p>Ready to continue your learning journey?</p>
            </div>
          </section>

          {/* Subjects Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Subjects</h2>
            <div className="flex overflow-x-auto gap-6 scrollbar-hide">
              {error ? (
                <div className="text-red-500 bg-red-100 p-4 rounded">
                  Error loading subjects: {error}
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center p-4">
                  <p>No subjects available yet. Please check back later.</p>
                </div>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer min-w-[250px]"
                    onClick={() => handleSubjectClick(subject.slug)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{subject.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-dashboard-blue">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600">
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
          <section className="dashboard-section progress">
            <h2>Weekly Progress</h2>
            <div>
              <div>Quizzes This Week</div>
              <div>Average Score</div>
            </div>
          </section>

          {/* Recent Achievements Section */}
          <section className="dashboard-section achievements">
            <h2>Recent Achievements</h2>
            <div>Achievement Cards</div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
