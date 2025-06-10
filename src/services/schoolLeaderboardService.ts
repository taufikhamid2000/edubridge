import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { School, SchoolType } from '@/types/leaderboard';

interface SchoolDBResponse {
  id: string;
  name: string;
  type: SchoolType;
  district: string | null;
  state: string | null;
  total_students: number | null;
  school_stats: Array<{
    average_score: number;
    participation_rate: number;
    total_quizzes_taken: number;
    total_questions_answered: number;
    correct_answers: number;
    last_calculated_at: string;
  }>;
}

/**
 * Fetches school leaderboard data with rankings based on quiz performance
 */
export async function fetchSchoolLeaderboard(): Promise<{
  data: School[] | null;
  error: Error | null;
}> {
  try {
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
      .order('school_stats(average_score)', { ascending: false });

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
    const schools: School[] = (schoolData as SchoolDBResponse[])
      .filter((school) => {
        if (!school || !school.id || !school.name || !school.type) {
          logger.warn('Invalid school data:', school);
          return false;
        }
        if (!VALID_SCHOOL_TYPES.includes(school.type)) {
          logger.warn(`Invalid school type: ${school.type}`);
          return false;
        }
        if (!school.school_stats) {
          logger.warn(`No stats available for school: ${school.name}`);
          return false;
        }
        return true;
      })
      .map((school, index) => ({
        id: school.id,
        name: school.name,
        type: school.type,
        district: school.district || 'Unknown',
        state: school.state || 'Unknown',
        totalStudents: school.total_students || 0,
        averageScore:
          Math.round(school.school_stats[0].average_score * 10) / 10,
        participationRate:
          Math.round(school.school_stats[0].participation_rate * 10) / 10,
        totalQuizzesTaken: school.school_stats[0].total_quizzes_taken,
        totalQuestionsAnswered: school.school_stats[0].total_questions_answered,
        correctAnswers: school.school_stats[0].correct_answers,
        lastUpdated: school.school_stats[0].last_calculated_at,
        rank: index + 1,
      }));

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
    const [schoolsResult, studentsResult, statsResult, historyResult] =
      await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: true }),
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
          .limit(1)
          .single(),
      ]);

    if (schoolsResult.error || studentsResult.error || statsResult.error) {
      throw new Error('Failed to fetch one or more statistics');
    }

    const schoolCount = schoolsResult.count || 0;
    const studentCount = studentsResult.count || 0;

    // Only include schools with actual participation in the average
    const averageParticipation =
      statsResult.data
        .filter((stat) => stat.participation_rate > 0)
        .reduce((acc, stat) => acc + stat.participation_rate, 0) /
      (statsResult.data.filter((stat) => stat.participation_rate > 0).length ||
        1);

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
        schools: Math.round(growthRates.schools * 10) / 10,
        participation: Math.round(growthRates.participation * 10) / 10,
        students: Math.round(growthRates.students * 10) / 10,
      },
    };
  } catch (error) {
    logger.error('Error fetching school stats:', error);
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
