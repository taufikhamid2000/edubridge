'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useParams, useRouter } from 'next/navigation';
import ContentEntityEdit, { FormField } from './ContentEntityEdit';
import Link from 'next/link';

interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  content?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Add index signature to satisfy ContentEntity constraint
}

interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
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

export default function TopicEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const topicId = params?.id || '';

  // Entity state
  const [topic, setTopic] = useState<Topic | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [parentSubject, setParentSubject] = useState<Subject | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formState, setFormState] = useState<Record<string, unknown>>({
    title: '',
    content: '',
    chapter_id: '',
    order_index: 0,
  });

  // Fetch topic details
  const fetchEntity = async (id: string) => {
    try {
      // Fetch topic
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

      if (topicError) {
        throw new Error(`Failed to fetch topic: ${topicError.message}`);
      }

      if (!topic) {
        throw new Error(`Topic with ID ${id} not found`);
      }

      // Fetch all chapters for the dropdown
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, title, subject_id')
        .order('title', { ascending: true });

      if (chaptersError) {
        throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
      }

      setChapters(chaptersData || []);

      // Get parent chapter and subject info
      if (topic.chapter_id) {
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*, subjects(id, name)')
          .eq('id', topic.chapter_id)
          .single();

        if (!chapterError && chapterData && chapterData.subjects) {
          setParentSubject(chapterData.subjects as Subject);
        }
      }

      // Update form state
      setFormState({
        title: topic.title,
        content: topic.content || '',
        chapter_id: topic.chapter_id,
        order_index: topic.order_index,
      });

      // Fetch quizzes for this topic
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('topic_id', id)
        .order('created_at', { ascending: false });

      if (quizzesError) {
        throw new Error(`Failed to fetch quizzes: ${quizzesError.message}`);
      }

      setQuizzes(quizzesData || []);

      return topic;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error fetching topic details:', errorMessage);
      console.error('Topic fetch error details:', { error, topicId: id });
      return null;
    }
  };

  // Save topic
  const saveEntity = async (topic: Topic) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          title: topic.title,
          content: topic.content,
          chapter_id: topic.chapter_id,
          order_index: Number(topic.order_index),
          updated_at: new Date().toISOString(),
        })
        .eq('id', topic.id);

      if (error) {
        return {
          success: false,
          error: new Error(`Failed to update topic: ${error.message}`),
        };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: new Error(errorMessage) };
    }
  };

  // Handle quiz deletion
  const handleDeleteQuiz = async (quizId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this quiz? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) {
        throw new Error(`Failed to delete quiz: ${error.message}`);
      }

      logger.log('Quiz deleted successfully');

      // Update local state
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error deleting quiz:', errorMessage);
      console.error('Quiz deletion error details:', { error, quizId });
    }
  };

  // Initialize the component
  useEffect(() => {
    if (!topicId) {
      router.push('/admin/content');
      return;
    }

    const loadTopic = async () => {
      setLoading(true);
      const topic = await fetchEntity(topicId);
      setTopic(topic);
      setLoading(false);
    };

    loadTopic();
  }, [topicId, router]);

  // Form fields definition
  const formFields: FormField[] = [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter topic title',
      required: true,
    },
    {
      key: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'Enter topic content (optional)',
      helpText: 'You can use markdown formatting',
    },
    {
      key: 'chapter_id',
      label: 'Chapter',
      type: 'select',
      options: chapters.map((chapter) => ({
        value: chapter.id,
        label: chapter.title,
      })),
      required: true,
    },
    {
      key: 'order_index',
      label: 'Display Order',
      type: 'number',
      placeholder: 'Enter display order (lower numbers appear first)',
      required: true,
    },
  ];

  // Metadata fields to display
  const metadataFields = [
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Last updated' },
    { key: 'id', label: 'ID' },
  ];

  // Render quizzes tab content
  const renderQuizzesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Quizzes
        </h2>
        <Link
          href={`/admin/content/quizzes/new?topic=${topicId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Add New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4">No quizzes found for this topic.</p>
          <p>Create quizzes to test knowledge of this topic.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </div>
                    {quiz.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.description.length > 60
                          ? `${quiz.description.substring(0, 60)}...`
                          : quiz.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/quizzes/${quiz.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeleteQuiz(quiz.id)}
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
    if (!topic || !topic.chapter_id) return '/admin/content';

    const chapter = chapters.find((c) => c.id === topic.chapter_id);
    if (chapter && chapter.subject_id && parentSubject) {
      // Return to chapter
      return `/admin/content/chapters/${chapter.id}`;
    }

    return '/admin/content';
  };

  const getBreadcrumbText = () => {
    if (!topic || !topic.chapter_id) return 'Back to Content';

    const chapter = chapters.find((c) => c.id === topic.chapter_id);
    if (chapter) {
      return `Back to ${chapter.title}`;
    }

    return 'Back to Content';
  };

  return (
    <ContentEntityEdit<Topic>
      // Core data
      entityId={topicId}
      entityName="Topic"
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
          id: 'quizzes',
          label: 'Quizzes',
          count: quizzes.length,
          render: renderQuizzesTab,
        },
      ]}
      // Entity state
      entity={topic}
      setEntity={setTopic}
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
