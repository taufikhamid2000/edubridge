import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { Subject, Topic, Chapter, Quiz } from '@/types/topics';

export function useTopicData(subject: string, topic: string) {
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

        if (subjectError)
          throw new Error(`Failed to load subject: ${subjectError.message}`);
        if (!subjectData) throw new Error(`Subject not found: ${subject}`);
        setSubjectData(subjectData);

        // Fetch topic and chapter data
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*, chapters(*)')
          .eq('id', topic)
          .single();
        if (topicError)
          throw new Error(`Failed to load topic: ${topicError.message}`);
        if (!topicData) throw new Error(`Topic not found: ${topic}`);
        if (!topicData.chapters) {
          // Chapter data missing, but we'll handle it gracefully
          // Continue without throwing, let the chapterData=null flow handle this
        }
        setTopicData(topicData);

        // Handle different possible formats of the chapters data
        let chapter = null;
        if (topicData.chapters) {
          if (
            Array.isArray(topicData.chapters) &&
            topicData.chapters.length > 0
          ) {
            chapter = topicData.chapters[0];
          } else if (
            typeof topicData.chapters === 'object' &&
            'id' in topicData.chapters
          ) {
            // Handle case where chapters might be a single object and not an array
            chapter = topicData.chapters;
          }
        } // Set the chapter data, which might be null if no valid chapter was found
        setChapterData(chapter);
        try {
          // Fetch basic quizzes first
          const { data: basicQuizzes, error: quizzesError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('topic_id', topic);

          if (quizzesError || !basicQuizzes) {
            setQuizzes([]);
            return;
          }

          // Get creator information for each quiz
          const quizzesWithCreators = await Promise.all(
            basicQuizzes.map(async (quiz) => {
              try {
                // Try to get user profile info using created_by as UUID
                const { data: profile } = await supabase
                  .from('user_profiles')
                  .select('display_name')
                  .eq('id', quiz.created_by)
                  .single();

                return {
                  ...quiz,
                  display_name: profile?.display_name || null,
                };
              } catch {
                // If that fails, the created_by might not be a valid UUID
                return {
                  ...quiz,
                  display_name: null,
                };
              }
            })
          );

          setQuizzes(quizzesWithCreators);
        } catch {
          setQuizzes([]);
        }
      } catch (err) {
        // Log the error
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[ERROR] useTopicData: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
          logger.error(error);
        }

        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );

        // Redirect on certain types of errors
        const errorMessage = err instanceof Error ? err.message : '';
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('does not exist')
        ) {
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [subject, topic, router]);

  return { loading, error, subjectData, topicData, chapterData, quizzes };
}
