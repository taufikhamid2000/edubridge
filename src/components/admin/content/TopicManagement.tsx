'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { Topic, Chapter, createTopic, deleteTopic } from '@/services';
import {
  DataTableCardView,
  type Column,
  type CardField,
} from '@/components/admin/ui';

interface TopicManagementProps {
  topics: Topic[];
  chapters: Chapter[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  refreshTopics: () => Promise<void>;
}

export default function TopicManagement({
  topics,
  chapters,
  loading,
  setLoading,
  setError,
  setSuccessMessage,
  refreshTopics,
}: TopicManagementProps) {
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    chapter_id: '',
    content: '',
  });

  // Function to handle topic creation
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!newTopic.title.trim()) {
        setError('Topic title is required');
        return;
      }

      if (!newTopic.chapter_id) {
        setError('Please select a chapter');
        return;
      }

      const { error } = await createTopic({
        title: newTopic.title,
        chapter_id: newTopic.chapter_id,
        content: newTopic.content,
      });

      if (error) {
        setError(`Failed to create topic: ${error.message}`);
        return;
      }

      setSuccessMessage('Topic created successfully!');
      setNewTopic({ title: '', chapter_id: '', content: '' });
      setShowNewTopicForm(false);
      await refreshTopics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error creating topic:', error);
      setError(`Failed to create topic: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle topic deletion
  const handleDeleteTopic = async (topicId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this topic? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await deleteTopic(topicId);

      if (error) {
        setError(`Failed to delete topic: ${error.message}`);
        return;
      }

      setSuccessMessage('Topic deleted successfully!');
      await refreshTopics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error deleting topic:', error);
      setError(`Failed to delete topic: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  // Function to get chapter title by ID
  const getChapterTitle = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter ? chapter.title : 'Unknown Chapter';
  };

  // Define columns for DataTableCardView
  const columns: Column<Topic>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (topic) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {topic.title}
        </div>
      ),
    },
    {
      key: 'chapter',
      header: 'Chapter',
      render: (topic) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {getChapterTitle(topic.chapter_id)}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (topic) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(topic.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Define card fields for mobile view
  const cardFields: CardField<Topic>[] = [
    {
      key: 'title',
      label: 'Title',
      isHeader: true,
      render: (topic) => (
        <div className="text-base font-medium text-gray-900 dark:text-gray-100">
          {topic.title}
        </div>
      ),
    },
    {
      key: 'chapter',
      label: 'Chapter',
      render: (topic) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {getChapterTitle(topic.chapter_id)}
        </div>
      ),
    },
    {
      key: 'created',
      label: 'Created',
      render: (topic) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(topic.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Actions render function
  const renderActions = (topic: Topic) => (
    <button
      onClick={() => handleDeleteTopic(topic.id)}
      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  );
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Topic Management
        </h2>
        <button
          onClick={() => setShowNewTopicForm(!showNewTopicForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {showNewTopicForm ? 'Cancel' : 'Add New Topic'}
        </button>
      </div>

      {showNewTopicForm && (
        <form
          onSubmit={handleCreateTopic}
          className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newTopic.title}
              onChange={(e) =>
                setNewTopic({ ...newTopic, title: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="chapter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Chapter
            </label>
            <select
              id="chapter"
              value={newTopic.chapter_id}
              onChange={(e) =>
                setNewTopic({ ...newTopic, chapter_id: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Content
            </label>
            <textarea
              id="content"
              value={newTopic.content}
              onChange={(e) =>
                setNewTopic({ ...newTopic, content: e.target.value })
              }
              rows={5}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      )}

      <DataTableCardView<Topic>
        data={topics}
        isLoading={loading}
        columns={columns}
        cardFields={cardFields}
        keyExtractor={(topic) => topic.id}
        emptyMessage="No topics found. Create your first topic to get started."
        actions={renderActions}
      />
    </div>
  );
}
