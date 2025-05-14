'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  subject_id: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSubjectEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const subjectId = params?.id || '';

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'topics'>('details');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    if (!subjectId) {
      router.push('/admin/content');
      return;
    }

    fetchSubjectDetails(subjectId);
  }, [subjectId, router]);

  async function fetchSubjectDetails(id: string) {
    try {
      setLoading(true);

      // Fetch subject
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (subjectError) {
        throw subjectError;
      }

      setSubject(subject);
      setName(subject.name);
      setDescription(subject.description || '');
      setIconUrl(subject.icon_url || '');

      // Fetch topics
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', id)
        .order('name', { ascending: true });

      if (topicsError) {
        throw topicsError;
      }

      setTopics(topics || []);
    } catch (error) {
      logger.error('Error fetching subject details:', error);
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('subjects')
        .update({
          name,
          description,
          icon_url: iconUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subjectId);

      if (error) {
        throw error;
      }

      logger.log('Subject updated successfully');

      // Update local state
      if (subject) {
        setSubject({
          ...subject,
          name,
          description,
          icon_url: iconUrl || undefined,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Error updating subject:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTopic(topicId: string) {
    if (
      !confirm(
        'Are you sure you want to delete this topic? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) {
        throw error;
      }

      logger.log('Topic deleted successfully');

      // Update local state
      setTopics(topics.filter((topic) => topic.id !== topicId));
    } catch (error) {
      logger.error('Error deleting topic:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold mb-2">Subject Not Found</h2>
              <p className="mb-4">
                The subject you are looking for does not exist or has been
                deleted.
              </p>
              <Link
                href="/admin/content"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Return to Content Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link
                href="/admin/content"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
              >
                ← Back to Content
              </Link>
              <h1 className="text-3xl font-bold">
                Edit Subject: {subject.name}
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'topics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Topics ({topics.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="icon-url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Icon URL (optional)
                    </label>
                    <input
                      type="text"
                      id="icon-url"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                    />{' '}
                    {iconUrl && (
                      <div className="mt-2 flex items-center">
                        <div className="h-10 w-10 mr-2 relative">
                          <Image
                            src={iconUrl}
                            alt="Icon preview"
                            width={40}
                            height={40}
                            className="object-cover"
                            onError={() => {
                              // Using state update instead of directly modifying the DOM element
                              // to keep with React's principles
                              setIconUrl(
                                'https://via.placeholder.com/40?text=Error'
                              );
                            }}
                            unoptimized={iconUrl.startsWith('data:')}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          Icon preview
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Additional Information
                    </h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Created at:</span>{' '}
                        {new Date(subject.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Last updated:</span>{' '}
                        {new Date(subject.updated_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {subject.id}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'topics' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Topics
                    </h2>
                    <Link
                      href={`/admin/content/topics/new?subject=${subjectId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add New Topic
                    </Link>
                  </div>

                  {topics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No topics found for this subject. Add your first topic to
                      get started.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {topics.map((topic) => (
                            <tr key={topic.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {topic.name}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {topic.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/admin/content/topics/${topic.id}`}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  Edit
                                </Link>
                                <button
                                  className="text-red-600 hover:text-red-900"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
