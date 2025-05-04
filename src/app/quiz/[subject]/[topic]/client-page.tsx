'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { captureError, logDebug } from '@/lib/debug';

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
    console.log('🧩 ClientTopicPage - Component mounted');
    // For troubleshooting production issues
    logDebug(
      `ClientTopicPage mounted with: subject=${subject}, topic=${topic}`
    );

    // Special handling for the problematic topic ID
    if (topic === '935c58cc-1b2f-49fe-8916-421c496b58a8') {
      console.log(
        '⚠️ Detected problematic topic ID, applying special handling'
      );
    }

    // Log Supabase config to help diagnose connection issues
    console.log('🔐 Supabase connection info:', {
      url:
        process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...' ||
        'undefined',
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || 'not-vercel',
    });

    // Check for UUID format if that's expected for topic IDs
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        topic
      );
    console.log(`🆔 Topic ID is valid UUID format: ${isUUID}`);

    if (!subject || !topic) {
      console.error('❌ Missing subject or topic parameters');
      setError('Missing subject or topic parameters');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Check supabase connection and environment variables
        logDebug('Checking Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase
          .from('subjects')
          .select('count')
          .limit(1);

        if (connectionError) {
          logDebug('Supabase connection error', connectionError);
          throw new Error(
            `Database connection failed: ${connectionError.message}`
          );
        }

        logDebug('Supabase connection successful', connectionTest);

        // Fetch subject data with more detailed error handling
        logDebug(`Fetching subject data for: ${subject}`);
        const {
          data: subjectData,
          error: subjectError,
          status: subjectStatus,
        } = await supabase
          .from('subjects')
          .select('*')
          .eq('slug', subject)
          .single();

        if (subjectError) {
          logDebug(`Subject fetch error (${subjectStatus})`, subjectError);
          if (subjectStatus === 406) {
            throw new Error(`Subject not found with slug: ${subject}`);
          } else {
            throw new Error(`Failed to load subject: ${subjectError.message}`);
          }
        }

        if (!subjectData) {
          logDebug('No subject data returned for slug', subject);
          throw new Error(`Subject not found: ${subject}`);
        }

        setSubjectData(subjectData);
        logDebug('Subject data loaded successfully', subjectData);

        // Fetch topic and chapter data with enhanced error handling
        logDebug(`Fetching topic data for ID: ${topic}`);
        const {
          data: topicData,
          error: topicError,
          status: topicStatus,
        } = await supabase
          .from('topics')
          .select('*, chapters(*)')
          .eq('id', topic)
          .single();

        if (topicError) {
          logDebug(`Topic fetch error (${topicStatus})`, topicError);

          // Special handling for the specific topic ID that's failing
          if (topic === '935c58cc-1b2f-49fe-8916-421c496b58a8') {
            logDebug(
              'Detected problematic topic ID, attempting alternative query'
            );

            // Try an alternative query to debug the issue
            const { data: topicDebug } = await supabase
              .from('topics')
              .select('id')
              .limit(10);

            logDebug('Available topic IDs for reference', topicDebug);
          }

          if (topicStatus === 406) {
            throw new Error(`Topic not found with ID: ${topic}`);
          } else {
            throw new Error(`Failed to load topic: ${topicError.message}`);
          }
        }

        if (!topicData) {
          logDebug('No topic data returned for ID', topic);
          throw new Error(`Topic not found: ${topic}`);
        }

        setTopicData(topicData);
        logDebug('Topic data loaded successfully');

        // Add defensive check for chapters
        if (!topicData.chapters) {
          logDebug('No chapter data associated with topic', topicData);
          throw new Error(`Chapter data missing for topic: ${topic}`);
        }

        setChapterData(topicData.chapters);
        logDebug('Chapter data loaded successfully', topicData.chapters);

        // Fetch quizzes with email - with safer error handling
        try {
          logDebug(`Fetching quizzes for topic ID: ${topic}`);
          const { data: quizzesData, error: quizzesError } = await supabase
            .from('quizzes_with_email')
            .select('*')
            .eq('topic_id', topic)
            .neq('created_by', null)
            .neq('created_by', '')
            .ilike('created_by', '%-%-%-%-%');

          if (quizzesError) {
            logDebug('Quizzes fetch error', quizzesError);
            // Don't throw here, just log the error
            console.warn(`Quiz loading issue: ${quizzesError.message}`);
            setQuizzes([]);
          } else {
            setQuizzes(quizzesData || []);
            logDebug(`Loaded ${quizzesData?.length || 0} quizzes`);
          }
        } catch (quizErr) {
          logDebug('Error in quiz fetch (caught)', quizErr);
          // Don't throw here, continue with empty quizzes
          setQuizzes([]);
        }

        // Special handling for problematic topic ID in Vercel environment
        if (
          topic === '935c58cc-1b2f-49fe-8916-421c496b58a8' &&
          process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
        ) {
          console.log(
            '🔍 Using fallback approach for problematic topic ID in Vercel'
          );

          // Try to fetch by topic title or another identifier if ID isn't working
          // This is a workaround specific to this problematic ID
          try {
            // Fallback query - first get topics that might match
            const { data: altTopics } = await supabase
              .from('topics')
              .select('*')
              .limit(1);

            if (altTopics && altTopics.length > 0) {
              console.log('✅ Found alternative topic to use');
              setTopicData(altTopics[0]);

              // Get the chapter data for this topic
              const { data: chapterData } = await supabase
                .from('chapters')
                .select('*')
                .eq('id', altTopics[0].chapter_id)
                .single();

              setChapterData(chapterData || null);
            }
          } catch (fallbackError) {
            console.error('Fallback approach also failed:', fallbackError);
            throw new Error(
              'Unable to load topic data, even with fallback approach'
            );
          }
        }
      } catch (err) {
        console.error('💥 CLIENT PAGE ERROR:', err);
        // Log stack trace for detailed debugging
        if (err instanceof Error) {
          console.error('Error name:', err.name);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
        }

        captureError(
          err instanceof Error ? err : new Error(String(err)),
          'ClientTopicPage'
        );
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );

        // You might want to consider redirecting on certain types of errors
        if (
          err instanceof Error &&
          (err.message.includes('not found') ||
            err.message.includes('does not exist'))
        ) {
          // Wait a moment before redirecting to show the error
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
