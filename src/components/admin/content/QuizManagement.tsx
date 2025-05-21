/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import {
  Quiz,
  Topic,
  fetchAdminQuizzes,
  createAdminQuiz as createQuiz,
  deleteQuiz,
} from '@/services';
import ContentLoadingState from './ContentLoadingState';
import ContentEmptyState from './ContentEmptyState';

interface QuizManagementProps {
  topics?: Topic[];
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
  setSuccessMessage?: (message: string | null) => void;
}

export default function QuizManagement({
  topics = [],
  loading: parentLoading = false,
  setLoading: setParentLoading = () => {},
  setError: setParentError = () => {},
  setSuccessMessage: setParentSuccessMessage = () => {},
}: QuizManagementProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    name: '',
    topic_id: '',
    difficulty_level: 'medium',
    time_limit_seconds: 300,
    passing_score: 70,
  });

  // Function to fetch quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      console.log('Attempting to fetch quizzes via client-side service...');

      const { data, error } = await fetchAdminQuizzes();

      if (error) {
        console.error('Quiz fetch error:', error);
        setError(`Failed to fetch quizzes: ${error.message}`);
        setParentError(`Failed to fetch quizzes: ${error.message}`);
        return;
      }

      if (!data) {
        setError('No quizzes data returned');
        setParentError('No quizzes data returned');
        return;
      }

      setQuizzes(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error fetching quizzes:', error);
      setError(`Failed to fetch quizzes: ${errorMessage}`);
      setParentError(`Failed to fetch quizzes: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to handle quiz creation
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      if (!newQuiz.name.trim()) {
        setError('Quiz name is required');
        setParentError('Quiz name is required');
        return;
      }

      if (!newQuiz.topic_id) {
        setError('Please select a topic');
        setParentError('Please select a topic');
        return;
      }

      const { error } = await createQuiz({
        name: newQuiz.name,
        topic_id: newQuiz.topic_id,
        difficulty_level: newQuiz.difficulty_level as
          | 'easy'
          | 'medium'
          | 'hard',
        time_limit_seconds: newQuiz.time_limit_seconds,
        passing_score: newQuiz.passing_score,
      });

      if (error) {
        setError(`Failed to create quiz: ${error.message}`);
        setParentError(`Failed to create quiz: ${error.message}`);
        return;
      }

      const message = 'Quiz created successfully!';
      setSuccessMessage(message);
      setParentSuccessMessage(message);
      setNewQuiz({
        name: '',
        topic_id: '',
        difficulty_level: 'medium',
        time_limit_seconds: 300,
        passing_score: 70,
      });
      setShowNewQuizForm(false);
      await fetchQuizzes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error creating quiz:', error);
      setError(`Failed to create quiz: ${errorMessage}`);
      setParentError(`Failed to create quiz: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to handle quiz deletion
  const handleDeleteQuiz = async (quizId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this quiz? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setParentLoading(true);
      setError(null);
      setParentError(null);

      const { error } = await deleteQuiz(quizId);

      if (error) {
        setError(`Failed to delete quiz: ${error.message}`);
        setParentError(`Failed to delete quiz: ${error.message}`);
        return;
      }

      const message = 'Quiz deleted successfully!';
      setSuccessMessage(message);
      setParentSuccessMessage(message);
      await fetchQuizzes();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Error deleting quiz:', error);
      setError(`Failed to delete quiz: ${errorMessage}`);
      setParentError(`Failed to delete quiz: ${errorMessage}`);
    } finally {
      setLoading(false);
      setParentLoading(false);
    }
  };

  // Function to get topic title by ID
  const getTopicTitle = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.title : 'Unknown Topic';
  };

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const isLoading = loading || parentLoading;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Quiz Management
        </h2>
        <button
          onClick={() => setShowNewQuizForm(!showNewQuizForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {showNewQuizForm ? 'Cancel' : 'Add New Quiz'}
        </button>
      </div>

      {error && !parentLoading && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {successMessage && !parentLoading && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex justify-between">
            <div>
              <p className="font-bold">Success:</p>
              <p>{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="bg-green-200 hover:bg-green-300 text-green-800 font-bold py-1 px-2 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showNewQuizForm && (
        <form
          onSubmit={handleCreateQuiz}
          className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Quiz Name
            </label>
            <input
              type="text"
              id="name"
              value={newQuiz.name}
              onChange={(e) => setNewQuiz({ ...newQuiz, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Topic
            </label>
            <select
              id="topic"
              value={newQuiz.topic_id}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, topic_id: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a Topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={newQuiz.difficulty_level}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, difficulty_level: e.target.value })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="time-limit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Time Limit (seconds)
            </label>
            <input
              type="number"
              id="time-limit"
              value={newQuiz.time_limit_seconds}
              onChange={(e) =>
                setNewQuiz({
                  ...newQuiz,
                  time_limit_seconds: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              min="60"
              max="3600"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="passing-score"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Passing Score (%)
            </label>
            <input
              type="number"
              id="passing-score"
              value={newQuiz.passing_score}
              onChange={(e) =>
                setNewQuiz({
                  ...newQuiz,
                  passing_score: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              min="1"
              max="100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <ContentLoadingState />
      ) : quizzes.length === 0 ? (
        <ContentEmptyState message="No quizzes found. Create your first quiz to get started." />
      ) : (
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {quiz.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getTopicTitle(quiz.topic_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        quiz.difficulty_level === 'easy'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : quiz.difficulty_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {quiz.difficulty_level || 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {quiz.question_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/questions`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit Questions
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
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
