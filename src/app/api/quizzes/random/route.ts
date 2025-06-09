import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { data, error } = await supabase.rpc('get_random_quiz');

    if (error) {
      console.error('Error executing get_random_quiz:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || !data[0]) {
      return NextResponse.json(
        { error: 'No quizzes found in database' },
        { status: 404 }
      );
    }

    const quiz = data[0];
    return NextResponse.json({
      subject_slug: quiz.subject_slug,
      topic_id: quiz.topic_id,
      quiz_id: quiz.quiz_id,
    });
  } catch (err) {
    console.error('Error fetching random quiz:', err);
    return NextResponse.json(
      { error: 'Failed to fetch random quiz' },
      { status: 500 }
    );
  }
}
