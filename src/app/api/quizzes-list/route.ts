import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple endpoint to list all quizzes with their question counts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get('topicId');

    let query = supabase.from('quizzes').select(`
        id, 
        name, 
        topics!inner (
          id,
          name
        ),
        questions:questions (id)
      `);

    // Filter by topic if provided
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error('Error fetching quizzes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } // Process the data to count questions
    type Quiz = {
      id: number;
      name: string;
      topics: { id: number; name: string } | { id: number; name: string }[] | null;
      questions?: { id: number }[] | null;
    };

    const formattedQuizzes = quizzes.map((quiz: Quiz) => {
      // Handle the topics field which might be an array or object in the returned data
      let topicName = 'Unknown Topic';
      if (quiz.topics) {
        if (Array.isArray(quiz.topics)) {
          topicName = quiz.topics[0]?.name || 'Unknown Topic';
        } else if (typeof quiz.topics === 'object') {
          topicName = quiz.topics.name || 'Unknown Topic';
        }
      }

      return {
        id: quiz.id,
        name: quiz.name,
        topic: topicName,
        questionCount: quiz.questions?.length || 0,
      };
    });

    console.log(
      `Found ${formattedQuizzes.length} quizzes${topicId ? ' for topic ' + topicId : ''}`
    );

    return NextResponse.json({
      count: formattedQuizzes.length,
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
