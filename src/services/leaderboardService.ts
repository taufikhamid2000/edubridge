import { supabase } from '@/lib/supabase';
import { User } from '@/types/users';
import { logger } from '@/lib/logger';

/**
 * Fetches leaderboard data with optional filtering
 */
export async function fetchLeaderboard(
  timeFrame: 'daily' | 'weekly' | 'allTime' = 'weekly',
  subjectId: string | null = null,
  limit = 100
): Promise<{
  data: User[] | null;
  error: Error | null;
  currentUserRank: number | null;
}> {
  try {
    // Get current user for rank calculation
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id; // Query user profiles
    let query = supabase.from('user_profiles').select(`
        id,
        display_name,
        xp,
        level,
        streak,
        avatar_url,
        last_quiz_date
      `);

    // Apply time frame filter
    if (timeFrame === 'daily') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      query = query
        .gte('last_quiz_date', todayStart.toISOString())
        .order('daily_xp', { ascending: false });
    } else if (timeFrame === 'weekly') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      query = query
        .gte('last_quiz_date', weekStart.toISOString())
        .order('weekly_xp', { ascending: false });
    } else {
      // All time - default sorting by total XP
      query = query.order('xp', { ascending: false });
    }

    // Apply subject filter if provided
    if (subjectId) {
      // We need to join with the quiz_attempts table to filter by subject
      // This requires a more complex query that might be better handled by a database view or function
      // For now, we'll just log that this feature is coming soon
      logger.log(
        'Subject filtering not yet implemented in leaderboard service'
      );
    }

    // Limit the number of results
    query = query.limit(limit); // Execute the query
    const { data: profileData, error } = await query;

    if (error) {
      throw error;
    } // For each profile, get basic information
    const data = (profileData || []).map((profile) => {
      // For display purposes, create a placeholder email if display_name is not available
      // In a real app, you would handle this differently
      return {
        id: profile.id,
        email: profile.display_name
          ? `${profile.display_name}@example.com`
          : `user-${profile.id.substring(0, 8)}@example.com`,
        display_name:
          profile.display_name || `User ${profile.id.substring(0, 6)}`,
        avatar_url: profile.avatar_url,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        lastQuizDate: profile.last_quiz_date,
      } as User;
    });

    // Calculate current user's rank if user is logged in
    let currentUserRank = null;
    if (currentUserId && data) {
      const userIndex = data.findIndex((user) => user.id === currentUserId);
      currentUserRank = userIndex !== -1 ? userIndex + 1 : null;

      // If user is not in top results, we need to find their actual rank
      if (userIndex === -1) {
        // This would require counting all users with higher XP
        // For better performance, this should be done with a dedicated database function
        logger.log(
          'User rank calculation for users outside top results not yet implemented'
        );
      }
    }

    return { data, error: null, currentUserRank };
  } catch (error) {
    logger.error('Error in fetchLeaderboard:', error);
    return { data: null, error: error as Error, currentUserRank: null };
  }
}

/**
 * Updates user XP and related statistics
 */
export async function updateUserStats(
  userId: string,
  xpToAdd: number,
  quizCompleted = true
): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    if (!userId || xpToAdd <= 0) {
      return {
        success: false,
        error: new Error('Invalid user ID or XP amount'),
      };
    } // Get current user stats
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('xp, level, streak, last_quiz_date, daily_xp, weekly_xp')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!userData) {
      // User profile doesn't exist yet - create one
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            xp: xpToAdd,
            level: 1,
            streak: 1,
            daily_xp: xpToAdd,
            weekly_xp: xpToAdd,
            last_quiz_date: new Date().toISOString(),
          },
        ]);

      if (createError) {
        throw createError;
      }

      return { success: true, error: null };
    }

    // Calculate new level based on XP
    // This is a simple implementation - you might want a more sophisticated leveling algorithm
    const newXp = userData.xp + xpToAdd;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    // Calculate streak
    let streak = userData.streak || 0;
    const lastQuizDate = userData.last_quiz_date
      ? new Date(userData.last_quiz_date)
      : null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Only update streak for completed quizzes
    if (quizCompleted) {
      if (!lastQuizDate) {
        // First quiz ever
        streak = 1;
      } else {
        const lastQuizDay = new Date(
          lastQuizDate.getFullYear(),
          lastQuizDate.getMonth(),
          lastQuizDate.getDate()
        );
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastQuizDay.getTime() === yesterday.getTime()) {
          // Continued streak
          streak += 1;
        } else if (lastQuizDay.getTime() < yesterday.getTime()) {
          // Broken streak
          streak = 1;
        }
        // If already done a quiz today, streak stays the same
      }
    }

    // Update daily and weekly XP
    let dailyXp = userData.daily_xp || 0;
    let weeklyXp = userData.weekly_xp || 0;

    // Reset daily XP if last quiz was on a different day
    if (!lastQuizDate || lastQuizDate.getTime() < today.getTime()) {
      dailyXp = 0;
    }

    // Reset weekly XP if last quiz was in a different week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday as first day
    if (!lastQuizDate || lastQuizDate < weekStart) {
      weeklyXp = 0;
    }

    // Add new XP
    dailyXp += xpToAdd;
    weeklyXp += xpToAdd; // Update user stats
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        xp: newXp,
        level: newLevel,
        streak: streak,
        last_quiz_date: new Date().toISOString(),
        daily_xp: dailyXp,
        weekly_xp: weeklyXp,
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, error: null };
  } catch (error) {
    logger.error('Error in updateUserStats:', error);
    return { success: false, error: error as Error };
  }
}
