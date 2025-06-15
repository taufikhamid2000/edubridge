import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { checkAdminAccess } from './adminAuthService';

/**
 * Interface for dashboard statistics
 */
export interface DashboardStats {
  totalUsers: number;
  totalSubjects: number;
  totalChapters: number;
  totalTopics: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  averageScore: number;
  activeUsers: number; // Users who took quiz in last 7 days
}

/**
 * Fetches optimized dashboard statistics for admin (FAST VERSION)
 * Uses count queries instead of fetching all data
 * @returns A promise with dashboard stats
 */
export async function fetchDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: Error | null;
}> {
  try {
    // Verify admin access
    const { success, error } = await checkAdminAccess();

    if (!success) {
      return { data: null, error };
    }

    console.log('Fetching optimized dashboard stats...');

    // Execute all count queries in parallel for maximum speed
    const [
      userCountResult,
      subjectCountResult,
      chapterCountResult,
      topicCountResult,
      quizCountResult,
      attemptCountResult,
      averageScoreResult,
      activeUsersResult,
    ] = await Promise.all([
      // Count total users
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),

      // Count total subjects
      supabase.from('subjects').select('*', { count: 'exact', head: true }),

      // Count total chapters
      supabase.from('chapters').select('*', { count: 'exact', head: true }),

      // Count total topics
      supabase.from('topics').select('*', { count: 'exact', head: true }),

      // Count total quizzes
      supabase.from('quizzes').select('*', { count: 'exact', head: true }),

      // Count total quiz attempts
      supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true }),

      // Calculate average score from all completed attempts
      supabase
        .from('quiz_attempts')
        .select('score')
        .eq('completed', true)
        .not('score', 'is', null),

      // Count active users (took quiz in last 7 days)
      supabase
        .from('quiz_attempts')
        .select('user_id', { count: 'exact', head: true })
        .gte(
          'created_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

    // Check for errors
    if (userCountResult.error) throw userCountResult.error;
    if (subjectCountResult.error) throw subjectCountResult.error;
    if (chapterCountResult.error) throw chapterCountResult.error;
    if (topicCountResult.error) throw topicCountResult.error;
    if (quizCountResult.error) throw quizCountResult.error;
    if (attemptCountResult.error) throw attemptCountResult.error;
    if (averageScoreResult.error) throw averageScoreResult.error;
    if (activeUsersResult.error) throw activeUsersResult.error; // Calculate average score
    let averageScore = 0;
    if (averageScoreResult.data && averageScoreResult.data.length > 0) {
      const totalScore = averageScoreResult.data.reduce(
        (sum: number, attempt: { score: number | null }) =>
          sum + (attempt.score || 0),
        0
      );
      averageScore = totalScore / averageScoreResult.data.length;
    }

    const stats: DashboardStats = {
      totalUsers: userCountResult.count || 0,
      totalSubjects: subjectCountResult.count || 0,
      totalChapters: chapterCountResult.count || 0,
      totalTopics: topicCountResult.count || 0,
      totalQuizzes: quizCountResult.count || 0,
      totalQuizAttempts: attemptCountResult.count || 0,
      averageScore: Math.round(averageScore * 100) / 100,
      activeUsers: activeUsersResult.count || 0,
    };

    console.log('Dashboard stats fetched successfully:', stats);
    return { data: stats, error: null };
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(
            error && typeof error === 'object'
              ? JSON.stringify(error)
              : 'Unknown error in fetchDashboardStats'
          );

    logger.error('Error in fetchDashboardStats:', err);
    console.error('Full error details:', error);
    return { data: null, error: err };
  }
}

/**
 * Interface for recent activity data
 */
interface RecentActivity {
  id: string;
  score: number | null;
  completed: boolean;
  created_at: string;
  user_profiles: { display_name: string }[];
  quizzes: { title: string }[];
}

/**
 * Fetches recent activity for admin dashboard (FAST VERSION)
 * @param limit Number of recent activities to fetch
 * @returns A promise with recent activities
 */
export async function fetchRecentActivity(limit: number = 10): Promise<{
  data: RecentActivity[] | null;
  error: Error | null;
}> {
  try {
    // Verify admin access
    const { success, error } = await checkAdminAccess();

    if (!success) {
      return { data: null, error };
    }

    // Fetch recent quiz attempts with user info (already optimized)
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(
        `
        id,
        score,
        completed,
        created_at,
        user_profiles!inner(display_name),
        quizzes!inner(title)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (attemptsError) {
      logger.error('Error fetching recent activity:', attemptsError);
      return { data: null, error: attemptsError };
    }

    return { data: recentAttempts || [], error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Error in fetchRecentActivity:', err);
    return { data: null, error: err };
  }
}
