'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useParams, useRouter } from 'next/navigation';
import ContentEntityEdit, { FormField } from './ContentEntityEdit';
import Link from 'next/link';

interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  time_limit?: number; // in seconds
  passing_score?: number; // percentage
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Add index signature to satisfy ContentEntity constraint
}

interface Question {
  id: string;
  quiz_id: string;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  question_id: string;
  content: string;
  is_correct: boolean;
  explanation?: string;
}

interface Topic {
  id: string;
  title: string;
  chapter_id: string;
}

interface Chapter {
  id: string;
  title: string;
  subject_id: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function QuizEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quizId = params?.id || '';
  // Entity state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [parentChapter, setParentChapter] = useState<Chapter | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [parentSubject, setParentSubject] = useState<Subject | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formState, setFormState] = useState<Record<string, unknown>>({
    title: '',
    description: '',
    topic_id: '',
    time_limit: 0,
    passing_score: 70,
  });

  // Fetch quiz details
  const fetchEntity = async (id: string) => {
    try {
      // Fetch quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) {
        throw new Error(`Failed to fetch quiz: ${quizError.message}`);
      }

      if (!quiz) {
        throw new Error(`Quiz with ID ${id} not found`);
      }

      // Fetch all topics for the dropdown
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, title, chapter_id')
        .order('title', { ascending: true });

      if (topicsError) {
        throw new Error(`Failed to fetch topics: ${topicsError.message}`);
      }

      setTopics(topicsData || []);

      // Get parent topic, chapter, and subject info
      if (quiz.topic_id) {
        // Get topic parent
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*, chapters(*)')
          .eq('id', quiz.topic_id)
          .single();

        if (!topicError && topicData && topicData.chapters) {
          setParentChapter(topicData.chapters as Chapter);

          // Get chapter's parent subject
          if (topicData.chapters.subject_id) {
            const { data: subjectData, error: subjectError } = await supabase
              .from('subjects')
              .select('*')
              .eq('id', topicData.chapters.subject_id)
              .single();

            if (!subjectError && subjectData) {
              setParentSubject(subjectData as Subject);
            }
          }
        }
      }

      // Update form state
      setFormState({
        title: quiz.title,
        description: quiz.description || '',
        topic_id: quiz.topic_id,
        time_limit: quiz.time_limit || 0,
        passing_score: quiz.passing_score || 70,
      });

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index', { ascending: true });

      if (questionsError) {
        throw new Error(`Failed to fetch questions: ${questionsError.message}`);
      }

      // Fetch options for each question
      if (questionsData && questionsData.length > 0) {
        const questionsWithOptions = await Promise.all(
          questionsData.map(async (question) => {
            const { data: optionsData, error: optionsError } = await supabase
              .from('question_options')
              .select('*')
              .eq('question_id', question.id);

            if (optionsError) {
              logger.error(
                `Error fetching options for question ${question.id}:`,
                optionsError
              );
              return { ...question, options: [] };
            }

            return { ...question, options: optionsData || [] };
          })
        );

        setQuestions(questionsWithOptions);
      } else {
        setQuestions([]);
      }

      return quiz;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error fetching quiz details:', errorMessage);
      console.error('Quiz fetch error details:', { error, quizId: id });
      return null;
    }
  };

  // Save quiz
  const saveEntity = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          title: quiz.title,
          description: quiz.description,
          topic_id: quiz.topic_id,
          time_limit: Number(quiz.time_limit) || null,
          passing_score: Number(quiz.passing_score) || 70,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quiz.id);

      if (error) {
        return {
          success: false,
          error: new Error(`Failed to update quiz: ${error.message}`),
        };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: new Error(errorMessage) };
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this question and all its options? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Delete the question (cascade will delete options)
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        throw new Error(`Failed to delete question: ${error.message}`);
      }

      logger.log('Question deleted successfully');

      // Update local state
      setQuestions(questions.filter((question) => question.id !== questionId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error deleting question:', errorMessage);
      console.error('Question deletion error details:', { error, questionId });
    }
  };

  // Initialize the component
  useEffect(() => {
    if (!quizId) {
      router.push('/admin/content');
      return;
    }

    const loadQuiz = async () => {
      setLoading(true);
      const quiz = await fetchEntity(quizId);
      setQuiz(quiz);
      setLoading(false);
    };

    loadQuiz();
  }, [quizId, router]);

  // Form fields definition
  const formFields: FormField[] = [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter quiz title',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter quiz description (optional)',
    },
    {
      key: 'topic_id',
      label: 'Topic',
      type: 'select',
      options: topics.map((topic) => ({
        value: topic.id,
        label: topic.title,
      })),
      required: true,
    },
    {
      key: 'time_limit',
      label: 'Time Limit (seconds)',
      type: 'number',
      placeholder: 'Enter time limit in seconds (0 for unlimited)',
      helpText: 'Set to 0 for unlimited time',
    },
    {
      key: 'passing_score',
      label: 'Passing Score (%)',
      type: 'number',
      placeholder: 'Enter passing score percentage (default: 70%)',
      helpText: 'Percentage needed to pass the quiz',
    },
  ];

  // Metadata fields to display
  const metadataFields = [
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Last updated' },
    { key: 'id', label: 'ID' },
  ];

  // Format difficulty and question type for display
  const formatDifficulty = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded ${
          colors[difficulty] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  const formatType = (type: string) => {
    const displayNames: Record<string, string> = {
      multiple_choice: 'Multiple Choice',
      true_false: 'True/False',
      fill_blank: 'Fill in the Blank',
    };
    return displayNames[type] || type;
  };

  // Render questions tab content
  const renderQuestionsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Questions
        </h2>
        <Link
          href={`/admin/content/questions/new?quiz=${quizId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Add New Question
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4">No questions found for this quiz.</p>
          <p>Create questions to build your quiz assessment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Options
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {questions.map((question) => (
                <tr key={question.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {question.content.length > 100
                        ? `${question.content.substring(0, 100)}...`
                        : question.content}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatType(question.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>{formatDifficulty(question.difficulty)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {question.points}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {question.options?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/questions/${question.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Get the breadcrumb path from parent entities
  const getBreadcrumbPath = () => {
    if (!quiz || !quiz.topic_id) return '/admin/content';

    // Return to topic
    return `/admin/content/topics/${quiz.topic_id}`;
  };

  const getBreadcrumbText = () => {
    if (!quiz || !quiz.topic_id) return 'Back to Content';

    const topic = topics.find((t) => t.id === quiz.topic_id);
    if (topic) {
      return `Back to ${topic.title}`;
    }

    return 'Back to Content';
  };

  return (
    <ContentEntityEdit<Quiz>
      // Core data
      entityId={quizId}
      entityName="Quiz"
      backLink={getBreadcrumbPath()}
      backLinkText={getBreadcrumbText()}
      // Data fetching and saving
      fetchEntity={fetchEntity}
      saveEntity={saveEntity}
      // Form configuration
      formFields={formFields}
      formState={formState}
      setFormState={setFormState}
      // Additional tabs
      additionalTabs={[
        {
          id: 'questions',
          label: 'Questions',
          count: questions.length,
          render: renderQuestionsTab,
        },
      ]}
      // Entity state
      entity={quiz}
      setEntity={setQuiz}
      // UI state
      loading={loading}
      setLoading={setLoading}
      saving={saving}
      setSaving={setSaving}
      // Metadata
      metadataFields={metadataFields}
    />
  );
}
