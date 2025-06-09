import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    // Get a random topic
    const { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('id')
      .order('RANDOM()')
      .limit(1);

    if (topicError) {
      console.error('Error fetching random topic:', topicError);
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
    console.error('Error fetching random topic:', err);
    return NextResponse.json(
      { error: 'Failed to fetch random topic' },
      { status: 500 }
    );
  }
}
