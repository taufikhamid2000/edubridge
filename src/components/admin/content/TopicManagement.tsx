'use client';

import { useState, useMemo, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { Topic, Chapter, createTopic, deleteTopic } from '@/services';
import {
  DataTableCardView,
  type Column,
  type CardField,
  SearchBar,
  FilterSortControls,
  type SortDirection,
  Pagination,
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

  // Pagination, filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  // Function to get chapter title by ID
  const getChapterTitle = useCallback(
    (chapterId: string) => {
      const chapter = chapters.find((c) => c.id === chapterId);
      return chapter ? chapter.title : 'Unknown Chapter';
    },
    [chapters]
  );

  // Sort options for the topics
  const sortOptions = [
    { id: 'title', label: 'Title' },
    { id: 'chapter', label: 'Chapter' },
    { id: 'date', label: 'Created Date' },
  ];

  // Filter options (we'll use a custom chapter filter instead)
  const filterOptions = [{ id: 'all', label: 'All Topics' }];

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    // First filter by search term
    let filtered = topics.filter((topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then apply the chapter filter
    if (chapterFilter !== 'all') {
      filtered = filtered.filter((topic) => topic.chapter_id === chapterFilter);
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (selectedSort === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (selectedSort === 'chapter') {
        const chapterA = getChapterTitle(a.chapter_id);
        const chapterB = getChapterTitle(b.chapter_id);
        comparison = chapterA.localeCompare(chapterB);
      } else if (selectedSort === 'date') {
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    topics,
    searchTerm,
    chapterFilter,
    selectedSort,
    sortDirection,
    getChapterTitle,
  ]);

  // Pagination calculation
  const totalItems = filteredTopics.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTopics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTopics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTopics, currentPage, itemsPerPage]);

  // Toggle sort direction
  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

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

      {/* Search and Filter Controls */}
      <div className="mb-4 space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search topics..."
          className="w-full md:w-64"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Chapter
            </label>
            <select
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <FilterSortControls
            sortOptions={sortOptions}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            sortDirection={sortDirection}
            onSortDirectionChange={handleSortDirectionToggle}
            filterOptions={filterOptions}
            selectedFilter="all"
            onFilterChange={() => {}}
          />
        </div>
      </div>

      {/* Topic Data Table */}
      <DataTableCardView<Topic>
        data={paginatedTopics}
        isLoading={loading}
        columns={columns}
        cardFields={cardFields}
        keyExtractor={(topic) => topic.id}
        emptyMessage="No topics found. Create your first topic to get started."
        actions={renderActions}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
