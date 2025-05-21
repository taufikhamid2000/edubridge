'use client';

import { useState, useMemo } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Subject, createSubject, deleteSubject } from '@/services';
import {
  DataTableCardView,
  type Column,
  type CardField,
  SearchBar,
  FilterSortControls,
  type SortDirection,
  Pagination,
} from '@/components/admin/ui';

interface SubjectManagementProps {
  subjects: Subject[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  refreshSubjects: () => Promise<void>;
}

export default function SubjectManagement({
  subjects,
  loading,
  setLoading,
  setError,
  setSuccessMessage,
  refreshSubjects,
}: SubjectManagementProps) {
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });

  // Pagination, filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter options for the subjects
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'with-topics', label: 'With Topics' },
    { id: 'without-topics', label: 'Without Topics' },
  ];

  // Sort options for the subjects
  const sortOptions = [
    { id: 'name', label: 'Name' },
    { id: 'topics', label: 'Topics Count' },
    { id: 'quizzes', label: 'Quizzes Count' },
  ];

  // Filter and sort subjects
  const filteredSubjects = useMemo(() => {
    // First filter by search term
    let filtered = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.description &&
          subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Then apply the selected filter
    if (selectedFilter === 'with-topics') {
      filtered = filtered.filter((subject) => subject.topic_count > 0);
    } else if (selectedFilter === 'without-topics') {
      filtered = filtered.filter((subject) => subject.topic_count === 0);
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0;
      if (selectedSort === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (selectedSort === 'topics') {
        comparison = (a.topic_count || 0) - (b.topic_count || 0);
      } else if (selectedSort === 'quizzes') {
        comparison = (a.quiz_count || 0) - (b.quiz_count || 0);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [subjects, searchTerm, selectedFilter, selectedSort, sortDirection]);

  // Pagination calculation
  const totalItems = filteredSubjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubjects, currentPage, itemsPerPage]);

  // Toggle sort direction
  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Function to handle subject creation
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!newSubject.name.trim()) {
        setError('Subject name is required');
        return;
      }

      const { id, error } = await createSubject({
        name: newSubject.name,
        description: newSubject.description,
      });

      if (error) {
        throw error;
      }

      if (!id) {
        throw new Error('Failed to create subject');
      }

      // Refresh subjects list
      await refreshSubjects();

      // Reset form and hide it
      setNewSubject({ name: '', description: '' });
      setShowNewSubjectForm(false);
      setSuccessMessage(`Subject "${newSubject.name}" created successfully!`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to create subject: ${errorMessage}`);
      logger.error('Error creating subject:', error);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle subject deletion
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the subject "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { success, error } = await deleteSubject(id);

      if (error) {
        throw error;
      }

      if (!success) {
        throw new Error('Failed to delete subject');
      }

      // Refresh the subject list
      await refreshSubjects();
      setSuccessMessage(`Subject "${name}" deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Failed to delete subject: ${errorMessage}`);
      logger.error('Error deleting subject:', error);
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataTableCardView
  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (subject) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {subject.name}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (subject) => (
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {subject.description}
        </div>
      ),
    },
    {
      key: 'topics',
      header: 'Topics',
      render: (subject) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subject.topic_count}
        </div>
      ),
    },
    {
      key: 'quizzes',
      header: 'Quizzes',
      render: (subject) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subject.quiz_count}
        </div>
      ),
    },
  ];

  // Define card fields for mobile view
  const cardFields: CardField<Subject>[] = [
    {
      key: 'name',
      label: 'Name',
      isHeader: true,
      render: (subject) => (
        <div className="text-base font-medium text-gray-900 dark:text-gray-100">
          {subject.name}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (subject) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subject.description}
        </div>
      ),
    },
    {
      key: 'topics',
      label: 'Topics',
      render: (subject) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {subject.topic_count}
        </div>
      ),
    },
    {
      key: 'quizzes',
      label: 'Quizzes',
      render: (subject) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {subject.quiz_count}
        </div>
      ),
    },
  ];

  // Actions render function
  const renderActions = (subject: Subject) => (
    <>
      <Link
        href={`/admin/content/subjects/${subject.id}`}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
      >
        Edit
      </Link>
      <button
        onClick={() => handleDeleteSubject(subject.id, subject.name)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </>
  );
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Subject Management
        </h2>
        <button
          onClick={() => setShowNewSubjectForm(!showNewSubjectForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {showNewSubjectForm ? 'Cancel' : 'Add New Subject'}
        </button>
      </div>

      {/* Search and filter controls */}
      <div className="mb-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search subjects..."
          className="mb-3"
        />

        <FilterSortControls
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          filterOptions={filterOptions}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          sortOptions={sortOptions}
          sortDirection={sortDirection}
          onSortDirectionChange={handleSortDirectionToggle}
          perPageOptions={[5, 10, 25, 50]}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {showNewSubjectForm && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <h3 className="text-lg font-medium mb-3 dark:text-white">
            Create New Subject
          </h3>
          <form onSubmit={handleCreateSubject}>
            <div className="mb-3">
              <label
                htmlFor="subject-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Subject Name
              </label>
              <input
                id="subject-name"
                type="text"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter subject name"
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="subject-desc"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="subject-desc"
                value={newSubject.description}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter subject description"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTableCardView<Subject>
        data={paginatedSubjects}
        isLoading={loading}
        columns={columns}
        cardFields={cardFields}
        keyExtractor={(subject) => subject.id}
        emptyMessage="No subjects found. Create your first subject to get started."
        emptyFilteredMessage="No subjects match your search or filter criteria."
        isFiltered={searchTerm !== '' || selectedFilter !== 'all'}
        actions={renderActions}
      />

      {/* Pagination controls */}
      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
