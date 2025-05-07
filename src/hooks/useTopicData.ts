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

          setQuizzes(quizzesError ? [] : quizzesData || []);
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
