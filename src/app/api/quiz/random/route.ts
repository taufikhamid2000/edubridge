import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
  try {
    // Get a random topic
    const { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .order('RANDOM()')
      .limit(1);

    if (topicError) {
      logger.error('Error fetching random topic:', topicError);
      throw topicError;
    }
    if (!topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'No topics are available in the system' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      topic: topics[0].id,
    });
  } catch (err) {
    logger.error('Error fetching random topic:', err);
    return NextResponse.json(
      { error: 'Failed to fetch random topic' },
      { status: 500 }
    );
  }
}
