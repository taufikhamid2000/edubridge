import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Cache duration in seconds
const CACHE_DURATION = {
  daily: 60, // 1 minute for daily rankings
  weekly: 300, // 5 minutes for weekly rankings
  allTime: 900, // 15 minutes for all-time rankings
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame =
      (searchParams.get('timeFrame') as 'daily' | 'weekly' | 'allTime') ||
      'allTime';
    const userId = searchParams.get('userId');

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
        school:schools (
          id, name, type, district, state
        )
      `
      )
      .eq('school_role', 'student')
      .eq('is_disabled', false);

    // Apply time frame filter with optimized date handling
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeFrame === 'daily') {
      query = query
        .gte('last_quiz_date', today.toISOString())
        .order('daily_xp', { ascending: false });
    } else if (timeFrame === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      query = query
        .gte('last_quiz_date', weekStart.toISOString())
        .order('weekly_xp', { ascending: false });
    } else {
      query = query.order('xp', { ascending: false });
    }

    // Execute query with limit
    const { data: profiles, error } = await query.limit(100);

    if (error) {
      throw error;
    }

    // Calculate current user's rank if userId provided
    let currentUserRank = null;
    if (userId && profiles) {
      const userIndex = profiles.findIndex((profile) => profile.id === userId);
      currentUserRank = userIndex !== -1 ? userIndex + 1 : null;
    }

    // Return response with cache headers
    return NextResponse.json(
      { data: profiles, currentUserRank },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION[timeFrame]}, stale-while-revalidate=${CACHE_DURATION[timeFrame] * 2}`,
        },
      }
    );
  } catch (error) {
    logger.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
