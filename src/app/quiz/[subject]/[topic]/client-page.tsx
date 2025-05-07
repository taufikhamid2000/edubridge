/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/debug';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  difficulty_level: number | null;
  time_estimate_minutes: number | null;
  order_index: number;
  chapters: Chapter;
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
  topic_id: string;
  email?: string;
}

// Error component with dark mode support
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md max-w-full">
      <h2 className="font-bold mb-2">Error</h2>
      <p>{message}</p>
    </div>
  </div>
);

// Loading component with dark mode support
const LoadingDisplay = () => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="text-[var(--color-subtext)]">
      <div className="animate-pulse">Loading topic data...</div>
    </div>
  </div>
);

// Extracted quiz table with dark mode and mobile responsive design
const QuizTable = ({ quizzes }: { quizzes: Quiz[] }) => (
  <div className="mt-6 overflow-x-auto rounded-lg shadow">
    <table className="table-auto w-full">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left hidden sm:table-cell">
            Created by
          </th>
          <th className="px-4 py-2 text-left hidden md:table-cell">
            Created at
          </th>
          <th className="px-4 py-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {quizzes.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="text-center py-4 text-gray-500 dark:text-gray-400"
            >
              No quizzes available for this topic yet
            </td>
          </tr>
        ) : (
          quizzes.map((quiz, index) => (
            <tr
              key={`${quiz.id}-${index}`}
              className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            >
              <td className="px-4 py-3">{quiz.name}</td>
              <td className="px-4 py-3 hidden sm:table-cell">
                {quiz.email?.split('@')[0] || 'Unknown'}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {new Date(quiz.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    quiz.verified
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                  }`}
                >
                  {quiz.verified ? 'Verified' : 'Unverified'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// Action buttons component with dark mode and responsive design
const ActionButtons = ({
  subjectData,
  topicData,
  chapterData,
  subject,
  topic,
}: {
  subjectData: Subject | null;
  topicData: Topic | null;
  chapterData: Chapter | null;
  subject: string;
  topic: string;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3 my-6 justify-center sm:justify-end">
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() =>
          router.push(
            `/quiz/${subject}/${topic}/create?chapter=${chapterData?.title}`
          )
        }
      >
        Create a Quiz
      </button>
      <button
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() => {
          const descriptionPrompt = `Generate a description for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
          const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(descriptionPrompt)}`;
          window.open(chatGPTUrl, '_blank');
        }}
      >
        Generate Description with AI
      </button>
      <button
        className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() => {
          const quizPrompt = `Generate a quiz for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
          const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(quizPrompt)}`;
          window.open(chatGPTUrl, '_blank');
        }}
      >
        Generate Quiz with AI
      </button>
    </div>
  );
};

// Client component that receives subject and topic as props
export default function ClientTopicPage({
  subject,
  topic,
}: {
  subject: string;
  topic: string;
}): ReactNode {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [topicData, setTopicData] = useState<Topic | null>(null);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!subject || !topic) {
      setError('Missing subject or topic parameters');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Fetch subject data
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('slug', subject)
          .single();

        if (subjectError) {
          throw new Error(`Failed to load subject: ${subjectError.message}`);
        }

        if (!subjectData) {
          throw new Error(`Subject not found: ${subject}`);
        }

        setSubjectData(subjectData);

        // Fetch topic and chapter data
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*, chapters(*)')
          .eq('id', topic)
          .single();

        if (topicError) {
          throw new Error(`Failed to load topic: ${topicError.message}`);
        }

        if (!topicData) {
          throw new Error(`Topic not found: ${topic}`);
        }

        setTopicData(topicData);

        // Add defensive check for chapters
        if (!topicData.chapters) {
          throw new Error(`Chapter data missing for topic: ${topic}`);
        }

        setChapterData(topicData.chapters);

        // Fetch quizzes with email
        try {
          const { data: quizzesData, error: quizzesError } = await supabase
            .from('quizzes_with_email')
            .select('*')
            .eq('topic_id', topic)
            .neq('created_by', null)
            .neq('created_by', '')
            .ilike('created_by', '%-%-%-%-%');

          if (quizzesError) {
            setQuizzes([]);
          } else {
            setQuizzes(quizzesData || []);
          }
        } catch (quizErr) {
          setQuizzes([]);
        }
      } catch (err) {
        captureError(
          err instanceof Error ? err : new Error(String(err)),
          'ClientTopicPage'
        );
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );

        // Redirect on certain types of errors
        if (
          err instanceof Error &&
          (err.message.includes('not found') ||
            err.message.includes('does not exist'))
        ) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [subject, topic, router]);

  // Handle different states
  if (loading) {
    return <LoadingDisplay />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!subjectData || !topicData || !chapterData) {
    return <ErrorDisplay message="Topic information not found" />;
  }

  return (
    <>
      <main className="container py-6 md:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Topic Header Information */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {subjectData.name}
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-accent)]">
              Form {chapterData.form} · {chapterData.title}
            </h2>
            <h3 className="text-lg md:text-xl font-medium mt-3 md:mt-4">
              {topicData.title}
            </h3>
            {topicData.description && (
              <p className="text-[var(--color-subtext)] mt-2 text-sm md:text-base">
                {topicData.description}
              </p>
            )}

            {/* Topic Metadata */}
            <div className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4">
              {topicData.difficulty_level && (
                <div className="flex items-center gap-1 text-sm md:text-base">
                  <span className="text-[var(--color-subtext)]">
                    Difficulty:
                  </span>
                  <span>
                    {Array(topicData.difficulty_level).fill('⭐').join('')}
                  </span>
                </div>
              )}
              {topicData.time_estimate_minutes && (
                <div className="flex items-center gap-1 text-sm md:text-base">
                  <span className="text-[var(--color-subtext)]">Time:</span>
                  <span>{topicData.time_estimate_minutes} minutes</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz List */}
          <QuizTable quizzes={quizzes} />

          {/* Action Buttons */}
          <ActionButtons
            subjectData={subjectData}
            topicData={topicData}
            chapterData={chapterData}
            subject={subject}
            topic={topic}
          />

          {/* Quiz Content */}
          <div className="bg-[var(--color-card-bg)] dark:bg-gray-800/50 rounded-[var(--border-radius)] p-6 md:p-8 shadow mt-6 border border-gray-100 dark:border-gray-700">
            <p className="text-[var(--color-subtext)] text-center">
              Quiz content for this topic is coming soon!
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
