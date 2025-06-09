import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data, error } = await supabase.rpc('get_random_topic');

    console.log('Random topic response:', { data, error });

    if (error) {
      console.error('Error executing get_random_topic:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !data[0]) {
      console.error('No topics found in database');
      return NextResponse.json(
        { error: 'No topics found in database' },
        { status: 404 }
      );
    }

    const topic = data[0];

    if (!topic.subject_slug) {
      console.error('Topic found but subject_slug is missing:', topic);
      return NextResponse.json(
        { error: 'Topic found but subject is missing' },
        { status: 500 }
      );
    }

    const response = {
      subject_slug: topic.subject_slug,
      topic_id: topic.id,
    };

    console.log('Returning response:', response);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Error fetching random topic:', err);
    return NextResponse.json(
      { error: 'Failed to fetch random topic' },
      { status: 500 }
    );
  }
}
