/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Question } from '@/types/topics';
import QuizQuestion from './QuizQuestion';
import QuizProgress from './QuizProgress';
import QuizResults from './QuizResults';
import { useRouter } from 'next/navigation';
import { submitQuizAttempt } from '@/lib/quiz';

interface QuizPlayerProps {
  quizId: string;
  quizName: string;
  questions: Question[];
  timeLimit?: number; // Time limit in minutes
  userId: string;
  onComplete?: () => void;
}

export default function QuizPlayer({
  quizId,
  quizName,
  questions,
  timeLimit,
  userId,
  onComplete,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    timeLimit ? timeLimit * 60 : 0
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const router = useRouter();

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
    if (currentQuestionIndex < questions.length - 1) {
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
    const totalQuestions = questions.length;

    questions.forEach((question) => {
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
      console.error('Error submitting quiz:', error);
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
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            This quiz contains {questions.length} questions.
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
        totalQuestions={questions.length}
        answers={answers}
        questions={questions}
        onRetake={() => router.refresh()}
        onViewAll={() => router.push('/dashboard')}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

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
      </div>

      <QuizProgress
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
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

        {currentQuestionIndex < questions.length - 1 ? (
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
