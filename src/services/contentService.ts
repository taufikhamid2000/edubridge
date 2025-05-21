import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

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
 * Interface for Chapter structure
 */
interface Chapter {
  id: string;
  subject_id: string;
}

/**
 * Interface for Topic structure
 */
interface Topic {
  id: string;
  chapter_id: string;
}

/**
 * Interface for subject counts
 */
interface SubjectCounts {
  [key: string]: {
    topicCount: number;
    quizCount: number;
  };
}

/**
 * Interface for chapters by subject
 */
interface ChaptersBySubject {
  [subjectId: string]: string[];
}

/**
 * Fetches all subjects with their related topic and quiz counts
 * @returns A promise with subjects data and error status
 */
export async function fetchAdminSubjects(): Promise<{
  data: Subject[] | null;
  error: Error | null;
}> {
  try {
    // Get the current session first
    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse.data.session;
    const userId = session?.user?.id;

    // Log session state for debugging
    console.log('Session check:', {
      hasSession: !!session,
      hasUserId: !!userId,
      timestamp: new Date().toISOString(),
    });

    if (!userId) {
      logger.error('Admin access denied - no authenticated user');
      return {
        data: null,
        error: new Error('Authentication required - please login'),
      };
    }

    // Check if the user is an admin via a direct query
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    // Debug role check
    console.log('User role check:', {
      userId,
      hasRoleData: !!userRoles,
      role: userRoles?.role,
      hasError: !!roleError,
    });

    if (roleError) {
      logger.error('Error checking admin role:', roleError);
      return {
        data: null,
        error: new Error(`Role check failed: ${roleError.message}`),
      };
    }

    if (!userRoles || userRoles.role !== 'admin') {
      logger.error('Admin access denied - user is not an admin', {
        role: userRoles?.role,
      });
      return {
        data: null,
        error: new Error('Admin access required'),
      };
    }

    // User is confirmed as admin, proceed with fetch
    console.log('Fetching subjects as admin...');

    // Get all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');

    if (subjectsError) {
      logger.error('Error fetching subjects:', subjectsError);
      return {
        data: null,
        error: new Error(subjectsError.message || 'Failed to fetch subjects'),
      };
    }
    console.log('Subjects fetched successfully:', { count: subjects?.length });

    // Create a map to store topic and quiz counts per subject
    const subjectCounts: SubjectCounts = {};

    // Initialize counts for all subjects
    subjects.forEach((subject) => {
      subjectCounts[subject.id] = { topicCount: 0, quizCount: 0 };
    });

    try {
      // Get all chapters with their subject IDs
      const { data: chapters } = (await supabase
        .from('chapters')
        .select('id, subject_id')) as { data: Chapter[] | null };

      if (chapters && chapters.length > 0) {
        // Map chapters by subject
        const chaptersBySubject: ChaptersBySubject = {};
        chapters.forEach((chapter: Chapter) => {
          if (chapter.subject_id) {
            if (!chaptersBySubject[chapter.subject_id]) {
              chaptersBySubject[chapter.subject_id] = [];
            }
            chaptersBySubject[chapter.subject_id].push(chapter.id);
          }
        });

        // For each subject, process its chapters, topics and quizzes
        for (const subjectId in chaptersBySubject) {
          const chapterIds = chaptersBySubject[subjectId];

          // For each chapter in this subject
          for (const chapterId of chapterIds) {
            // Count topics in this chapter
            const { count: topicCount } = await supabase
              .from('topics')
              .select('*', { count: 'exact', head: true })
              .eq('chapter_id', chapterId);

            // Add to subject's topic count
            subjectCounts[subjectId].topicCount += topicCount || 0;
            // Get topics for this chapter
            const { data: topics } = (await supabase
              .from('topics')
              .select('id')
              .eq('chapter_id', chapterId)) as { data: Topic[] | null };

            // For each topic, count its quizzes
            if (topics && topics.length > 0) {
              for (const topic of topics) {
                const { count: quizCount } = await supabase
                  .from('quizzes')
                  .select('*', { count: 'exact', head: true })
                  .eq('topic_id', topic.id);

                // Add to subject's quiz count
                subjectCounts[subjectId].quizCount += quizCount || 0;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating topic/quiz counts:', error);
      // Continue with basic data
    }

    // Format the subjects with topic and quiz counts
    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      topic_count: subjectCounts[subject.id]?.topicCount || 0,
      quiz_count: subjectCounts[subject.id]?.quizCount || 0,
    }));

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
    // Check admin access first
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq(
        'user_id',
        (await supabase.auth.getSession()).data.session?.user?.id || ''
      )
      .single();

    if (roleError || !userRoles || userRoles.role !== 'admin') {
      return {
        id: null,
        error: new Error('Admin access required'),
      };
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
    // Check admin access first
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq(
        'user_id',
        (await supabase.auth.getSession()).data.session?.user?.id || ''
      )
      .single();

    if (roleError || !userRoles || userRoles.role !== 'admin') {
      return {
        success: false,
        error: new Error('Admin access required'),
      };
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
    // Check admin access first
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq(
        'user_id',
        (await supabase.auth.getSession()).data.session?.user?.id || ''
      )
      .single();

    if (roleError || !userRoles || userRoles.role !== 'admin') {
      return {
        success: false,
        error: new Error('Admin access required'),
      };
    }

    // Check if there are chapters associated with this subject
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id')
      .eq('subject_id', id)
      .limit(1);

    if (chaptersError) {
      logger.error('Error checking for related chapters:', chaptersError);
      return { success: false, error: chaptersError };
    }

    if (chapters && chapters.length > 0) {
      return {
        success: false,
        error: new Error('Cannot delete subject with associated chapters'),
      };
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
