import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

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
        setSubjectData(subjectData); // Fetch topic and chapter data
        logger.log('Fetching topic data for topic ID:', topic);
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select(
            'id, name, chapter_id, description, difficulty_level, time_estimate_minutes, order_index'
          )
          .eq('id', topic)
          .single();

        logger.log('Topic query result:', { topicData, topicError });
        if (topicError)
          throw new Error(`Failed to load topic: ${topicError.message}`);
        if (!topicData) throw new Error(`Topic not found: ${topic}`);

        setTopicData({
          ...topicData,
          chapters: [], // Empty array since we'll fetch chapter separately
        });

        // Fetch chapter data if we have a chapter_id
        let chapter = null;
        if (topicData.chapter_id) {
          logger.log(
            'Fetching chapter data for chapter ID:',
            topicData.chapter_id
          );
          const { data: chapterData, error: chapterError } = await supabase
            .from('chapters')
            .select('id, name, form, order_index')
            .eq('id', topicData.chapter_id)
            .single();

          logger.log('Chapter query result:', { chapterData, chapterError });
          if (chapterError) {
            logger.error('Failed to fetch chapter data:', chapterError);
          } else if (chapterData) {
            chapter = chapterData;
          }
        } else {
          logger.log(
            'No chapter_id found for topic, checking query parameters...'
          );
          // If no chapter_id from database, check query parameters as fallback
          const chapterId = searchParams.get('chapterId');
          const chapterName = searchParams.get('chapterName');

          if (chapterId && chapterName) {
            logger.log('Using chapter data from query parameters:', {
              chapterId,
              chapterName,
            });
            chapter = {
              id: chapterId,
              name: decodeURIComponent(chapterName),
              form: 0, // Default form, could be enhanced
              order_index: 0,
            };
          }
        }

        // Set the chapter data, which might be null if no valid chapter was found
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
  }, [subject, topic, router, searchParams]);

  return { loading, error, subjectData, topicData, chapterData, quizzes };
}
