import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SchoolProfileContent from '@/components/schools/SchoolProfileContent';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: school } = await supabase
      .from('schools')
      .select('name')
      .eq('id', params.id)
      .single();

    return {
      title: school
        ? `${school.name} | EduBridge`
        : 'School Profile | EduBridge',
      description: school
        ? `View ${school.name}'s performance and statistics on EduBridge`
        : 'View school performance and statistics on EduBridge',
    };
  } catch (error) {
    logger.error('Error generating metadata:', error);
    return {
      title: 'School Profile | EduBridge',
      description: 'View school performance and statistics on EduBridge',
    };
  }
}

export default async function SchoolProfilePage({ params }: Props) {
  try {
    // Get school details
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', params.id)
      .single();

    if (schoolError || !school) {
      if (schoolError?.code === 'PGRST116') {
        notFound();
      }
      throw schoolError || new Error('School not found');
    }

    // Get school stats
    const { data: stats } = await supabase
      .from('school_stats')
      .select('*')
      .eq('school_id', params.id)
      .single();

    // Get teacher count
    const { count: teacherCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', params.id)
      .eq('school_role', 'teacher'); // Get student count
    const { count: studentCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', params.id)
      .eq('school_role', 'student');

    // Get top 5 students for hall of fame
    const { data: topStudents } = await supabase
      .from('user_profiles')
      .select(
        `
        id,
        full_name,
        total_points,
        total_correct_answers,
        total_quizzes_completed
      `
      )
      .eq('school_id', params.id)
      .eq('school_role', 'student')
      .order('total_points', { ascending: false })
      .limit(5);

    const schoolData = {
      ...school,
      stats,
      teacherCount: teacherCount || 0,
      studentCount: studentCount || 0,
      topStudents: topStudents || [],
    };

    return <SchoolProfileContent school={schoolData} />;
  } catch (error) {
    logger.error('Error in SchoolProfilePage:', error);
    throw error;
  }
}
