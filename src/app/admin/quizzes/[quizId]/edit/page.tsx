'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams<{ quizId: string }>();
  const quizId = params?.quizId || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes in seconds
  const [passingScore, setPassingScore] = useState(70); // 70%

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubjectsAndTopics = useCallback(async () => {
    try {
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name', { ascending: true });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('id, name, subject_id')
        .order('name', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (error) {
      logger.error('Error fetching subjects and topics:', error);
      setError('Failed to load subjects and topics. Please try again.');
    }
  }, []);

  const fetchQuizData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      if (!quizData) {
        setError('Quiz not found');
        return;
      }

      // Set form data
      setTitle(quizData.title || '');
      setDescription(quizData.description || '');
      setSubjectId(quizData.subject_id || '');
      setTopicId(quizData.topic_id || '');
      setDifficulty(quizData.difficulty || 'medium');
      setTimeLimit(quizData.time_limit || 300);
      setPassingScore(quizData.passing_score || 70);

      // Fetch subjects and topics
      await fetchSubjectsAndTopics();
    } catch (error) {
      logger.error('Error fetching quiz data:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [quizId, fetchSubjectsAndTopics]);

  // Call fetchQuizData when component mounts
  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // Filter topics based on selected subject
  useEffect(() => {
    if (subjectId) {
      const filtered = topics.filter((topic) => topic.subject_id === subjectId);
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics([]);
    }
  }, [subjectId, topics]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (!subjectId) {
      setError('Please select a subject');
      return;
    }

    if (!topicId) {
      setError('Please select a topic');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Update quiz in database
      const { error } = await supabase
        .from('quizzes')
        .update({
          title,
          description: description.trim() || null,
          subject_id: subjectId,
          topic_id: topicId,
          difficulty,
          time_limit: timeLimit,
          passing_score: passingScore,
        })
        .eq('id', quizId);

      if (error) throw error;

      setSuccess('Quiz updated successfully!');

      // Redirect back to quizzes list after short delay
      setTimeout(() => {
        router.push('/admin/quizzes');
      }, 1500);
    } catch (error) {
      logger.error('Error updating quiz:', error);
      setError('Failed to update quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Link
                href="/admin/quizzes"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
              >
                ← Back to Quizzes
              </Link>
              <h1 className="text-3xl font-bold">Edit Quiz</h1>
            </div>
            <div>
              <Link
                href={`/admin/quizzes/${quizId}/questions`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Manage Questions
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
              <div className="flex justify-center">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter a descriptive quiz title"
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Provide a brief description of the quiz (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="topic"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="topic"
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      disabled={!subjectId || filteredTopics.length === 0}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">
                        {!subjectId
                          ? 'Select a subject first'
                          : filteredTopics.length === 0
                            ? 'No topics available for this subject'
                            : 'Select a topic'}
                      </option>
                      {filteredTopics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="difficulty"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(
                          e.target.value as 'easy' | 'medium' | 'hard'
                        )
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="time-limit"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      id="time-limit"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      min={60}
                      max={3600}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {Math.floor(timeLimit / 60)} minutes {timeLimit % 60}{' '}
                      seconds
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="passing-score"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      id="passing-score"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      min={0}
                      max={100}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Link
                    href="/admin/quizzes"
                    className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {saving ? 'Saving...' : 'Update Quiz'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
