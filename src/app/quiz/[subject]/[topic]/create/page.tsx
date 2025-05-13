/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { createQuiz } from '@/services/quizService';
import { QuizForm } from '@/components/QuizForm';
import { supabase } from '@/lib/supabase';

interface QuizData {
  name: string;
  subject: string;
  topic: string;
  description?: string;
  difficulty?: string;
  timeLimit?: number;
  isPublic?: boolean;
}

interface SubjectData {
  id: string;
  name: string;
  slug: string;
}

interface TopicData {
  id: string;
  title: string;
  chapter_id: string;
}

interface ChapterData {
  id: string;
  title: string;
  form: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Get subject and topic from path parameters, not search parameters
  const subject = (params?.subject as string) || '';
  const topic = (params?.topic as string) || '';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuizData>({
    defaultValues: {
      difficulty: 'beginner',
      timeLimit: 10,
      isPublic: false,
    },
  });

  // Fetch metadata about the subject, topic, and chapter
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);

        // Fetch subject data
        if (subject) {
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id, name, slug')
            .eq('slug', subject)
            .single();

          if (subjectError) throw subjectError;
          if (subjectData) setSubjectData(subjectData);
        }

        // Fetch topic data
        if (topic) {
          const { data: topicData, error: topicError } = await supabase
            .from('topics')
            .select('id, title, chapter_id')
            .eq('id', topic)
            .single();

          if (topicError) throw topicError;
          if (topicData) {
            setTopicData(topicData);

            // Fetch chapter data if we have a chapter_id
            if (topicData.chapter_id) {
              const { data: chapterData, error: chapterError } = await supabase
                .from('chapters')
                .select('id, title, form')
                .eq('id', topicData.chapter_id)
                .single();

              if (chapterError) throw chapterError;
              if (chapterData) setChapterData(chapterData);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load quiz context'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [subject, topic]);

  const mutation = useMutation({
    mutationFn: (data: QuizData) => createQuiz(data),
    onSuccess: (result) => {
      if (result.success && result.quizId) {
        // Show success notification
        alert('Quiz created successfully! Now you can add questions.');
        // Redirect to the question management page
        router.push(`/quiz/${subject}/${topic}/${result.quizId}/questions`);
      } else {
        // Handle error case where quiz was created but no ID was returned
        setError('Quiz created but unable to proceed to question creation');
      }
    },
    onError: (error) => {
      console.error('Error creating quiz:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create quiz'
      );
    },
  });

  const onSubmit = (data: QuizData) => {
    // Validate that we have a valid topic ID
    if (!topicData?.id) {
      setError(
        'Cannot create a quiz: Invalid topic ID. Please select a valid topic.'
      );
      return;
    }

    // Add the subject and topic IDs to the form data
    mutation.mutate({
      ...data,
      subject: subjectData?.id || subject,
      topic: topicData.id, // Use the topic ID from our fetched data
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading quiz information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Create New Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design a quiz for students to test their knowledge
            </p>
          </div>
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded">
              {error}
            </div>
          )}{' '}
          <QuizForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onSubmit={onSubmit}
            isLoading={mutation.status === 'pending'}
            subjectName={subjectData?.name}
            topicName={topicData?.title}
            chapterName={
              chapterData?.title
                ? `Form ${chapterData.form} · ${chapterData.title}`
                : undefined
            }
          />
        </div>

        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h2 className="text-lg font-medium mb-3">
            Tips for creating effective quizzes
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Use clear, concise language in your questions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Include a variety of question types (multiple choice,
                true/false, etc.)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Make sure all questions relate to the topic being assessed
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Set an appropriate time limit for the number of questions
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
