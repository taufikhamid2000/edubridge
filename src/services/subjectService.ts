import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { checkAdminAccess } from './adminAuthService';

/**
 * Interface for Subject data structure
 */
export interface Subject {
  id: string;
  name: string;
  description: string;
  topic_count: number;
  quiz_count: number;
}

/**
 * Interface for public subject data (simpler structure for public API)
 */
export interface PublicSubject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category?: string;
}

/**
 * Interface for chapter data
 */
export interface Chapter {
  id: number;
  name: string;
  form: number;
  order_index?: number;
}

/**
 * Interface for nested subject data from database
 */
interface SubjectWithNested {
  id: string;
  name: string;
  description: string;
  chapters?: {
    id: string;
    topics?: {
      id: string;
      quizzes?: { id: string }[];
    }[];
  }[];
}

/**
 * Fetches all subjects with their related topic and quiz counts (OPTIMIZED VERSION)
 * This replaces multiple N+1 queries with a single JOIN query
 * @returns A promise with subjects data and error status
 */
export async function fetchAdminSubjects(): Promise<{
  data: Subject[] | null;
  error: Error | null;
}> {
  try {
    // Verify admin access
    const { success, error } = await checkAdminAccess();

    if (!success) {
      return { data: null, error };
    }

    // User is confirmed as admin, proceed with fetch
    console.log('Fetching subjects as admin with optimized query...');

    // OPTIMIZED: Single query with JOINs to get all data at once
    // This replaces ~50+ individual queries with 1 query
    const { data: subjectsData, error: subjectsError } = await supabase.from(
      'subjects'
    ).select(`
        id,
        name,
        description,
        chapters(
          id,
          topics(
            id,
            quizzes(id)
          )
        )
      `);

    if (subjectsError) {
      logger.error('Error fetching subjects with nested data:', subjectsError);

      // Fallback: Get subjects without counts if JOIN fails
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name, description');

      if (subjects) {
        const formattedSubjects = subjects.map((subject) => ({
          ...subject,
          topic_count: 0,
          quiz_count: 0,
        }));
        return { data: formattedSubjects, error: null };
      }

      return {
        data: null,
        error: new Error(subjectsError.message || 'Failed to fetch subjects'),
      };
    }

    console.log('Subjects with nested data fetched successfully:', {
      count: subjectsData?.length,
    });

    // Process the nested data to calculate counts efficiently
    const formattedSubjects =
      subjectsData?.map((subject: SubjectWithNested) => {
        let topicCount = 0;
        let quizCount = 0;

        if (subject.chapters) {
          subject.chapters.forEach((chapter) => {
            if (chapter.topics) {
              topicCount += chapter.topics.length;
              chapter.topics.forEach((topic) => {
                if (topic.quizzes) {
                  quizCount += topic.quizzes.length;
                }
              });
            }
          });
        }

        return {
          id: subject.id,
          name: subject.name,
          description: subject.description,
          topic_count: topicCount,
          quiz_count: quizCount,
        };
      }) || [];

    return { data: formattedSubjects, error: null };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'Unknown error in fetchAdminSubjects'
          );

    logger.error('Error in fetchAdminSubjects:', err);
    console.error('Full error details:', error);
    return { data: null, error: err };
  }
}

/**
 * Fetches basic subjects without counts (for dashboard - FAST)
 * @returns A promise with basic subjects data
 */
export async function fetchSubjects(): Promise<{
  data: Subject[] | null;
  error: Error | null;
}> {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, name, description');

    if (error) {
      logger.error('Error fetching subjects:', error);
      return { data: null, error };
    }

    // Return subjects with zero counts for dashboard (fast loading)
    const formattedSubjects =
      subjects?.map((subject) => ({
        ...subject,
        topic_count: 0,
        quiz_count: 0,
      })) || [];

    return { data: formattedSubjects, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchSubjects:', err);
    return { data: null, error: err };
  }
}

/**
 * Creates a new subject
 * @param subjectData The subject data to create
 * @returns A promise with the created subject ID or error
 */
export async function createSubject(subjectData: {
  name: string;
  description: string;
  slug?: string;
  icon?: string;
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

    // Generate a slug if not provided
    if (!subjectData.slug) {
      subjectData.slug = subjectData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Insert the new subject
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: subjectData.name,
        description: subjectData.description,
        slug: subjectData.slug,
        icon: subjectData.icon || 'default-icon',
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error creating subject:', error);
      return { id: null, error };
    }

    return { id: data.id, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in createSubject:', err);
    return { id: null, error: err };
  }
}

/**
 * Updates an existing subject
 * @param id The ID of the subject to update
 * @param subjectData The updated subject data
 * @returns A promise with success status and error
 */
export async function updateSubject(
  id: string,
  subjectData: {
    name?: string;
    description?: string;
    slug?: string;
    icon?: string;
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

    // Update the subject
    const { error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', id);

    if (error) {
      logger.error('Error updating subject:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in updateSubject:', err);
    return { success: false, error: err };
  }
}

/**
 * Deletes a subject
 * @param id The ID of the subject to delete
 * @returns A promise with success status and error
 */
export async function deleteSubject(id: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    // Check admin access
    const { success, error: accessError } = await checkAdminAccess();

    if (!success) {
      return { success: false, error: accessError };
    }

    // Delete the subject
    const { error } = await supabase.from('subjects').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting subject:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in deleteSubject:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetches subjects for public API (no auth required)
 * @returns A promise with public subjects data
 */
export async function fetchPublicSubjects(): Promise<{
  data: PublicSubject[] | null;
  error: Error | null;
}> {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('id, name, slug, description, icon');

    if (error) {
      logger.error('Error fetching public subjects:', error);
      return { data: null, error };
    }

    return { data: subjects as PublicSubject[], error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchPublicSubjects:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetches a single subject by ID for public API (no auth required)
 * @param id The ID of the subject to fetch
 * @returns A promise with the subject data or error
 */
export async function fetchPublicSubjectById(id: string): Promise<{
  data: PublicSubject | null;
  error: Error | null;
}> {
  try {
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('id, name, slug, description, icon')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching public subject by ID:', error);
      return { data: null, error };
    }

    return { data: subject as PublicSubject, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchPublicSubjectById:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetches chapters for a subject by subject ID (no auth required)
 * @param subjectId The ID of the subject
 * @returns A promise with the chapters data or error
 */
export async function fetchChaptersBySubjectId(subjectId: string): Promise<{
  data: Chapter[] | null;
  error: Error | null;
}> {
  try {
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, name, form, order_index')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: true });

    if (error) {
      logger.error('Error fetching chapters by subject ID:', error);
      return { data: null, error };
    }

    return { data: chapters as Chapter[], error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchChaptersBySubjectId:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch subject data by slug via API route (no authentication required)
 */
export async function fetchSubjectBySlug(slug: string): Promise<PublicSubject> {
  try {
    const response = await fetch(`/api/subjects/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch subject data');
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching subject:', error);
    throw error;
  }
}

/**
 * Fetch chapters for a subject by subject slug via API route (no authentication required)
 */
export async function fetchChaptersBySubjectSlug(
  slug: string
): Promise<Chapter[]> {
  try {
    const response = await fetch(`/api/subjects/${slug}/chapters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch chapters');
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching chapters:', error);
    throw error;
  }
}
