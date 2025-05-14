import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/debug';
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
        if (!topicData.chapters)
          throw new Error(`Chapter data missing for topic: ${topic}`);

        setTopicData(topicData);
        // Get the first chapter from the array, assuming each topic is associated with one chapter
        const chapter =
          Array.isArray(topicData.chapters) && topicData.chapters.length > 0
            ? topicData.chapters[0]
            : null;
        setChapterData(chapter); // Set the first chapter data
        try {
          // First query the actual quizzes table to get unique quiz IDs
          const { data: uniqueQuizzes, error: quizzesError } = await supabase
            .from('quizzes')
            .select('*')
            .eq('topic_id', topic);

          if (quizzesError || !uniqueQuizzes) {
            setQuizzes([]);
            return;
          }

          // Then join with user info if needed
          const { data: quizzesData } = await supabase
            .from('quizzes_with_email')
            .select('*')
            .eq('topic_id', topic)
            .in(
              'id',
              uniqueQuizzes.map((quiz) => quiz.id)
            );

          // If we have data from the view, use that (it has email info)
          // Otherwise fall back to the basic quiz data
          setQuizzes(quizzesData || uniqueQuizzes || []);
        } catch {
          setQuizzes([]);
        }
      } catch (err) {
        captureError(
          err instanceof Error ? err : new Error(String(err)),
          'useTopicData'
        );
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
