import { supabase } from './supabase';
import { logger } from './logger';

export async function getSubjectBySlug(subjectSlug: string) {
  logger.log(`Fetching subject data for slug: ${subjectSlug}`);

  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .eq('slug', subjectSlug)
    .single();
  if (error) {
    logger.error('Error fetching subject:', error);
    throw new Error('Failed to fetch subject data');
  }

  return data;
}

export async function getChaptersBySubjectSlug(subjectSlug: string) {
  logger.log(`Fetching chapters for subject slug: ${subjectSlug}`);

  // Step 1: Get the subject ID first - this is necessary with Supabase
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single();
  if (subjectError) {
    logger.error('Error fetching subject ID:', subjectError);
    throw new Error('Failed to fetch subject ID');
  }

  const subjectId = subjectData?.id;
  if (!subjectId) {
    throw new Error('Subject not found');
  }

  // Step 2: Fetch chapters using the subject ID with a more optimized select
  const { data: chaptersData, error: chaptersError } = await supabase
    .from('chapters')
    .select('id, name, form, order_index')
    .eq('subject_id', subjectId)
    .order('form', { ascending: true })
    .order('order_index', { ascending: true });
  if (chaptersError) {
    logger.error('Error fetching chapters:', chaptersError);
    throw new Error('Failed to fetch chapters');
  }

  return chaptersData || [];
}
