import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user profile (no authentication required for public profiles)
    const { data: profileData, error: profileError } = await supabase
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
        weekly_xp,
        last_quiz_date,
        created_at,
        updated_at,
        school_id,
        is_school_visible,
        school:schools (
          id, name, type, district, state
        )
      `
      )
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('Error fetching user profile:', profileError);

      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profileData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return profile without email for privacy (public profile)
    const publicProfile = {
      ...profileData,
      email: '', // Don't expose email in public profiles
      isGuest: false,
    };

    return NextResponse.json(publicProfile, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    logger.error('Error in user profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
