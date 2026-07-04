import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { checkAdminAccess } from './adminAuthService';

/**
 * Interface for Chapter structure
 */
export interface Chapter {
  id: string;
  subject_id: string;
  name: string; // Was previously called 'title', standardized as part of field naming conventions
  form: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  topic_count?: number;
}

/**
 * Fetches all chapters with topic counts
 * @returns A promise with chapters data and error status
 */
export async function fetchAdminChapters(): Promise<{
  data: Chapter[] | null;
  error: Error | null;
}> {
  try {
    // Verify admin access
    const { success, error } = await checkAdminAccess();

    if (!success) {
      return { data: null, error };
    } // User is confirmed as admin, proceed with fetch
    logger.log('Fetching chapters as admin...');

    // Get all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .order('name', { ascending: true });

    if (chaptersError) {
      logger.error('Error fetching chapters:', chaptersError);
      return {
        data: null,
        error: new Error(chaptersError.message || 'Failed to fetch chapters'),
      };
    }
    logger.log('Chapters fetched successfully:', { count: chapters?.length });

    // Create a map to store topic counts per chapter
    const chapterTopicCounts: Record<string, number> = {};

    try {
      // Get all topics with their chapter IDs to count them
      const { data: topics } = await supabase
        .from('topics')
        .select('chapter_id');

      if (topics && topics.length > 0) {
        // Count topics by chapter
        topics.forEach((topic) => {
          if (topic.chapter_id) {
            chapterTopicCounts[topic.chapter_id] =
              (chapterTopicCounts[topic.chapter_id] || 0) + 1;
          }
        });
      }
    } catch (error) {
      logger.error('Error calculating topic counts:', error);
      // Continue with basic data
    }

    // Format the chapters with topic counts
    const formattedChapters = chapters.map((chapter) => ({
      ...chapter,
      topic_count: chapterTopicCounts[chapter.id] || 0,
    }));

    return { data: formattedChapters, error: null };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'Unknown error in fetchAdminChapters'
          );

    logger.error('Error in fetchAdminChapters:', err);
    logger.error('Full error details:', error);
    return { data: null, error: err };
  }
}

/**
 * Creates a new chapter via MyQuiza (POST /api/v1/chapters, moderator-only)
 * @param chapterData The chapter data to create
 * @returns A promise with the created chapter ID or error
 */
export async function createChapter(chapterData: {
  name: string;
  subject_id: string;
  form: number;
  order_index?: number;
}): Promise<{
  id: string | null;
  error: Error | null;
}> {
  try {
    // If order_index is not provided, get the max index for the subject and add 1
    let orderIndex = chapterData.order_index;
    if (orderIndex === undefined) {
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('subject_id', chapterData.subject_id)
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

    const res = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: chapterData.name,
        subjectId: chapterData.subject_id,
        form: chapterData.form,
        orderIndex,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { id: null, error: new Error(data.error || 'Failed to create chapter') };
    }

    return { id: data.id, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in createChapter:', err);
    return { id: null, error: err };
  }
}

/**
 * Updates an existing chapter via MyQuiza (PATCH /api/v1/chapters/{id})
 * @param id The ID of the chapter to update
 * @param chapterData The updated chapter data
 * @returns A promise with success status and error
 */
export async function updateChapter(
  id: string,
  chapterData: {
    name?: string;
    subject_id?: string;
    form?: number;
    order_index?: number;
  }
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const res = await fetch(`/api/admin/chapters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: chapterData.name,
        subjectId: chapterData.subject_id,
        form: chapterData.form,
        orderIndex: chapterData.order_index,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: new Error(data.error || 'Failed to update chapter'),
      };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in updateChapter:', err);
    return { success: false, error: err };
  }
}

/**
 * Deletes a chapter via MyQuiza (DELETE /api/v1/chapters/{id}). Guarded
 * server-side — returns a 409 (surfaced as an Error here) if any topics
 * still exist under this chapter.
 * @param id The ID of the chapter to delete
 * @returns A promise with success status and error
 */
export async function deleteChapter(id: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const res = await fetch(`/api/admin/chapters/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: new Error(data.error || 'Failed to delete chapter'),
      };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in deleteChapter:', err);
    return { success: false, error: err };
  }
}
