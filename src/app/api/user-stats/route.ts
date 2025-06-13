/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Cache duration in seconds
const CACHE_DURATION = 600; // 10 minutes

interface UserStatsResponse {
  weeklyProgress: {
    quizzesCompleted: number;
    quizzesTotal: number;
    averageScore: number;
  };
  achievements: Array<{
    title: string;
    description: string;
    bgColor: string;
    earned: boolean;
    earnedDate?: string;
  }>;
  streakInfo: {
    currentStreak: number;
    longestStreak: number;
    streakType: 'days' | 'weeks';
  };
  recentActivity: Array<{
    type: 'quiz_completed' | 'achievement_earned' | 'level_up';
    title: string;
    description: string;
    date: string;
    score?: number;
  }>;
}

export async function GET() {
  try {
    // Get authenticated user
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
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError) {
      logger.error('Session error in user stats API:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user statistics in parallel
    const [
      { data: userStatsData, error: userStatsError },
      { data: recentQuizzes, error: recentQuizzesError },
      { data: userProfile, error: userProfileError },
    ] = await Promise.all([
      // Try to get from materialized view first, fallback if not available
      supabase
        .from('mv_user_dashboard_stats')
        .select(
          'completed_quizzes, average_score, weekly_quizzes, weekly_average_score, active_days'
        )
        .eq('user_id', session.user.id)
        .maybeSingle(),

      // Get recent quiz attempts
      supabase
        .from('quiz_attempts')
        .select(
          `
          id,
          score,
          completed,
          created_at,
          quiz:quizzes (
            name,
            topic:topics (
              title,
              chapter:chapters (
                subject:subjects (name)
              )
            )
          )
        `
        )
        .eq('user_id', session.user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(10),

      // Get user profile for streak and level info
      supabase
        .from('user_profiles')
        .select('streak, level, xp, created_at')
        .eq('id', session.user.id)
        .single(),
    ]);

    if (userStatsError) {
      logger.warn('Could not fetch from materialized view, using fallback');
    }

    if (recentQuizzesError) {
      logger.error('Error fetching recent quizzes:', recentQuizzesError);
    }

    if (userProfileError && userProfileError.code !== 'PGRST116') {
      logger.error('Error fetching user profile:', userProfileError);
      return NextResponse.json(
        { error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    // Calculate weekly progress
    const weeklyQuizzes = userStatsData?.weekly_quizzes || 0;
    const weeklyAverage = userStatsData?.weekly_average_score || 0;
    const weeklyTarget = 10; // Target quizzes per week

    // Generate achievements based on user data
    const totalQuizzes = userStatsData?.completed_quizzes || 0;
    const averageScore = userStatsData?.average_score || 0;
    const currentStreak = userProfile?.streak || 0;
    const currentLevel = userProfile?.level || 1;

    const achievements = [
      {
        title: 'Quiz Master',
        description: 'Completed 10 quizzes in a week',
        bgColor: 'bg-blue-100',
        earned: weeklyQuizzes >= 10,
        earnedDate: weeklyQuizzes >= 10 ? new Date().toISOString() : undefined,
      },
      {
        title: 'High Scorer',
        description: 'Scored above 90% in 5 quizzes',
        bgColor: 'bg-green-100',
        earned: averageScore >= 90 && totalQuizzes >= 5,
        earnedDate:
          averageScore >= 90 && totalQuizzes >= 5
            ? new Date().toISOString()
            : undefined,
      },
      {
        title: 'Consistent Learner',
        description: 'Maintained a 7-day streak',
        bgColor: 'bg-yellow-100',
        earned: currentStreak >= 7,
        earnedDate: currentStreak >= 7 ? new Date().toISOString() : undefined,
      },
      {
        title: 'Knowledge Seeker',
        description: 'Completed 50 quizzes',
        bgColor: 'bg-purple-100',
        earned: totalQuizzes >= 50,
        earnedDate: totalQuizzes >= 50 ? new Date().toISOString() : undefined,
      },
      {
        title: 'Level Up Champion',
        description: 'Reached level 5',
        bgColor: 'bg-indigo-100',
        earned: currentLevel >= 5,
        earnedDate: currentLevel >= 5 ? new Date().toISOString() : undefined,
      },
    ]; // Generate recent activity from quiz attempts
    const recentActivity: Array<{
      type: 'quiz_completed' | 'achievement_earned' | 'level_up';
      title: string;
      description: string;
      date: string;
      score?: number;
    }> = []; // Add quiz completion activities    
    const quizActivities = (recentQuizzes || [])
      .slice(0, 5)
      .map((quiz: any) => ({
        type: 'quiz_completed' as const,
        title: `Completed ${quiz.quiz?.name || 'Quiz'}`,
        description: `${quiz.quiz?.topic?.chapter?.subject?.name || 'Subject'} - ${quiz.quiz?.topic?.title || 'Topic'}`,
        date: quiz.created_at,
        score: quiz.score,
      }));

    recentActivity.push(...quizActivities);

    // Add level up activities if applicable
    if (currentLevel > 1) {
      recentActivity.unshift({
        type: 'level_up' as const,
        title: `Level Up!`,
        description: `Reached level ${currentLevel}`,
        date: new Date().toISOString(), // This should come from actual level up date
      });
    }

    // Add achievement activities
    achievements
      .filter((achievement) => achievement.earned)
      .slice(0, 2)
      .forEach((achievement) => {
        recentActivity.unshift({
          type: 'achievement_earned' as const,
          title: `Achievement Earned: ${achievement.title}`,
          description: achievement.description,
          date: achievement.earnedDate || new Date().toISOString(),
        });
      });

    const response: UserStatsResponse = {
      weeklyProgress: {
        quizzesCompleted: weeklyQuizzes,
        quizzesTotal: weeklyTarget,
        averageScore: Math.round(weeklyAverage * 10) / 10,
      },
      achievements,
      streakInfo: {
        currentStreak,
        longestStreak: currentStreak, // This could be tracked separately
        streakType: 'days',
      },
      recentActivity: recentActivity.slice(0, 10),
    };

    // Return response with cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `private, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        Vary: 'Cookie, Authorization',
      },
    });
  } catch (error) {
    logger.error('Error in user stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
