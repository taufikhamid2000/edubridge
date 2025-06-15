'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  subject_id: string;
  topic_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  created_at: string;
  subject_name?: string;
  topic_name?: string;
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      logger.error('Error fetching subjects:', error);
    }
  }

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('quizzes')
        .select(
          `
          *,
          subjects(name),
          topics(name)
        `
        )
        .order('created_at', { ascending: false });

      // Apply filters
      if (subjectFilter !== 'all') {
        query = query.eq('subject_id', subjectFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedQuizzes = data.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        subject_id: quiz.subject_id,
        topic_id: quiz.topic_id,
        difficulty: quiz.difficulty,
        question_count: quiz.question_count || 0,
        created_at: quiz.created_at,
        subject_name: quiz.subjects?.name,
        topic_name: quiz.topics?.name,
      }));

      setQuizzes(formattedQuizzes);
    } catch (error) {
      logger.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectFilter, difficultyFilter]);

  useEffect(() => {
    fetchSubjects();
    fetchQuizzes();
  }, [fetchQuizzes]);

  async function handleDeleteQuiz(quizId: string) {
    if (
      !confirm(
        'Are you sure you want to delete this quiz? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // First delete associated questions
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (quizError) throw quizError;

      logger.log('Quiz deleted successfully');

      // Update local state
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
    } catch (error) {
      logger.error('Error deleting quiz:', error);
    }
  }

  // Filter quizzes based on search term
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          {' '}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Quiz Management</h1>
            <div className="flex space-x-3">
              <Link
                href="/admin/quizzes/stats"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View Statistics
              </Link>
              <Link
                href="/admin/quizzes/new"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create New Quiz
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <button
                    onClick={() => fetchQuizzes()}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {quizzes.length === 0 ? (
                  <div>
                    <p className="mb-4">No quizzes found in the system.</p>
                    <Link
                      href="/admin/quizzes/new"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Create Your First Quiz
                    </Link>
                  </div>
                ) : (
                  <p>No quizzes match your search criteria.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject / Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quiz.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {quiz.subject_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quiz.topic_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              quiz.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : quiz.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {quiz.difficulty.charAt(0).toUpperCase() +
                              quiz.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quiz.question_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/quizzes/${quiz.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/quizzes/${quiz.id}/questions`}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Questions
                          </Link>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            className="text-red-600 hover:text-red-900"
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
        </div>
      </div>
    </div>
  );
}
