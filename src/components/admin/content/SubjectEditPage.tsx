'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useParams, useRouter } from 'next/navigation';
import ContentEntityEdit, { FormField } from './ContentEntityEdit';
import Link from 'next/link';
import Image from 'next/image';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  order_index?: number;
  category?: string;
  category_priority?: number;
  [key: string]: unknown; // Add index signature to satisfy ContentEntity constraint
}

interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  form: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  topic_count?: number;
}

export default function SubjectEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const subjectId = params?.id || '';

  // Entity state
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Form state
  const [formState, setFormState] = useState<Record<string, unknown>>({
    name: '',
    description: '',
    icon: '',
  });

  // Form fields definition
  const formFields: FormField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter subject name',
      required: true,
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter subject description',
    },
    {
      key: 'icon',
      label: 'Icon URL or Emoji (optional)',
      type: 'custom',
      placeholder: 'Enter a URL (https://...) or an emoji (e.g., 📚)',
      helpText:
        'For URLs, use http:// or https:// links. You can also use a single emoji as an icon.',
      renderCustom: (
        value: unknown,
        onChange: (value: unknown) => void,
        disabled: boolean
      ) => {
        const iconValue = typeof value === 'string' ? value : '';
        return (
          <>
            <input
              type="text"
              id="icon-url"
              placeholder="Enter a URL (https://...) or an emoji (e.g., 📚)"
              className="mt-1 block w-full border border-gray-600 dark:border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              value={iconValue}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
            {iconValue && (
              <div className="mt-2 flex items-center">
                <div className="h-10 w-10 mr-2 relative">
                  {/* Check if it's a URL or emoji */}
                  {iconValue.startsWith('http://') ||
                  iconValue.startsWith('https://') ||
                  iconValue.startsWith('/') ? (
                    <Image
                      src={iconValue}
                      alt="Icon preview"
                      width={40}
                      height={40}
                      className="object-cover"
                      onError={() =>
                        onChange('https://via.placeholder.com/40?text=Error')
                      }
                      unoptimized={iconValue.startsWith('data:')}
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                      <span className="text-lg">
                        {iconValue.length > 2 ? '📄' : iconValue}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Icon preview
                </span>
              </div>
            )}
          </>
        );
      },
    },
  ];

  // Metadata fields to display
  const metadataFields = [
    { key: 'created_at', label: 'Created at' },
    { key: 'updated_at', label: 'Last updated' },
    { key: 'id', label: 'ID' },
  ];

  // Fetch subject details
  const fetchEntity = async (id: string) => {
    try {
      // Fetch subject
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) {
        throw new Error(`Failed to fetch subject: ${subjectError.message}`);
      }

      if (!subject) {
        throw new Error(`Subject with ID ${id} not found`);
      }

      // Update form state
      setFormState({
        name: subject.name,
        description: subject.description || '',
        icon: subject.icon || '',
      });

      // Fetch chapters for this subject
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', id)
        .order('order_index', { ascending: true });

      if (chaptersError) {
        throw new Error(`Failed to fetch chapters: ${chaptersError.message}`);
      }

      // For each chapter, count the number of topics
      if (chaptersData && chaptersData.length > 0) {
        const chaptersWithTopicCounts = await Promise.all(
          chaptersData.map(async (chapter) => {
            // Count topics in this chapter
            const { count: topicCount, error: countError } = await supabase
              .from('topics')
              .select('*', { count: 'exact', head: true })
              .eq('chapter_id', chapter.id);

            if (countError) {
              logger.error(
                `Error counting topics for chapter ${chapter.id}:`,
                countError
              );
              return { ...chapter, topic_count: 0 };
            }

            return { ...chapter, topic_count: topicCount || 0 };
          })
        );

        setChapters(chaptersWithTopicCounts);
      } else {
        setChapters([]);
      }

      return subject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error fetching subject details:', errorMessage);
      console.error('Subject fetch error details:', { error, subjectId: id });
      return null;
    }
  };

  // Save subject
  const saveEntity = async (subject: Subject) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update({
          name: subject.name,
          description: subject.description,
          icon: subject.icon || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subject.id);

      if (error) {
        return {
          success: false,
          error: new Error(`Failed to update subject: ${error.message}`),
        };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { success: false, error: new Error(errorMessage) };
    }
  };

  // Handle chapter deletion
  const handleDeleteChapter = async (chapterId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this chapter? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Check if there are topics associated with this chapter
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('chapter_id', chapterId)
        .limit(1);

      if (topicsError) {
        throw new Error(
          `Failed to check related topics: ${topicsError.message}`
        );
      }

      if (topics && topics.length > 0) {
        alert(
          'Cannot delete a chapter with associated topics. Please delete the topics first.'
        );
        return;
      }

      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) {
        throw new Error(`Failed to delete chapter: ${error.message}`);
      }

      logger.log('Chapter deleted successfully');

      // Update local state
      setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error deleting chapter:', errorMessage);
      console.error('Chapter deletion error details:', { error, chapterId });
    }
  };

  // Initialize the component
  useEffect(() => {
    if (!subjectId) {
      router.push('/admin/content');
      return;
    }

    const loadSubject = async () => {
      setLoading(true);
      const subject = await fetchEntity(subjectId);
      setSubject(subject);
      setLoading(false);
    };

    loadSubject();
  }, [subjectId, router]);

  // Render chapters tab content
  const renderChaptersTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white dark:text-gray-900">
          Chapters
        </h2>
        <Link
          href={`/admin/content/chapters/new?subject=${subjectId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Add New Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <p className="mb-4">No chapters found for this subject.</p>
          <p>To begin building your course content:</p>
          <ol className="list-decimal list-inside text-left max-w-md mx-auto mt-4">
            <li className="mb-2">
              Create chapters to organize your subject content
            </li>
            <li className="mb-2">Add topics within each chapter</li>
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
                  Form/Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Topics
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
              {chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white dark:text-gray-900">
                      {chapter.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {chapter.form}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700">
                        {chapter.topic_count || 0} topics
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {chapter.order_index}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/chapters/${chapter.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/content/topics?chapter=${chapter.id}`}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                    >
                      Topics
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeleteChapter(chapter.id)}
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
    <ContentEntityEdit<Subject>
      // Core data
      entityId={subjectId}
      entityName="Subject"
      backLink="/admin/content"
      backLinkText="Back to Content"
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
          id: 'chapters',
          label: 'Chapters',
          count: chapters.length,
          render: renderChaptersTab,
        },
      ]}
      // Entity state
      entity={subject}
      setEntity={setSubject}
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
