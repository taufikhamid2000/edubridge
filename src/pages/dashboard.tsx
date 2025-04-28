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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--color-subtext)]">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>EduBridge · Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />

      <main className="container py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome & Progress Section */}
          <section className="bg-[var(--color-card-bg)] rounded-[var(--border-radius)] p-8 shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold mb-2">
                  Welcome back, {user?.email}
                </h1>
                <p className="text-[var(--color-subtext)]">
                  Choose a subject to start learning
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)]">
                    {user?.streak}
                  </div>
                  <div className="text-sm text-[var(--color-subtext)]">
                    Day Streak
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)]">
                    {user?.level}
                  </div>
                  <div className="text-sm text-[var(--color-subtext)]">
                    Level
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-accent)]">
                    {user?.xp}
                  </div>
                  <div className="text-sm text-[var(--color-subtext)]">
                    Total XP
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Subjects Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error ? (
              <div className="col-span-2 text-red-500 bg-red-100 p-4 rounded">
                Error loading subjects: {error}
              </div>
            ) : subjects.length === 0 ? (
              <div className="col-span-2 text-center p-4">
                <p className="text-[var(--color-subtext)]">
                  No subjects available yet.
                </p>
                <p className="text-sm mt-2">
                  Please check back later or contact support if this persists.
                </p>
              </div>
            ) : (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-[var(--color-card-bg)] rounded-[var(--border-radius)] p-8 shadow cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSubjectClick(subject.slug)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{subject.icon}</div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        {subject.name}
                      </h2>
                      <p className="text-[var(--color-subtext)]">
                        {subject.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Weekly Progress */}
          <section className="bg-[var(--color-card-bg)] rounded-[var(--border-radius)] p-8 shadow">
            <h2 className="text-xl font-semibold mb-6">Weekly Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-alt)] rounded-lg">
                <div>
                  <p className="font-medium">Quizzes This Week</p>
                  <p className="text-[var(--color-subtext)] text-sm">
                    8/10 completed
                  </p>
                </div>
                <span className="text-[var(--color-subtext)]">80%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-alt)] rounded-lg">
                <div>
                  <p className="font-medium">Average Score</p>
                  <p className="text-[var(--color-subtext)] text-sm">7.5/10</p>
                </div>
                <span className="text-[var(--color-subtext)]">
                  +0.5 from last week
                </span>
              </div>
            </div>
          </section>

          {/* Recent Achievements */}
          <section className="bg-[var(--color-card-bg)] rounded-[var(--border-radius)] p-8 shadow">
            <h2 className="text-xl font-semibold mb-6">Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: '5-Day Streak',
                  description: 'Maintained streak for 5 days',
                  date: 'Today',
                },
                {
                  title: 'Quick Learner',
                  description: 'Completed 10 quizzes in one day',
                  date: 'Yesterday',
                },
                {
                  title: 'Subject Master',
                  description: 'Scored 90% in Bahasa Melayu',
                  date: '2 days ago',
                },
              ].map((achievement, index) => (
                <div
                  key={index}
                  className="flex flex-col p-4 bg-[var(--color-bg-alt)] rounded-lg"
                >
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-[var(--color-subtext)] text-sm">
                    {achievement.description}
                  </p>
                  <span className="text-[var(--color-subtext)] text-sm mt-2">
                    {achievement.date}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
