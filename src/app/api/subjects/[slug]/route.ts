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

    // Fetch subject data - no authentication required
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, slug, description, icon, category')
      .eq('slug', slug)
      .single();

    if (error) {
      logger.error('Error fetching subject:', error);
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Return response with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      },
    });
  } catch (error) {
    logger.error('Error in subject API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
