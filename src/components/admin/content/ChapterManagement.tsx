'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Chapter, Subject, createChapter, deleteChapter } from '@/services';
import ContentLoadingState from './ContentLoadingState';
import ContentEmptyState from './ContentEmptyState';

interface ChapterManagementProps {
  chapters: Chapter[];
  subjects: Subject[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  refreshChapters: () => Promise<void>;
}

export default function ChapterManagement({
  chapters,
  subjects,
  loading,
  setLoading,
  setError,
  setSuccessMessage,
  refreshChapters,
}: ChapterManagementProps) {
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    subject_id: '',
    form: 1,
  });

  // Function to handle chapter creation
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!newChapter.title.trim()) {
        setError('Chapter title is required');
        return;
      }

      if (!newChapter.subject_id) {
        setError('Subject selection is required');
        return;
      }

      const { id, error } = await createChapter({
        title: newChapter.title,
        subject_id: newChapter.subject_id,
        form: newChapter.form,
      });

      if (error) {
        throw error;
      }

      if (!id) {
        throw new Error('Failed to create chapter');
      }

      // Refresh chapters list
      await refreshChapters();

      // Reset form and hide it
      setNewChapter({ title: '', subject_id: '', form: 1 });
      setShowNewChapterForm(false);
      setSuccessMessage(`Chapter "${newChapter.title}" created successfully!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to create chapter: ${errorMessage}`);
      logger.error('Error creating chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle chapter deletion
  const handleDeleteChapter = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the chapter "${title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { success, error } = await deleteChapter(id);

      if (error) {
        throw error;
      }

      if (!success) {
        throw new Error('Failed to delete chapter');
      }

      // Refresh the chapter list
      await refreshChapters();
      setSuccessMessage(`Chapter "${title}" deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to delete chapter: ${errorMessage}`);
      logger.error('Error deleting chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Chapter Management
        </h2>
        <button
          onClick={() => setShowNewChapterForm(!showNewChapterForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {showNewChapterForm ? 'Cancel' : 'Add New Chapter'}
        </button>
      </div>

      {showNewChapterForm && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <h3 className="text-lg font-medium mb-3 dark:text-white">
            Create New Chapter
          </h3>
          <form onSubmit={handleCreateChapter}>
            <div className="mb-3">
              <label
                htmlFor="chapter-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Chapter Title
              </label>
              <input
                id="chapter-title"
                type="text"
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter chapter title"
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="chapter-subject"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Subject
              </label>
              <select
                id="chapter-subject"
                value={newChapter.subject_id}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    subject_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label
                htmlFor="chapter-form"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Form
              </label>
              <input
                id="chapter-form"
                type="number"
                min="1"
                value={newChapter.form}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    form: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter form number"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Chapter'}
              </button>
            </div>
          </form>
        </div>
      )}
      {loading ? (
        <ContentLoadingState />
      ) : chapters.length === 0 ? (
        <ContentEmptyState message="No chapters found. Create your first chapter to get started." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {chapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {chapter.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {subjects.find((s) => s.id === chapter.subject_id)?.name ||
                      'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {chapter.form}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/chapters/${chapter.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        handleDeleteChapter(chapter.id, chapter.title)
                      }
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
}
