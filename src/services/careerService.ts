import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Interface for Career Pathway data structure
 */
export interface CareerPathway {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  order_index: number;
}

/**
 * Interface for Subject Requirement data structure
 */
export interface SubjectRequirement {
  id: string;
  career_id: string;
  subject_id: string;
  requirement_type: 'must' | 'should' | 'can';
  order_index: number;
}

/**
 * Interface for Career Subject Requirements
 */
export interface CareerRequirements {
  career: CareerPathway;
  mustLearnSubjectIds: string[];
  shouldLearnSubjectIds: string[];
  canLearnSubjectIds: string[];
}

/**
 * Fetches all career pathways
 * @returns A promise with career pathways data and error status
 */
export async function fetchCareerPathways(): Promise<{
  data: CareerPathway[] | null;
  error: Error | null;
}> {
  try {
    const { data: careers, error } = await supabase
      .from('career_pathways')
      .select('id, slug, title, description, icon, order_index')
      .eq('is_disabled', false)
      .order('order_index', { ascending: true });

    if (error) {
      logger.error('Error fetching career pathways:', error);
      return { data: null, error };
    }

    return { data: careers, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchCareerPathways:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetches a single career pathway by slug
 * @param slug The slug of the career pathway to fetch
 * @returns A promise with the career pathway data and error status
 */
export async function fetchCareerPathwayBySlug(slug: string): Promise<{
  data: CareerPathway | null;
  error: Error | null;
}> {
  try {
    const { data: career, error } = await supabase
      .from('career_pathways')
      .select('id, slug, title, description, icon, order_index')
      .eq('slug', slug)
      .eq('is_disabled', false)
      .single();

    if (error) {
      logger.error(`Error fetching career pathway with slug ${slug}:`, error);
      return { data: null, error };
    }

    return { data: career, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error(`Error in fetchCareerPathwayBySlug for ${slug}:`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetches subject requirements for a career
 * @param careerId The ID of the career to fetch requirements for
 * @returns A promise with the subject requirement data and error status
 */
export async function fetchCareerRequirements(careerId: string): Promise<{
  data: {
    mustLearn: string[];
    shouldLearn: string[];
    canLearn: string[];
  } | null;
  error: Error | null;
}> {
  try {
    const { data: requirements, error } = await supabase
      .from('career_subject_requirements')
      .select('subject_id, requirement_type, order_index')
      .eq('career_id', careerId)
      .order('order_index', { ascending: true });

    if (error) {
      logger.error(
        `Error fetching requirements for career ${careerId}:`,
        error
      );
      return { data: null, error };
    }

    // Group requirements by type
    const mustLearn = requirements
      .filter((r) => r.requirement_type === 'must')
      .map((r) => r.subject_id);

    const shouldLearn = requirements
      .filter((r) => r.requirement_type === 'should')
      .map((r) => r.subject_id);

    const canLearn = requirements
      .filter((r) => r.requirement_type === 'can')
      .map((r) => r.subject_id);

    return {
      data: { mustLearn, shouldLearn, canLearn },
      error: null,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error(`Error in fetchCareerRequirements for ${careerId}:`, err);
    return { data: null, error: err };
  }
}

/**
 * Fetches a career pathway with all its subject requirements
 * @param slug The slug of the career to fetch
 * @returns A promise with the career and its requirements
 */
export async function fetchCareerWithRequirements(slug: string): Promise<{
  data: CareerRequirements | null;
  error: Error | null;
}> {
  try {
    // First, get the career details
    const { data: career, error: careerError } =
      await fetchCareerPathwayBySlug(slug);

    if (careerError || !career) {
      return {
        data: null,
        error: careerError || new Error('Career not found'),
      };
    }

    // Then, get the requirements for this career
    const { data: requirements, error: reqError } =
      await fetchCareerRequirements(career.id);

    if (reqError || !requirements) {
      return {
        data: null,
        error: reqError || new Error('Failed to fetch requirements'),
      };
    }

    return {
      data: {
        career,
        mustLearnSubjectIds: requirements.mustLearn,
        shouldLearnSubjectIds: requirements.shouldLearn,
        canLearnSubjectIds: requirements.canLearn,
      },
      error: null,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error(`Error in fetchCareerWithRequirements for ${slug}:`, err);
    return { data: null, error: err };
  }
}
