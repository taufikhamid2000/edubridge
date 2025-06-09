import { supabase } from '@/lib/supabase';
import { User, Achievement } from '@/types/users';
import { logger } from '@/lib/logger';

/**
 * Fetches the current user's profile data
 */
export async function fetchUserProfile(): Promise<{
  data: User | null;
  error: Error | null;
}> {
  try {
    // Get current user
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    if (!currentUserId) {
      return {
        data: null,
        error: new Error('No authenticated user found'),
      };
    } // Query user profile
    let profileData;
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        `
        id,
        display_name,
        avatar_url,
        xp,
        level,
        streak,
        daily_xp,
        weekly_xp,        last_quiz_date,
        created_at,
        updated_at,
        school_id
      `
      )
      .eq('id', currentUserId)
      .single();

    profileData = data;
    if (error) {
      // Check if this is a "not found" error - if so, create a new profile
      if (error.code === 'PGRST116') {
        logger.info('Creating new user profile for user:', currentUserId);

        try {
          // Create a new profile
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: currentUserId,
              display_name:
                sessionData?.session?.user?.email?.split('@')[0] || 'New User',
              avatar_url: null,
              xp: 0,
              level: 1,
              streak: 0,
              daily_xp: 0,
              weekly_xp: 0,
            })
            .select('*')
            .single();

          if (createError) {
            logger.error(
              'Error creating user profile:',
              JSON.stringify(createError)
            );
            return {
              data: null,
              error: new Error(
                `Failed to create profile: ${createError.message}`
              ),
            };
          }

          profileData = newProfile;
        } catch (createError) {
          logger.error('Exception creating user profile:', createError);
          return {
            data: null,
            error: new Error('Failed to create profile due to an exception'),
          };
        }
      } else {
        logger.error('Error fetching user profile:', JSON.stringify(error));
        return {
          data: null,
          error: new Error(`Failed to fetch profile: ${error.message}`),
        };
      }
    }

    if (!profileData) {
      logger.warn('No profile found for user:', currentUserId);
      return {
        data: null,
        error: new Error('User profile not found'),
      };
    } // Format data according to User type
    try {
      const userData: User = {
        id: profileData.id,
        email: sessionData.session?.user?.email || '',
        display_name: profileData.display_name || '',
        avatar_url: profileData.avatar_url || '',
        streak: profileData.streak || 0,
        xp: profileData.xp || 0,
        level: profileData.level || 1,
        lastQuizDate: profileData.last_quiz_date,
        created_at: profileData.created_at,
        school_id: profileData.school_id,
      };

      return { data: userData, error: null };
    } catch (formattingError) {
      logger.error('Error formatting user data:', {
        profileData: JSON.stringify(profileData),
        error: formattingError,
      });
      return {
        data: null,
        error: new Error(`Failed to format user data: ${formattingError}`),
      };
    }
  } catch (error) {
    logger.error(
      'Unexpected error in fetchUserProfile:',
      JSON.stringify(error)
    );
    return {
      data: null,
      error: error instanceof Error ? error : new Error(JSON.stringify(error)),
    };
  }
}

/**
 * Updates user profile data
 */
export async function updateUserProfile(profileData: {
  display_name?: string;
  avatar_url?: string;
  school_id?: string;
}): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get current user
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    if (!currentUserId) {
      return {
        success: false,
        error: new Error('No authenticated user found'),
      };
    }

    // Update profile data
    const { error } = await supabase
      .from('user_profiles')
      .update({
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url,
        school_id: profileData.school_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUserId);

    if (error) {
      logger.error('Error updating user profile:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    logger.error('Unexpected error in updateUserProfile:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Fetches the user's achievements
 */
export async function fetchUserAchievements(): Promise<{
  data: Achievement[] | null;
  error: Error | null;
}> {
  try {
    // Get current user
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;

    if (!currentUserId) {
      return {
        data: null,
        error: new Error('No authenticated user found'),
      };
    }

    // Query user achievements
    const { data: achievementsData, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', currentUserId)
      .order('earned_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user achievements:', error);
      return { data: null, error };
    }

    return { data: achievementsData, error: null };
  } catch (error) {
    logger.error('Unexpected error in fetchUserAchievements:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
