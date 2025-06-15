/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Question } from '@/types/topics';
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';
import QuizResults from './QuizResults';
import { useRouter } from 'next/navigation';
import { submitQuizAttempt } from '@/lib/quiz';
import { logger } from '@/lib/logger';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface TopicContext {
  topicTitle: string;
  chapterTitle: string;
  subjectName: string;
  form?: number;
}

interface QuizPlayerProps {
  quizId: string;
  quizName: string;
  questions: Question[];
  timeLimit?: number; // Time limit in minutes
  userId: string;
  subject?: string; // Added for navigation
  topic?: string; // Added for navigation
  onComplete?: () => void;
  topicContext?: TopicContext | null;
  isVerified?: boolean; // Quiz verification status
}

export default function QuizPlayer({
  quizId,
  quizName,
  questions,
  timeLimit,
  userId,
  subject,
  topic,
  onComplete,
  topicContext,
  isVerified = true,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    timeLimit ? timeLimit * 60 : 0
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const router = useRouter();
  // Initialize shuffled questions when component mounts or questions change
  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = shuffleArray(questions);
      setShuffledQuestions(shuffled);
      // Log the randomization for verification
      logger.log('Quiz questions shuffled:', {
        originalOrder: questions.map((q) => q.id.slice(-8)),
        shuffledOrder: shuffled.map((q) => q.id.slice(-8)),
      });
    }
  }, [questions]);
  // Function to reset quiz state for retaking
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setTimeRemaining(timeLimit ? timeLimit * 60 : 0);
    setQuizStarted(false);
    // Re-shuffle questions for a fresh experience on retake
    const reshuffled = shuffleArray(questions);
    setShuffledQuestions(reshuffled);
    logger.log('Quiz questions re-shuffled on retake:', {
      newOrder: reshuffled.map((q) => q.id.slice(-8)),
    });
  };

  // Start quiz timer when quiz is started
  useEffect(() => {
    if (!quizStarted || !timeLimit || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLimit, quizCompleted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (
    questionId: string,
    selectedAnswers: string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswers,
    }));
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const calculateScore = (): number => {
    let correctAnswers = 0;
    const totalQuestions = shuffledQuestions.length;

    shuffledQuestions.forEach((question) => {
      if (!question.answers) return;

      const userAnswers = answers[question.id] || [];

      if (question.type === 'radio') {
        // For radio questions, check if the selected answer is correct
        const correctAnswerIds = question.answers
          .filter((a) => a.is_correct)
          .map((a) => a.id);

        if (
          correctAnswerIds.length === 1 &&
          userAnswers.includes(correctAnswerIds[0])
        ) {
          correctAnswers += 1;
        }
      } else if (question.type === 'checkbox') {
        // For checkbox questions, all correct options must be selected and no incorrect ones
        const correctAnswerIds = new Set(
          question.answers.filter((a) => a.is_correct).map((a) => a.id)
        );
        const incorrectAnswerIds = new Set(
          question.answers.filter((a) => !a.is_correct).map((a) => a.id)
        );

        // Check if user selected all correct answers and no incorrect ones
        const allCorrectSelected = Array.from(correctAnswerIds).every((id) =>
          userAnswers.includes(id)
        );
        const noIncorrectSelected = !userAnswers.some((id) =>
          incorrectAnswerIds.has(id)
        );

        if (allCorrectSelected && noIncorrectSelected) {
          correctAnswers += 1;
        }
      }
    });

    // Calculate percentage score
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleQuizSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setQuizCompleted(true);

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedAnswerIds]) => ({
          questionId,
          selectedAnswerIds,
        })
      );

      // Submit quiz attempt to the server
      await submitQuizAttempt({
        quizId,
        userId,
        score: finalScore,
        answers: formattedAnswers,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Error submitting quiz:', error);
      // You could add error handling UI here
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  if (!quizStarted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz: {quizName}</h2>

        {/* Unverified quiz warning */}
        {!isVerified && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Unverified Quiz
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    This quiz has not been verified by administrators.
                    <strong> No points or XP will be awarded</strong> for
                    completing this quiz. The content may not have been reviewed
                    for accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {topicContext && (
          <div className="mb-4 text-gray-600 dark:text-gray-300">
            <p className="mb-1">
              <strong>Topic:</strong> {topicContext.topicTitle}
            </p>
            <p className="mb-1">
              <strong>Chapter:</strong> {topicContext.chapterTitle} (Form{' '}
              {topicContext.form})
            </p>
            <p className="mb-1">
              <strong>Subject:</strong> {topicContext.subjectName}
            </p>
          </div>
        )}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            This quiz contains {shuffledQuestions.length} questions.
          </p>
          {timeLimit && (
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              You will have {timeLimit} minutes to complete this quiz.
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300">
            Click the button below to start the quiz.
          </p>
        </div>
        <button
          onClick={handleStartQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Quiz
        </button>
      </div>
    );
  }
  if (quizCompleted) {
    return (
      <QuizResults
        score={score}
        totalQuestions={shuffledQuestions.length}
        answers={answers}
        questions={shuffledQuestions}
        isVerified={isVerified}
        onRetake={resetQuiz}
        onViewAll={() => {
          if (subject && topic) {
            router.push(`/quiz/${subject}/${topic}`);
          } else {
            router.push('/dashboard');
          }
        }}
      />
    );
  }

  // Don't render if shuffledQuestions is not ready
  if (shuffledQuestions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Preparing quiz questions...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{quizName}</h2>
        {timeLimit && (
          <div
            className={`px-4 py-2 rounded-md font-mono ${
              timeRemaining < 60
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}
          >
            Time: {formatTime(timeRemaining)}
          </div>
        )}
      </div>{' '}
      <QuizProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={shuffledQuestions.length}
        answeredQuestions={Object.keys(answers).length}
      />
      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          selectedAnswers={answers[currentQuestion.id] || []}
          onAnswerChange={(selectedAnswers) =>
            handleAnswerChange(currentQuestion.id, selectedAnswers)
          }
        />
      )}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-md ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Previous
        </button>

        {currentQuestionIndex < shuffledQuestions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleQuizSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
