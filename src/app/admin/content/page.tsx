'use client';

import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import {
  Subject,
  Chapter,
  Topic,
  fetchAdminSubjects,
  fetchAdminChapters,
  fetchAdminTopics,
} from '@/services';
import SubjectManagement from '@/components/admin/content/SubjectManagement';
import ChapterManagement from '@/components/admin/content/ChapterManagement';
import TopicManagement from '@/components/admin/content/TopicManagement';
import QuizManagement from '@/components/admin/content/QuizManagement';

export default function AdminContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'subjects' | 'chapters' | 'topics' | 'quizzes'
  >('subjects');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  // Function to fetch chapters - wrapped in useCallback to avoid dependency issues
  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to fetch chapters via client-side service...');

      // Check admin status first
      const adminCheck = await checkAdminStatus();
      if (!adminCheck.isAdmin) {
        throw new Error(
          `${adminCheck.message}. Please check login-first.md for manual fix instructions.`
        );
      }

      // Use the contentService instead of direct Supabase calls
      console.log('Admin check passed, calling fetchAdminChapters');
      const { data, error } = await fetchAdminChapters();

      if (error) {
        console.error('contentService error:', error);
        throw new Error(
          `Failed to fetch chapters: ${error.message || 'Unknown error'} (Check browser console for more details)`
        );
      }

      if (!data) {
        throw new Error('No data returned from content service');
      }

      setChapters(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching chapters:', error);
      setError(errorMessage);

      console.error('Chapter fetch error details:', {
        error,
        message: errorMessage,
        errorType: typeof error,
        hasFields:
          error && typeof error === 'object' ? Object.keys(error) : 'N/A',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch topics - wrapped in useCallback to avoid dependency issues
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to fetch topics via client-side service...');

      // Check admin status first
      const adminCheck = await checkAdminStatus();
      if (!adminCheck.isAdmin) {
        throw new Error(
          `${adminCheck.message}. Please check login-first.md for manual fix instructions.`
        );
      }

      // Use the contentService instead of direct Supabase calls
      console.log('Admin check passed, calling fetchAdminTopics');
      const { data, error } = await fetchAdminTopics();

      if (error) {
        console.error('contentService error:', error);
        throw new Error(
          `Failed to fetch topics: ${error.message || 'Unknown error'} (Check browser console for more details)`
        );
      }

      if (!data) {
        throw new Error('No data returned from content service');
      }

      setTopics(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching topics:', error);
      setError(errorMessage);

      console.error('Topic fetch error details:', {
        error,
        message: errorMessage,
        errorType: typeof error,
        hasFields:
          error && typeof error === 'object' ? Object.keys(error) : 'N/A',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);
  // Function to handle the retry button
  const handleRetry = () => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'chapters') {
      fetchChapters();
    } else if (activeTab === 'topics') {
      fetchTopics();
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

  // Fetch chapters when active tab changes
  useEffect(() => {
    if (activeTab === 'chapters') {
      fetchChapters();
    }
  }, [activeTab, fetchChapters]);

  // Fetch topics when active tab changes
  useEffect(() => {
    if (activeTab === 'topics') {
      fetchTopics();
    }
  }, [activeTab, fetchTopics]);

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
                </div>{' '}
                <button
                  onClick={handleRetry}
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
          )}{' '}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'subjects' && (
              <SubjectManagement
                subjects={subjects}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                refreshSubjects={fetchSubjects}
              />
            )}
            {activeTab === 'chapters' && (
              <ChapterManagement
                chapters={chapters}
                subjects={subjects}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                refreshChapters={fetchChapters}
              />
            )}{' '}
            {activeTab === 'topics' && (
              <TopicManagement
                topics={topics}
                chapters={chapters}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
                refreshTopics={fetchTopics}
              />
            )}
            {activeTab === 'quizzes' && (
              <QuizManagement
                topics={topics}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setSuccessMessage={setSuccessMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
