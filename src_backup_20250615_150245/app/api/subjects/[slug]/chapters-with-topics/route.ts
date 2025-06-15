import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Cache duration in seconds
const CACHE_DURATION = 300; // 5 minutes

interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  time_estimate_minutes: number;
  order_index: number;
}

interface ChapterWithTopics {
  id: number;
  name: string;
  form: number;
  order_index: number;
  topics: Topic[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Subject slug is required' },
        { status: 400 }
      );
    }

    // Step 1: Get the subject ID first
    const { data: subjectData, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name')
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

    // Step 2: Fetch chapters with their topics in a single query
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select(
        `
        id,
        name,
        form,
        order_index,
        topics (
          id,
          name,
          description,
          difficulty_level,
          time_estimate_minutes,
          order_index
        )
      `
      )
      .eq('subject_id', subjectId)
      .order('form', { ascending: true })
      .order('order_index', { ascending: true });

    if (chaptersError) {
      logger.error('Error fetching chapters with topics:', chaptersError);
      return NextResponse.json(
        { error: 'Failed to fetch chapters' },
        { status: 500 }
      );
    }

    // Step 3: Transform the data to ensure topics are properly sorted
    const transformedChapters: ChapterWithTopics[] = (chaptersData || []).map(
      (chapter) => ({
        id: chapter.id,
        name: chapter.name,
        form: chapter.form,
        order_index: chapter.order_index,
        topics: (chapter.topics || []).sort(
          (a: Topic, b: Topic) => a.order_index - b.order_index
        ),
      })
    );

    return NextResponse.json(
      {
        subject: subjectData,
        chapters: transformedChapters,
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    );
  } catch (error) {
    logger.error('Error in chapters-with-topics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
