import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get school details
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', params.id)
      .single();

    if (schoolError) {
      logger.error('Error fetching school:', schoolError);
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Get school stats
    const { data: stats, error: statsError } = await supabase
      .from('school_stats')
      .select('*')
      .eq('school_id', params.id)
      .single();

    if (statsError) {
      logger.error('Error fetching school stats:', statsError);
    }

    // Get teacher count
    const { count: teacherCount, error: teacherError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', params.id)
      .eq('school_role', 'teacher');

    if (teacherError) {
      logger.error('Error fetching teacher count:', teacherError);
    }

    // Get student count
    const { count: studentCount, error: studentError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', params.id)
      .eq('school_role', 'student');

    if (studentError) {
      logger.error('Error fetching student count:', studentError);
    }

    // Return combined data
    return NextResponse.json({
      ...school,
      stats,
      teacherCount: teacherCount || 0,
      studentCount: studentCount || 0,
    });
  } catch (error) {
    logger.error('Error in school profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
