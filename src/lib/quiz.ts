import { supabase } from './supabase';
import { Question, Quiz } from '@/types/topics';
import { logger } from './logger';

export async function getQuizQuestions(subject: string, topic: string) {
  // Placeholder function to simulate fetching quiz questions
  logger.log(`Fetching questions for subject: ${subject}, topic: ${topic}`);
  return [
    {
      id: 1,
      question: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      answer: '4',
    },
    {
      id: 2,
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin'],
      answer: 'Paris',
    },
  ];
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();
  if (error) {
    logger.error('Error fetching quiz:', error);
    return null;
  }

  return data;
}

export async function getQuizWithQuestions(
  quizId: string
): Promise<{ quiz: Quiz; questions: Question[] } | null> {
  try {
    // Fetch the quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError)
      throw new Error(`Failed to fetch quiz: ${quizError.message}`);
    if (!quizData) throw new Error('Quiz not found');

    // Fetch questions for the quiz
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError)
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);

    // Fetch answers for all questions in one go using the in operator and question_id values
    if (questionsData && questionsData.length > 0) {
      const questionIds = questionsData.map((q) => q.id);

      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds)
        .order('order_index', { ascending: true });

      if (answersError)
        throw new Error(`Failed to fetch answers: ${answersError.message}`);

      // Attach answers to their respective questions
      const questionsWithAnswers = questionsData.map((question) => ({
        ...question,
        answers: answersData.filter(
          (answer) => answer.question_id === question.id
        ),
      }));

      return {
        quiz: quizData,
        questions: questionsWithAnswers,
      };
    }

    return {
      quiz: quizData,
      questions: questionsData || [],
    };
  } catch (error) {
    logger.error('Error in getQuizWithQuestions:', error);
    return null;
  }
}

export async function submitQuizAttempt({
  quizId,
  userId,
  score,
}: {
  quizId: string;
  userId: string;
  score: number;
  answers: { questionId: string; selectedAnswerIds: string[] }[];
}) {
  try {
    // Log attempt data for debugging
    logger.log('Submitting quiz attempt:', { quizId, userId, score });

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      logger.error('Invalid userId format:', userId);
      throw new Error(
        `Invalid userId format: ${userId}. Expected UUID format.`
      );
    }
    if (!uuidRegex.test(quizId)) {
      logger.error('Invalid quizId format:', quizId);
      throw new Error(
        `Invalid quizId format: ${quizId}. Expected UUID format.`
      );
    }

    // For now, we'll create a more resilient approach that doesn't depend on a specific table
    // First, check if the quiz_attempts table exists
    const { error: checkError } = await supabase
      .from('quiz_attempts')
      .select('count')
      .limit(1)
      .match((err: unknown) => {
        logger.log('Table check error:', err);
        return { data: null, error: err };
      }); // If we can't verify the table exists, store results in localStorage as a fallback
    if (checkError) {
      logger.log('Using localStorage fallback for quiz results'); // Store in localStorage as fallback
      const attemptData = {
        id: `local-${Date.now()}`,
        quiz_id: quizId,
        user_id: userId,
        score: score,
        completed: true,
        created_at: new Date().toISOString(),
      };

      // Get existing attempts or initialize empty array
      const existingAttempts = JSON.parse(
        localStorage.getItem('quiz_attempts') || '[]'
      );
      existingAttempts.push(attemptData);
      localStorage.setItem('quiz_attempts', JSON.stringify(existingAttempts));

      return attemptData;
    } // Import the leaderboardService to update user stats
    const { updateUserStats } = await import('@/services/leaderboardService');

    // Calculate XP based on score (simple formula - adjust as needed)
    const earnedXp = Math.round(score * 10); // 10 XP per correct answer

    // Update user stats for leaderboard
    await updateUserStats(userId, earnedXp, true); // If table exists, proceed with normal insert
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          quiz_id: quizId,
          user_id: userId,
          score: score,
          completed: true,
          // Add additional fields that match your schema
          quiz_title: null,
          subject: null,
          topic: null,
          time_taken: null,
        },
      ])
      .select()
      .single();
    if (attemptError) {
      logger.error('Insert error details:', attemptError); // Fallback to localStorage if insert fails
      const fallbackData = {
        id: `local-${Date.now()}`,
        quiz_id: quizId,
        user_id: userId,
        score: score,
        completed: true,
        created_at: new Date().toISOString(),
      };

      // Store in localStorage as fallback
      const existingAttempts = JSON.parse(
        localStorage.getItem('quiz_attempts') || '[]'
      );
      existingAttempts.push(fallbackData);
      localStorage.setItem('quiz_attempts', JSON.stringify(existingAttempts));

      return fallbackData;
    }

    // If we successfully saved to the database, return that data
    return attemptData;
  } catch (error) {
    logger.error('Error in submitQuizAttempt:', error);

    // Even in case of unexpected errors, provide a fallback result
    const fallbackData = {
      id: `local-fallback-${Date.now()}`,
      quiz_id: quizId,
      user_id: userId,
      score: score,
    };

    return fallbackData;
  }
}
