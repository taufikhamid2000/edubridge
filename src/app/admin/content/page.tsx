'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
  description: string;
  topic_count: number;
  quiz_count: number;
}

export default function AdminContentPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'quizzes' | 'topics'>(
    'subjects'
  );

  useEffect(() => {
    if (activeTab === 'subjects') {
      fetchSubjects();
    }
  }, [activeTab]);

  async function fetchSubjects() {
    try {
      setLoading(true);

      const { data, error } = await supabase.from('subjects').select(`
          *,
          topics:topics(count),
          quizzes:quizzes(count)
        `);

      if (error) {
        throw error;
      }

      const formattedSubjects = data.map((subject) => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        topic_count: subject.topics[0]?.count || 0,
        quiz_count: subject.quizzes[0]?.count || 0,
      }));

      setSubjects(formattedSubjects);
    } catch (error) {
      logger.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {activeTab === 'subjects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">
                    Subject Management
                  </h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                    Add New Subject
                  </button>
                </div>{' '}
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
                          {' '}
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
                      </thead>{' '}
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
                            </td>{' '}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/admin/content/subjects/${subject.id}`}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                              >
                                Edit
                              </Link>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
            )}{' '}
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
