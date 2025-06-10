import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { School, SchoolType } from '@/types/leaderboard';

/**
 * Fetches school leaderboard data with rankings based on quiz performance
 */
export async function fetchSchoolLeaderboard(): Promise<{
  data: School[] | null;
  error: Error | null;
}> {
  try {
    // Get schools with their stats in a single query
    const { data: schoolData, error } = await supabase
      .from('schools')
      .select(
        `
        id,
        name,
        type,
        district,
        state,
        total_students,
        school_stats!left (
          average_score,
          participation_rate
        ),
        users:student_profiles!left (count)
      `
      )
      .order('name'); // Temporary sort by name since stats might be null

    if (error) {
      logger.error('Database error fetching schools:', error);
      throw new Error('Failed to fetch schools data');
    }

    if (!schoolData) {
      throw new Error('No schools found in the database');
    }
    const VALID_SCHOOL_TYPES = [
      'SMK',
      'SMKA',
      'MRSM',
      'Sekolah Sains',
      'Sekolah Sukan',
      'Sekolah Seni',
      'SBP',
      'SMJK',
      'KV',
    ] as const;

    // Process and format the data
    const schools: School[] = schoolData
      .filter((school) => {
        // Validate required fields
        if (!school || !school.id || !school.name || !school.type) {
          logger.warn('Invalid school data:', school);
          return false;
        }
        // Validate school type
        if (!VALID_SCHOOL_TYPES.includes(school.type as SchoolType)) {
          logger.warn(`Invalid school type: ${school.type}`);
          return false;
        }
        return true;
      })
      .map((school) => {
        // Default values for optional fields
        const stats = school.school_stats?.[0] || {};
        return {
          id: school.id,
          name: school.name,
          type: school.type as SchoolType,
          district: school.district || 'Unknown',
          state: school.state || 'Unknown',
          totalStudents: school.total_students || 0,
          averageScore: Math.round((stats.average_score || 0) * 10) / 10, // Round to 1 decimal
          participationRate:
            Math.round((stats.participation_rate || 0) * 10) / 10,
          rank: 0, // Will be set after sorting
        };
      })
      // Sort by average score descending, and then by participation rate
      .sort((a, b) => {
        const scoreDiff = b.averageScore - a.averageScore;
        return scoreDiff !== 0
          ? scoreDiff
          : b.participationRate - a.participationRate;
      })
      // Assign ranks after sorting
      .map((school, index) => ({ ...school, rank: index + 1 }));

    return { data: schools, error: null };
  } catch (error) {
    logger.error('Error fetching school leaderboard:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get overall school statistics for the overview cards
 */
export async function fetchSchoolStats(): Promise<{
  totalSchools: number;
  averageParticipation: number;
  totalStudents: number;
  growthRates: {
    schools: number;
    participation: number;
    students: number;
  };
}> {
  try {
    // Get counts and stats in parallel
    const [schoolsResult, studentsResult, statsResult, historyResult] =
      await Promise.all([
        // Get total schools count
        supabase.from('schools').select('*', { count: 'exact', head: true }),

        // Get total students count
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('school_role', 'student'),

        // Get participation rates
        supabase.from('school_stats').select('participation_rate'),

        // Get last month's stats for growth calculation
        supabase
          .from('school_stats_history')
          .select('*')
          .gte(
            'recorded_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

    if (schoolsResult.error || studentsResult.error || statsResult.error) {
      throw new Error('Failed to fetch one or more statistics');
    }

    const schoolCount = schoolsResult.count || 0;
    const studentCount = studentsResult.count || 0;

    const averageParticipation =
      statsResult.data.reduce(
        (acc, stat) => acc + (stat.participation_rate || 0),
        0
      ) / (statsResult.data.length || 1);

    // Calculate growth rates comparing to last month's data
    const lastMonthStats = historyResult.data;
    const growthRates = {
      schools:
        lastMonthStats && lastMonthStats.schools_count > 0
          ? ((schoolCount - lastMonthStats.schools_count) /
              lastMonthStats.schools_count) *
            100
          : 0,
      participation:
        lastMonthStats && lastMonthStats.average_participation > 0
          ? ((averageParticipation - lastMonthStats.average_participation) /
              lastMonthStats.average_participation) *
            100
          : 0,
      students:
        lastMonthStats && lastMonthStats.students_count > 0
          ? ((studentCount - lastMonthStats.students_count) /
              lastMonthStats.students_count) *
            100
          : 0,
    };

    return {
      totalSchools: schoolCount,
      averageParticipation,
      totalStudents: studentCount,
      growthRates: {
        schools: Math.round(growthRates.schools * 10) / 10, // Round to 1 decimal
        participation: Math.round(growthRates.participation * 10) / 10,
        students: Math.round(growthRates.students * 10) / 10,
      },
    };
  } catch (error) {
    logger.error('Error fetching school stats:', error);
    // Return defaults if there's an error
    return {
      totalSchools: 0,
      averageParticipation: 0,
      totalStudents: 0,
      growthRates: {
        schools: 0,
        participation: 0,
        students: 0,
      },
    };
  }
}
