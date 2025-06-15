import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  category_priority?: number;
  order_index?: number;
}

interface DashboardUser {
  email: string;
  display_name?: string;
  streak: number;
  xp: number;
  level: number;
  lastQuizDate: string;
}

interface DashboardResponse {
  user: DashboardUser;
  subjects: Subject[];
  categories: string[];
  stats: {
    totalSubjects: number;
    userRank?: number;
    completedQuizzes?: number;
  };
}

export async function GET() {
  try {
    console.log('Server: Dashboard API route called');
    logger.info('Dashboard API route called');

    // Get authenticated user (optional for dashboard)
    const cookieStore = await cookies();

    // Debug - Log all available cookies
    const allCookies = cookieStore.getAll();
    console.log(
      'All available cookies:',
      allCookies.map((c) => c.name)
    );

    // Check for specific auth cookies
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    console.log('Auth tokens present:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => {
            const cookie = cookieStore.get(name);
            console.log(
              `Server: Cookie ${name}:`,
              cookie ? 'exists' : 'missing'
            );
            return cookie?.value;
          },
          set: () => {},
          remove: () => {},
        },
      }
    );

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError) {
      logger.error('Session error in dashboard API:', sessionError);
      // Don't return error, continue without authentication
    } // Continue without requiring authentication
    const isAuthenticated = !!session?.user?.id;
    console.log('Dashboard API - Authentication status:', {
      isAuthenticated,
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    // Fetch data in parallel for optimal performance using materialized views
    const [
      { data: subjectsData, error: subjectsError },
      { data: userData, error: userError },
      { data: userStatsData, error: userStatsError },
    ] = await Promise.all([
      // Fetch subjects from materialized view for better performance
      supabase
        .from('mv_dashboard_subject_stats')
        .select(
          'id, name, slug, description, icon, category, category_priority, order_index, quiz_count, total_attempts, average_score'
        )
        .order('category_priority', { ascending: true })
        .order('order_index', { ascending: true }),

      // Fetch user profile only if authenticated
      isAuthenticated
        ? supabase
            .from('user_profiles')
            .select('display_name, streak, xp, level, last_quiz_date')
            .eq('id', session!.user.id)
            .single()
        : Promise.resolve({ data: null, error: null }),

      // Fetch user statistics only if authenticated
      isAuthenticated
        ? supabase
            .from('mv_user_dashboard_stats')
            .select(
              'completed_quizzes, average_score, weekly_quizzes, weekly_average_score, active_days'
            )
            .eq('user_id', session!.user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Handle fetch errors
    if (subjectsError) {
      logger.error('Error fetching subjects in dashboard API:', subjectsError);
      return NextResponse.json(
        { error: 'Failed to load subjects' },
        { status: 500 }
      );
    }

    // PGRST116 is "no rows returned" - expected for new users
    if (userError && userError.code !== 'PGRST116') {
      logger.error('Error fetching user profile in dashboard API:', userError);
      return NextResponse.json(
        { error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    if (userStatsError) {
      logger.error(
        'Error fetching user stats in dashboard API:',
        userStatsError
      );
      // Non-critical error, continue without stats
    }

    // Process subjects data server-side
    const processedSubjects = (subjectsData || []).map((subject) => ({
      ...subject,
      category: subject.category || 'Uncategorized',
      category_priority: subject.category_priority ?? 999,
      order_index: subject.order_index ?? 999,
    }));

    // Extract unique categories server-side
    const categories = [
      'all',
      ...new Set(processedSubjects.map((s) => s.category)),
    ]; // Construct user data
    const dashboardUser: DashboardUser = isAuthenticated
      ? {
          email: session!.user.email || '',
          display_name: userData?.display_name || undefined,
          streak: userData?.streak || 0,
          xp: userData?.xp || 0,
          level: userData?.level || 1,
          lastQuizDate:
            userData?.last_quiz_date || new Date().toISOString().split('T')[0],
        }
      : {
          email: '',
          display_name: 'Guest User',
          streak: 0,
          xp: 0,
          level: 1,
          lastQuizDate: new Date().toISOString().split('T')[0],
        };

    // Prepare response
    const response: DashboardResponse = {
      user: dashboardUser,
      subjects: processedSubjects,
      categories,
      stats: {
        totalSubjects: processedSubjects.length,
        completedQuizzes: userStatsData?.completed_quizzes || 0,
      },
    };

    // Return response with cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `private, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        Vary: 'Cookie, Authorization',
      },
    });
  } catch (error) {
    logger.error('Error in dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
