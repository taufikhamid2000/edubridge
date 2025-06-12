import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Fetch schools data and stats in parallel for better performance
    const [schoolsResult, studentsResult, statsResult, historyResult] =
      await Promise.all([
        supabase
          .from('schools')
          .select(
            `
          id,
          name,
          type,
          district,
          state,
          total_students,
          school_stats (
            average_score,
            participation_rate,
            total_quizzes_taken,
            total_questions_answered,
            correct_answers,
            last_calculated_at
          )
        `
          )
          .order('school_stats(average_score)', { ascending: false }),

        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_role', 'student'),

        supabase.from('school_stats').select('participation_rate'),

        supabase
          .from('school_stats_history')
          .select('*')
          .gte(
            'recorded_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('recorded_at', { ascending: false })
          .limit(1),
      ]);

    if (schoolsResult.error || studentsResult.error || statsResult.error) {
      throw new Error('Failed to fetch one or more statistics');
    }

    // Process school data
    const schools = (schoolsResult.data || [])
      .filter((school) => {
        return school && school.id && school.name && school.type;
      })
      .map((school, index) => ({
        id: school.id,
        name: school.name,
        type: school.type,
        district: school.district || 'Unknown',
        state: school.state || 'Unknown',
        totalStudents: school.total_students || 0,
        averageScore: school.school_stats?.[0]?.average_score
          ? Math.round(school.school_stats[0].average_score * 10) / 10
          : 0,
        participationRate: school.school_stats?.[0]?.participation_rate
          ? Math.round(school.school_stats[0].participation_rate * 10) / 10
          : 0,
        rank: index + 1,
      }));

    // Calculate stats
    const schoolCount = schoolsResult.data?.length || 0;
    const studentCount = studentsResult.count || 0;

    // Calculate average participation, excluding schools with 0 participation
    const averageParticipation =
      statsResult.data
        .filter((stat) => stat.participation_rate > 0)
        .reduce((acc, stat) => acc + stat.participation_rate, 0) /
      (statsResult.data.filter((stat) => stat.participation_rate > 0).length ||
        1);

    // Calculate growth rates
    const lastMonthStats = historyResult.data?.[0];
    const growthRates = {
      schools:
        lastMonthStats?.schools_count > 0
          ? Math.round(
              ((schoolCount - lastMonthStats.schools_count) /
                lastMonthStats.schools_count) *
                1000
            ) / 10
          : 0,
      participation:
        lastMonthStats?.average_participation > 0
          ? Math.round(
              ((averageParticipation - lastMonthStats.average_participation) /
                lastMonthStats.average_participation) *
                1000
            ) / 10
          : 0,
      students:
        lastMonthStats?.students_count > 0
          ? Math.round(
              ((studentCount - lastMonthStats.students_count) /
                lastMonthStats.students_count) *
                1000
            ) / 10
          : 0,
    };

    return NextResponse.json(
      {
        data: schools,
        stats: {
          totalSchools: schoolCount,
          averageParticipation: Math.round(averageParticipation * 10) / 10,
          totalStudents: studentCount,
          growthRates,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15 minutes cache, 30 minutes stale-while-revalidate
        },
      }
    );
  } catch (error) {
    logger.error('Error in school leaderboard API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school leaderboard data' },
      { status: 500 }
    );
  }
}
