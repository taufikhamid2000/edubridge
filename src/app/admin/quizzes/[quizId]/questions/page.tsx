'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Link from 'next/link';

type QuestionType = 'radio' | 'checkbox';

interface QuestionAnswer {
  id?: string;
  text: string;
  isCorrect: boolean;
  order_index?: number;
}

interface Question {
  id?: string;
  text: string;
  type: QuestionType;
  answers: QuestionAnswer[];
  tempId: string;
  order_index?: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  subject_name: string;
  topic_name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  passing_score: number;
  question_count: number;
  created_at: string;
}

export default function AdminQuizQuestionsPage() {
  const router = useRouter();
  const { quizId } = useParams() as { quizId: string };

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetchQuizData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  async function fetchQuizData() {
    try {
      setLoading(true);

      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select(
          `
          *,
          subjects(name),
          topics(name)
        `
        )
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      if (!quizData) {
        setError('Quiz not found');
        return;
      }

      // Format quiz data
      const formattedQuiz: QuizData = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        subject_name: quizData.subjects?.name,
        topic_name: quizData.topics?.name,
        difficulty: quizData.difficulty,
        time_limit: quizData.time_limit,
        passing_score: quizData.passing_score,
        question_count: quizData.question_count || 0,
        created_at: quizData.created_at,
      };

      setQuiz(formattedQuiz);

      // Fetch quiz questions and answers
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*, answers(*)')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length > 0) {
        // Transform questions data to our format
        const formattedQuestions: Question[] = questionsData.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type as QuestionType,
          order_index: q.order_index,
          answers: q.answers
            ? q.answers
                .map(
                  (a: {
                    id: string;
                    text: string;
                    is_correct: boolean;
                    order_index?: number;
                  }) => ({
                    id: a.id,
                    text: a.text,
                    isCorrect: a.is_correct,
                    order_index: a.order_index,
                  })
                )
                .sort(
                  (a: QuestionAnswer, b: QuestionAnswer) =>
                    (a.order_index || 0) - (b.order_index || 0)
                )
            : [],
          tempId: q.id,
        }));

        setQuestions(formattedQuestions);
      } else {
        // Start with one empty question for new quizzes
        addNewQuestion();
      }
    } catch (error) {
      logger.error('Error fetching quiz data:', error);
      setError('Failed to load quiz data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function addNewQuestion() {
    const newQuestion: Question = {
      text: '',
      type: 'radio', // Default to single choice
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      tempId: `new-${Date.now()}`,
    };

    setQuestions((prev) => [...prev, newQuestion]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(
    index: number,
    field: keyof Question,
    value: string | QuestionType | QuestionAnswer[]
  ) {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  function updateAnswer(
    questionIndex: number,
    answerIndex: number,
    field: keyof QuestionAnswer,
    value: string | boolean | number
  ) {
    setQuestions(
      questions.map((q, qIndex) => {
        if (qIndex !== questionIndex) return q;

        const updatedAnswers = [...q.answers];
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex],
          [field]: value,
        };

        // For radio buttons, ensure only one answer is correct
        if (field === 'isCorrect' && value === true && q.type === 'radio') {
          updatedAnswers.forEach((_, aIndex) => {
            if (aIndex !== answerIndex) {
              updatedAnswers[aIndex] = {
                ...updatedAnswers[aIndex],
                isCorrect: false,
              };
            }
          });
        }

        return { ...q, answers: updatedAnswers };
      })
    );
  }

  function addAnswer(questionIndex: number) {
    setQuestions(
      questions.map((q, qIndex) => {
        if (qIndex !== questionIndex) return q;
        return {
          ...q,
          answers: [...q.answers, { text: '', isCorrect: false }],
        };
      })
    );
  }

  function removeAnswer(questionIndex: number, answerIndex: number) {
    setQuestions(
      questions.map((q, qIndex) => {
        if (qIndex !== questionIndex) return q;

        // Don't remove if fewer than 2 answers would remain
        if (q.answers.length <= 2) return q;

        const updatedAnswers = q.answers.filter(
          (_, aIndex) => aIndex !== answerIndex
        );

        // Ensure at least one answer is correct after removal
        if (
          !updatedAnswers.some((a) => a.isCorrect) &&
          updatedAnswers.length > 0
        ) {
          updatedAnswers[0] = { ...updatedAnswers[0], isCorrect: true };
        }

        return { ...q, answers: updatedAnswers };
      })
    );
  }

  async function handleSaveQuestions() {
    try {
      // Validate questions
      for (const [index, question] of questions.entries()) {
        if (!question.text.trim()) {
          setError(`Question ${index + 1} text is required`);
          return;
        }

        if (question.answers.length < 2) {
          setError(`Question ${index + 1} must have at least 2 answers`);
          return;
        }

        for (const [aIndex, answer] of question.answers.entries()) {
          if (!answer.text.trim()) {
            setError(
              `Answer ${aIndex + 1} in question ${index + 1} text is required`
            );
            return;
          }
        }

        if (!question.answers.some((a) => a.isCorrect)) {
          setError(
            `Question ${index + 1} must have at least one correct answer`
          );
          return;
        }
      }

      setSaving(true);
      setError('');

      // Delete existing questions and answers
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId);

      if (deleteError) throw deleteError;

      // Save all questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Insert question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_id: quizId,
            text: question.text,
            type: question.type,
            order_index: i,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert answers for this question
        const answerRows = question.answers.map((a, aIndex) => ({
          question_id: questionData.id,
          text: a.text,
          is_correct: a.isCorrect,
          order_index: aIndex,
        }));

        const { error: answerError } = await supabase
          .from('answers')
          .insert(answerRows);

        if (answerError) throw answerError;
      }
      // Update quiz question count in the database
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({
          question_count: questions.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quizId);

      if (updateError) throw updateError;

      setSuccess('Questions saved successfully');

      // Refresh quiz data to update question count
      fetchQuizData();
    } catch (error) {
      logger.error('Error saving questions:', error);
      setError('Failed to save questions. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
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
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <Link
                  href="/admin/quizzes"
                  className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
                >
                  ← Back to Quizzes
                </Link>
                <h1 className="text-3xl font-bold">
                  {quiz?.title || 'Quiz'}: Questions
                </h1>
                <div className="text-gray-500 mt-1">
                  {quiz?.subject_name} / {quiz?.topic_name}
                </div>
              </div>{' '}
              <div>
                <Link
                  href={`/admin/quizzes/${quizId}/preview`}
                  className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600"
                >
                  Preview Quiz
                </Link>
                <Link
                  href={`/admin/quizzes/${quizId}/edit`}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded mr-2 hover:bg-gray-300"
                >
                  Edit Quiz Details
                </Link>
              </div>
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

          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Difficulty</p>
                <p className="mt-1">
                  {' '}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      quiz?.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : quiz?.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {quiz?.difficulty
                      ? quiz.difficulty.charAt(0).toUpperCase() +
                        quiz.difficulty.slice(1)
                      : 'Medium'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Time Limit</p>
                <p className="mt-1">
                  {Math.floor((quiz?.time_limit || 0) / 60)} minutes{' '}
                  {(quiz?.time_limit || 0) % 60} seconds
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Passing Score
                </p>
                <p className="mt-1">{quiz?.passing_score || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Questions</h2>

              {questions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    No questions yet. Add your first question below.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {questions.map((question, qIndex) => (
                    <div
                      key={question.tempId}
                      className="border border-gray-200 rounded-lg p-5"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          Question {qIndex + 1}
                        </h3>
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Text
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'text', e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question here"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question Type
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={question.type === 'radio'}
                              onChange={() =>
                                updateQuestion(qIndex, 'type', 'radio')
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Single choice
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={question.type === 'checkbox'}
                              onChange={() =>
                                updateQuestion(qIndex, 'type', 'checkbox')
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Multiple choice
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answers
                        </label>

                        <div className="space-y-3">
                          {question.answers.map((answer, aIndex) => (
                            <div
                              key={`${question.tempId}-answer-${aIndex}`}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex-shrink-0">
                                {question.type === 'radio' ? (
                                  <input
                                    type="radio"
                                    checked={answer.isCorrect}
                                    onChange={() =>
                                      updateAnswer(
                                        qIndex,
                                        aIndex,
                                        'isCorrect',
                                        true
                                      )
                                    }
                                    name={`question-${qIndex}-answers`}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={answer.isCorrect}
                                    onChange={(e) =>
                                      updateAnswer(
                                        qIndex,
                                        aIndex,
                                        'isCorrect',
                                        e.target.checked
                                      )
                                    }
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                                  />
                                )}
                              </div>

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={answer.text}
                                  onChange={(e) =>
                                    updateAnswer(
                                      qIndex,
                                      aIndex,
                                      'text',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Answer ${aIndex + 1}`}
                                />
                              </div>

                              <button
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                disabled={question.answers.length <= 2}
                                className={`text-gray-400 hover:text-red-500 ${
                                  question.answers.length <= 2
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                type="button"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="mt-3 inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add Answer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addNewQuestion}
                className="mt-6 w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New Question
              </button>

              <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => router.push('/admin/quizzes')}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestions}
                  disabled={saving || questions.length === 0}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving || questions.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  type="button"
                >
                  {saving ? 'Saving...' : 'Save Questions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
