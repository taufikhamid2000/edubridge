import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { checkAdminAccess } from './adminAuthService';
import { Topic as TopicType, Chapter, Subject, Quiz } from '@/types/topics';

/**
 * Interface for Topic structure
 */
export interface Topic {
  id: string;
  chapter_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  quiz_count?: number;
}

/**
 * Fetches all topics with quiz counts
 * @returns A promise with topics data and error status
 */
export async function fetchAdminTopics(): Promise<{
  data: Topic[] | null;
  error: Error | null;
}> {
  try {
    // Verify admin access
    const { success, error } = await checkAdminAccess();

    if (!success) {
      return { data: null, error };
    }

    // User is confirmed as admin, proceed with fetch
    console.log('Fetching topics as admin...');

    // Get all topics
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .order('order_index', { ascending: true });

    if (topicsError) {
      logger.error('Error fetching topics:', topicsError);
      return {
        data: null,
        error: new Error(topicsError.message || 'Failed to fetch topics'),
      };
    }
    console.log('Topics fetched successfully:', { count: topics?.length });

    // Create a map to store quiz counts per topic
    const topicQuizCounts: Record<string, number> = {};

    try {
      // Get all quizzes with their topic IDs to count them
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('topic_id');

      if (quizzes && quizzes.length > 0) {
        // Count quizzes by topic
        quizzes.forEach((quiz) => {
          if (quiz.topic_id) {
            topicQuizCounts[quiz.topic_id] =
              (topicQuizCounts[quiz.topic_id] || 0) + 1;
          }
        });
      }
    } catch (error) {
      console.error('Error calculating quiz counts:', error);
      // Continue with basic data
    }

    // Format the topics with quiz counts
    const formattedTopics = topics.map((topic) => ({
      ...topic,
      quiz_count: topicQuizCounts[topic.id] || 0,
    }));

    return { data: formattedTopics, error: null };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'Unknown error in fetchAdminTopics'
          );

    logger.error('Error in fetchAdminTopics:', err);
    console.error('Full error details:', error);
    return { data: null, error: err };
  }
}

/**
 * Creates a new topic
 * @param topicData The topic data to create
 * @returns A promise with the created topic ID or error
 */
export async function createTopic(topicData: {
  name: string;
  chapter_id: string;
  order_index?: number;
}): Promise<{
  id: string | null;
  error: Error | null;
}> {
  try {
    // Check admin access
    const { success, error: accessError } = await checkAdminAccess();

    if (!success) {
      return { id: null, error: accessError };
    }

    // If order_index is not provided, get the max index for the chapter and add 1
    let orderIndex = topicData.order_index;
    if (orderIndex === undefined) {
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('topics')
        .select('order_index')
        .eq('chapter_id', topicData.chapter_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      if (maxOrderError && maxOrderError.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        logger.error('Error getting max order index:', maxOrderError);
        return { id: null, error: maxOrderError };
      }
      orderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;
    }

    // Insert the new topic
    const { data, error } = await supabase
      .from('topics')
      .insert({
        name: topicData.name,
        chapter_id: topicData.chapter_id,
        order_index: orderIndex,
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error creating topic:', error);
      return { id: null, error };
    }

    return { id: data.id, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in createTopic:', err);
    return { id: null, error: err };
  }
}

/**
 * Updates an existing topic
 * @param id The ID of the topic to update
 * @param topicData The updated topic data
 * @returns A promise with success status and error
 */
export async function updateTopic(
  id: string,
  topicData: {
    title?: string;
    chapter_id?: string;
    content?: string;
    order_index?: number;
  }
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    // Check admin access
    const { success, error: accessError } = await checkAdminAccess();

    if (!success) {
      return { success: false, error: accessError };
    }

    // Update the topic
    const { error } = await supabase
      .from('topics')
      .update(topicData)
      .eq('id', id);

    if (error) {
      logger.error('Error updating topic:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in updateTopic:', err);
    return { success: false, error: err };
  }
}

/**
 * Deletes a topic
 * @param id The ID of the topic to delete
 * @returns A promise with success status and error
 */
export async function deleteTopic(id: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    // Check admin access
    const { success, error: accessError } = await checkAdminAccess();

    if (!success) {
      return { success: false, error: accessError };
    }

    // Check if there are quizzes associated with this topic
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('topic_id', id)
      .limit(1);

    if (quizzesError) {
      logger.error('Error checking for related quizzes:', quizzesError);
      return { success: false, error: quizzesError };
    }

    if (quizzes && quizzes.length > 0) {
      return {
        success: false,
        error: new Error('Cannot delete topic with associated quizzes'),
      };
    }

    // Delete the topic
    const { error } = await supabase.from('topics').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting topic:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in deleteTopic:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch topic data with chapter, subject, and quizzes via API
 */
export async function fetchTopicDataAPI(topicId: string): Promise<{
  topic: TopicType | null;
  chapter: Chapter | null;
  subject: Subject | null;
  quizzes: Quiz[];
  error?: string;
}> {
  try {
    logger.log(`Fetching topic data via API: ${topicId}`);

    const response = await fetch(`/api/topics/${topicId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    logger.log(`Successfully fetched topic data via API for topic: ${topicId}`);
    
    return {
      topic: data.topic,
      chapter: data.chapter,
      subject: data.subject,
      quizzes: data.quizzes,
    };
  } catch (error) {
    logger.error('Error fetching topic data via API:', error);
    return {
      topic: null,
      chapter: null,
      subject: null,
      quizzes: [],
      error: error instanceof Error ? error.message : 'Failed to fetch topic data',
    };
  }
}
