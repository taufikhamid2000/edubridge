'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';
import {
  Subject,
  fetchAdminSubjects,
  createSubject,
  deleteSubject,
} from '@/services/contentService';

export default function AdminContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'subjects' | 'chapters' | 'topics' | 'quizzes'
  >('subjects');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });

  // Function to check admin status
  const checkAdminStatus = async () => {
    // Check if user is logged in first by verifying Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return {
        isAdmin: false,
        message: 'You must be logged in to access the admin area',
      };
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      return { isAdmin: false, message: 'Error checking admin status' };
    }

    if (!data || data.role !== 'admin') {
      return { isAdmin: false, message: 'You do not have admin privileges' };
    }

    return { isAdmin: true, message: '' };
  };

  // Function to fetch subjects - wrapped in useCallback to avoid dependency issues
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to fetch subjects via client-side service...');

      // Check admin status first
      const adminCheck = await checkAdminStatus();
      if (!adminCheck.isAdmin) {
        throw new Error(
          `${adminCheck.message}. Please check login-first.md for manual fix instructions.`
        );
      }

      // Use the contentService instead of direct Supabase calls
      console.log('Admin check passed, calling fetchAdminSubjects');
      const { data, error } = await fetchAdminSubjects();

      if (error) {
        console.error('contentService error:', error);
        // More descriptive error with debugging info
        throw new Error(
          `Failed to fetch subjects: ${error.message || 'Unknown error'} (Check browser console for more details)`
        );
      }

      if (!data) {
        throw new Error('No data returned from content service');
      }

      setSubjects(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching subjects:', error);
      setError(errorMessage);

      // More detailed error logging
      console.error('Subject fetch error details:', {
        error,
        message: errorMessage,
        errorType: typeof error,
        hasFields:
          error && typeof error === 'object' ? Object.keys(error) : 'N/A',
        timestamp: new Date().toISOString(),
        authState: 'Checking auth state...',
      }); // Try to log auth state for debugging
      supabase.auth.getSession().then(({ data }) => {
        console.log('Current auth state:', {
          hasSession: !!data?.session,
          isExpired: data?.session?.expires_at
            ? new Date(data.session.expires_at * 1000) < new Date()
            : 'N/A',
          userId: data?.session?.user?.id || 'not authenticated',
        });
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
      await fetchSubjects();

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

      // Update local state to remove the deleted subject
      setSubjects(subjects.filter((subject) => subject.id !== id));
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

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch subjects when active tab changes
  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    }
  }, [activeTab, fetchSubjects]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">
              Content Management
            </h1>
            <div className="flex space-x-2">
              {' '}
              <button
                onClick={() => setActiveTab('subjects')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'subjects'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border dark:border-gray-600'
                }`}
              >
                Subjects
              </button>
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'chapters'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border dark:border-gray-600'
                }`}
              >
                Chapters
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'topics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border dark:border-gray-600'
                }`}
              >
                Topics
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'quizzes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border dark:border-gray-600'
                }`}
              >
                Quizzes
              </button>
            </div>
          </div>{' '}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                  <div className="mt-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            '/api/debug/database-structure'
                          );
                          const data = await response.json();
                          console.log('Database structure report:', data);
                          alert(
                            'Database structure report generated in console - check developer tools'
                          );
                        } catch (err) {
                          console.error(
                            'Error checking database structure:',
                            err
                          );
                        }
                      }}
                      className="text-sm underline text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
                    >
                      Check Database Structure
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => fetchSubjects()}
                  className="bg-red-200 hover:bg-red-300 text-red-800 font-bold py-2 px-4 rounded dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-900 dark:border-green-700 dark:text-green-300">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">Success:</p>
                  <p>{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="bg-green-200 hover:bg-green-300 text-green-800 font-bold py-2 px-4 rounded dark:bg-green-800 dark:hover:bg-green-700 dark:text-green-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'subjects' && (
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
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No subjects found. Create your first subject to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Topics
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quizzes
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {subjects.map((subject) => (
                          <tr key={subject.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {subject.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {subject.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {subject.topic_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {subject.quiz_count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/content/subjects/${subject.id}`}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteSubject(subject.id, subject.name)
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
                )}{' '}
              </div>
            )}

            {activeTab === 'chapters' && (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  Chapter Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Chapter management functionality will be implemented soon.
                </p>
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  Topic Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Topic management functionality will be implemented soon.
                </p>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">
                  Quiz Management
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Quiz management functionality will be implemented soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
