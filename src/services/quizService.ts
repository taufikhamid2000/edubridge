/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function createQuiz(
  quizData: any
): Promise<{ success: boolean; quizId?: string; error?: string }> {
  try {
    logger.log('Creating quiz with data:', quizData);

    // Basic validation
    if (!quizData.name || quizData.name.trim() === '') {
      return {
        success: false,
        error: 'Quiz name is required',
      };
    }

    if (quizData.name.length < 5) {
      return {
        success: false,
        error: 'Quiz name must be at least 5 characters',
      };
    }

    if (!quizData.topic) {
      return {
        success: false,
        error: 'Topic ID is required',
      };
    }

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: 'Authentication required. Please log in to create a quiz.',
      };
    }

    // Prepare quiz data with only the fields that exist in the database schema
    const quizRecord = {
      name: quizData.name.trim(),
      topic_id: quizData.topic,
      created_by: session.user.id, // Use authenticated user ID
    };

    logger.log('Submitting quiz record to Supabase:', quizRecord);

    // Save quiz data to Supabase
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizRecord])
      .select();
    if (error) {
      logger.error('Supabase error creating quiz:', error);
      return {
        success: false,
        error: error.message || JSON.stringify(error),
      };
    }
    if (!data || data.length === 0) {
      logger.error('No data returned from quiz creation');
      return {
        success: false,
        error: 'Quiz created but no ID returned',
      };
    }

    logger.log('Quiz created successfully with data:', data);

    return {
      success: true,
      quizId: data[0].id,
    };
  } catch (err) {
    logger.error('Unexpected error creating quiz:', err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
