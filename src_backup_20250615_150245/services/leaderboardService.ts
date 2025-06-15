import { supabase } from '@/lib/supabase';
import { User } from '@/types/users';
import { logger } from '@/lib/logger';

/**
 * Fetches leaderboard data with optional filtering
 */
interface UserProfileResponse {
  id: string;
  display_name: string | null;
  xp: number;
  level: number;
  streak: number;
  avatar_url: string | null;
  last_quiz_date: string | null;
  is_school_visible: boolean;
  school_role: string | null;
  school_id: string | null;
  school: {
    id: string;
    name: string;
    type: string;
    district: string;
    state: string;
  } | null;
  daily_xp: number;
  weekly_xp: number;
}

export async function fetchLeaderboard(
  timeFrame: 'daily' | 'weekly' | 'allTime' = 'allTime',
  limit = 100
): Promise<{
  data: User[] | null;
  error: Error | null;
  currentUserRank: number | null;
}> {
  try {
    // Get current user for rank calculation
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    // Query user profiles with school data
    let query = supabase
      .from('user_profiles')
      .select(
        `
        id,
        display_name,
        xp,
        level,
        streak,
        avatar_url,
        last_quiz_date,
        daily_xp,
        weekly_xp,
        is_school_visible,
        school_role,
        school_id,
        school:schools(
          id,
          name,
          type,
          district,
          state
        )
      `
      ) // Only show active students
      .eq('school_role', 'student')
      .eq('is_disabled', false);

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

    // Limit the number of results
    query = query.limit(limit);

    // Execute the query
    const { data: profileData, error } = await query;
    // console.log('Raw profile data:', profileData);

    if (error) {
      throw error;
    }

    // Map profiles to User type with school info
    const data = ((profileData as unknown as UserProfileResponse[]) || []).map(
      (profile) => {
        // console.log('Profile from DB:', profile);
        const mappedUser = {
          id: profile.id,
          email: '', // Email is not needed for leaderboard
          display_name:
            profile.display_name || `User ${profile.id.substring(0, 6)}`,
          avatar_url: profile.avatar_url,
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
          lastQuizDate: profile.last_quiz_date,
          is_school_visible: profile.is_school_visible,
          school_role: profile.school_role,
          school_id: profile.school_id,
          school: profile.school || undefined, // School data is a single object
        } as User;
        // console.log('Mapped user:', mappedUser);
        return mappedUser;
      }
    );

    // Calculate current user's rank if user is logged in
    let currentUserRank = null;
    if (currentUserId && data) {
      const userIndex = data.findIndex((user) => user.id === currentUserId);
      currentUserRank = userIndex !== -1 ? userIndex + 1 : null;
    }

    return { data, error: null, currentUserRank };
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
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
