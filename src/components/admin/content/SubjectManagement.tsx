'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Subject, createSubject, deleteSubject } from '@/services';
import {
  DataTableCardView,
  type Column,
  type CardField,
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
        data={subjects}
        isLoading={loading}
        columns={columns}
        cardFields={cardFields}
        keyExtractor={(subject) => subject.id}
        emptyMessage="No subjects found. Create your first subject to get started."
        actions={renderActions}
      />
    </div>
  );
}
