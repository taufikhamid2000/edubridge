'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useParams, useRouter } from 'next/navigation';
import ContentEntityEdit, { FormField } from './ContentEntityEdit';
import Link from 'next/link';

interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
  form: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Add index signature to satisfy ContentEntity constraint
}

interface Topic {
  id: string;
  chapter_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  quiz_count?: number;
}

interface Subject {
  id: string;
  name: string;
}

export default function ChapterEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const chapterId = params?.id || '';

  // Entity state
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Form state
  const [formState, setFormState] = useState<Record<string, unknown>>({
    name: '',
    description: '',
    form: 0,
    subject_id: '',
    order_index: 0,
  });

  // Fetch chapter details
  const fetchEntity = async (id: string) => {
    try {
      // Fetch chapter
      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();

      if (chapterError) {
        throw new Error(`Failed to fetch chapter: ${chapterError.message}`);
      }

      if (!chapter) {
        throw new Error(`Chapter with ID ${id} not found`);
      }

      // Fetch all subjects for the dropdown
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name', { ascending: true });

      if (subjectsError) {
        throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
      }

      setSubjects(subjectsData || []); // Update form state
      setFormState({
        name: chapter.name,
        description: chapter.description || '',
        form: chapter.form,
        subject_id: chapter.subject_id,
        order_index: chapter.order_index,
      });

      // Fetch topics for this chapter
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('chapter_id', id)
        .order('order_index', { ascending: true });

      if (topicsError) {
        throw new Error(`Failed to fetch topics: ${topicsError.message}`);
      }

      // For each topic, count the number of quizzes
      if (topicsData && topicsData.length > 0) {
        const topicsWithQuizCounts = await Promise.all(
          topicsData.map(async (topic) => {
            // Count quizzes for this topic
            const { count: quizCount, error: countError } = await supabase
              .from('quizzes')
              .select('*', { count: 'exact', head: true })
              .eq('topic_id', topic.id);

            if (countError) {
              logger.error(
                `Error counting quizzes for topic ${topic.id}:`,
                countError
              );
              return { ...topic, quiz_count: 0 };
            }

            return { ...topic, quiz_count: quizCount || 0 };
          })
        );

        setTopics(topicsWithQuizCounts);
      } else {
        setTopics([]);
      }

      return chapter;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error fetching chapter details:', errorMessage);
      console.error('Chapter fetch error details:', { error, chapterId: id });
      return null;
    }
  };
  // Save chapter
  const saveEntity = async (chapter: Chapter) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          name: chapter.name,
          description: chapter.description,
          form: Number(chapter.form),
          subject_id: chapter.subject_id,
          order_index: Number(chapter.order_index),
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapter.id);

      if (error) {
        return {
          success: false,
          error: new Error(`Failed to update chapter: ${error.message}`),
        };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: new Error(errorMessage) };
    }
  };

  // Handle topic deletion
  const handleDeleteTopic = async (topicId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this topic? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Check if there are quizzes associated with this topic
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('topic_id', topicId)
        .limit(1);

      if (quizzesError) {
        throw new Error(
          `Failed to check related quizzes: ${quizzesError.message}`
        );
      }

      if (quizzes && quizzes.length > 0) {
        alert(
          'Cannot delete a topic with associated quizzes. Please delete the quizzes first.'
        );
        return;
      }

      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) {
        throw new Error(`Failed to delete topic: ${error.message}`);
      }

      logger.log('Topic deleted successfully');

      // Update local state
      setTopics(topics.filter((topic) => topic.id !== topicId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error deleting topic:', errorMessage);
      console.error('Topic deletion error details:', { error, topicId });
    }
  };

  // Initialize the component
  useEffect(() => {
    if (!chapterId) {
      router.push('/admin/content');
      return;
    }

    const loadChapter = async () => {
      setLoading(true);
      const chapter = await fetchEntity(chapterId);
      setChapter(chapter);
      setLoading(false);
    };

    loadChapter();
  }, [chapterId, router]);
  // Form fields definition
  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter chapter title',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter chapter description (optional)',
    },
    {
      key: 'subject_id',
      label: 'Subject',
      type: 'select',
      options: subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
      })),
      required: true,
    },
    {
      key: 'form',
      label: 'Form/Grade',
      type: 'number',
      placeholder: 'Enter form or grade level (e.g., 1, 2, 3)',
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

  // Render topics tab content
  const renderTopicsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white dark:text-gray-900">
          Topics
        </h2>
        <Link
          href={`/admin/content/topics/new?chapter=${chapterId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Add New Topic
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="mb-4">No topics found for this chapter.</p>
          <p>To begin building your chapter content:</p>
          <ol className="list-decimal list-inside text-left max-w-md mx-auto mt-4">
            <li className="mb-2">
              Create topics to organize your chapter content
            </li>
            <li>Create quizzes for each topic</li>
          </ol>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quizzes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-700 dark:divide-gray-200">
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white dark:text-gray-900">
                      {topic.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700">
                        {topic.quiz_count || 0} quizzes
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {topic.order_index}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/topics/${topic.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/content/quizzes?topic=${topic.id}`}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                    >
                      Quizzes
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeleteTopic(topic.id)}
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

  return (
    <ContentEntityEdit<Chapter>
      // Core data
      entityId={chapterId}
      entityName="Chapter"
      backLink={
        chapter
          ? `/admin/content/subjects/${chapter.subject_id}`
          : '/admin/content'
      }
      backLinkText={chapter ? 'Back to Subject' : 'Back to Content'}
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
          id: 'topics',
          label: 'Topics',
          count: topics.length,
          render: renderTopicsTab,
        },
      ]}
      // Entity state
      entity={chapter}
      setEntity={setChapter}
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
