import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getMyAchievements, MyQuizaAchievement } from '@/lib/myquiza';

function mapAchievement(a: MyQuizaAchievement, userId: string) {
  return {
    id: a.id,
    user_id: userId,
    achievement_type: a.achievementType,
    title: a.title,
    description: a.description,
    icon: a.icon,
    earned_at: a.earnedAt,
    progress: a.progress ?? undefined,
    max_progress: a.maxProgress ?? undefined,
  };
}

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Handle guest user case
    if (userId === 'guest') {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // If userId is 'me', get current user's achievements
    if (userId === 'me') {
      const cookieStore = await cookies();
      const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: (name) => cookieStore.get(name)?.value,
            set: () => {},
            remove: () => {},
          },
        }
      );

      const {
        data: { session },
      } = await supabaseServer.auth.getSession();

      if (!session?.user?.id) {
        return NextResponse.json([], {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        });
      }

      const targetUserId = session.user.id;

      try {
        const achievements = await getMyAchievements(session.access_token);
        return NextResponse.json(
          achievements.map((a) => mapAchievement(a, targetUserId)),
          {
            headers: {
              'Cache-Control': `private, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
              Vary: 'Cookie, Authorization',
            },
          }
        );
      } catch (error) {
        logger.error('Error fetching own achievements from MyQuiza:', error);
        return NextResponse.json(
          { error: 'Unable to connect to the API. Please contact the administrator.' },
          { status: 500 }
        );
      }
    }

    // Fetch achievements for a specific OTHER user (public profile view).
    // Stays on Supabase: MyQuiza's GET /api/v1/users/{userId}/achievements
    // is moderator-only, which would 403 this public-facing route. Only the
    // 'me' case above is migrated.
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user achievements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    return NextResponse.json(achievements || [], {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    logger.error('Error in achievements API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
