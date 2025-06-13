import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Subject slug is required' },
        { status: 400 }
      );
    }

    // Step 1: Get the subject ID first
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', slug)
      .single();

    if (subjectError) {
      logger.error('Error fetching subject ID:', subjectError);
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const subjectId = subjectData?.id;
    if (!subjectId) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Step 2: Fetch chapters using the subject ID
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, name, form, order_index')
      .eq('subject_id', subjectId)
      .order('form', { ascending: true })
      .order('order_index', { ascending: true });

    if (chaptersError) {
      logger.error('Error fetching chapters:', chaptersError);
      return NextResponse.json(
        { error: 'Failed to fetch chapters' },
        { status: 500 }
      );
    }

    // Return response with cache headers
    return NextResponse.json(chaptersData || [], {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    logger.error('Error in chapters API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
