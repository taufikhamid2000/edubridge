import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number | null;
  time_estimate_minutes: number | null;
  order_index: number;
}

interface Chapter {
  id: string;
  form: number;
  title: string;
  order_index: number;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Quiz {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  verified: boolean;
}

interface QuizWithEmail extends Quiz {
  email: string; // Directly include the email field from the view
}

export default function TopicQuiz() {
  const router = useRouter();
  const { subject, topic } = router.query;
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [topicData, setTopicData] = useState<Topic | null>(null);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [quizzes, setQuizzes] = useState<QuizWithEmail[]>([]);

  // Updated useEffect to wait for router.query to be populated
  useEffect(() => {
    if (!router.isReady || !subject || !topic) {
      console.warn('Router query not ready or missing subject/topic');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching subject data for:', subject);
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('slug', subject)
          .single();

        if (subjectError) {
          console.error('Error fetching subject data:', subjectError);
          throw subjectError;
        }
        setSubjectData(subjectData);

        console.log('Fetching topic data for:', topic);
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*, chapters(*)')
          .eq('id', topic)
          .single();

        if (topicError) {
          console.error('Error fetching topic data:', topicError);
          throw topicError;
        }
        setTopicData(topicData);
        setChapterData(topicData.chapters);

        console.log('Fetching quizzes for topic:', topic);
        console.log('Reintroducing join with auth.identities to fetch email');

        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes_with_email')
          .select('*')
          .eq('topic_id', topic)
          .neq('created_by', null)
          .neq('created_by', '')
          .ilike('created_by', '%-%-%-%-%');

        if (quizzesError) {
          console.error(
            'Error fetching quizzes after filtering invalid created_by:',
            quizzesError
          );
          throw quizzesError;
        }

        setQuizzes(quizzesData as QuizWithEmail[]);

        console.log('Fetched data:', {
          subjectData,
          topicData,
          chapterData: topicData.chapters,
          quizzes: quizzesData,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, subject, topic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--color-subtext)]">Loading topic...</div>
      </div>
    );
  }

  if (!subjectData || !topicData || !chapterData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--color-subtext)]">Topic not found</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{topicData.title} · Topic</title>
      </Head>
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{subjectData.name}</h1>
            <h2 className="text-2xl font-semibold text-[var(--color-accent)]">
              Form {chapterData.form} · {chapterData.title}
            </h2>
            <h3 className="text-xl font-medium mt-4">{topicData.title}</h3>
            {topicData.description && (
              <p className="text-[var(--color-subtext)] mt-2">
                {topicData.description}
              </p>
            )}
            <div className="flex gap-4 mt-4">
              {topicData.difficulty_level && (
                <div className="flex items-center gap-1">
                  <span className="text-[var(--color-subtext)]">
                    Difficulty:
                  </span>
                  <span>
                    {Array(topicData.difficulty_level).fill('⭐').join('')}
                  </span>
                </div>
              )}
              {topicData.time_estimate_minutes && (
                <div className="flex items-center gap-1">
                  <span className="text-[var(--color-subtext)]">Time:</span>
                  <span>{topicData.time_estimate_minutes} minutes</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th>Name</th>
                  <th>Created by</th>
                  <th>Created at</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.name}</td>
                    <td>{quiz.email?.split('@')[0] || 'Unknown'}</td>{' '}
                    {/* Updated to use email */}
                    <td>{new Date(quiz.created_at).toLocaleDateString()}</td>
                    <td
                      className={
                        quiz.verified ? 'text-verified' : 'text-unverified'
                      }
                    >
                      {quiz.verified ? 'Verified' : 'Unverified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-justify-end-gap">
            <button
              className="create-quiz-btn"
              onClick={() =>
                router.push(
                  `/quiz/${subject}/${topic}/create?chapter=${chapterData?.title}`
                )
              }
            >
              Create a Quiz
            </button>
            <button
              className="create-quiz-btn"
              onClick={() => {
                const descriptionPrompt = `Generate a description for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
                const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(descriptionPrompt)}`;
                window.open(chatGPTUrl, '_blank');
              }}
            >
              Generate Description with AI
            </button>
            <button
              className="create-quiz-btn"
              onClick={() => {
                const quizPrompt = `Generate a quiz for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
                const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(quizPrompt)}`;
                window.open(chatGPTUrl, '_blank');
              }}
            >
              Generate Quiz with AI
            </button>
          </div>

          {/* Quiz content will go here */}
          <div className="bg-[var(--color-card-bg)] rounded-[var(--border-radius)] p-8 shadow">
            <p className="text-[var(--color-subtext)] text-center">
              Quiz content for this topic is coming soon!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
