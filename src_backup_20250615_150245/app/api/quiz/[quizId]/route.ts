import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { quizId } = params;

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    logger.log(`Fetching quiz data for quiz ID: ${quizId}`);

    // Single optimized query to get quiz with questions, answers, and topic context
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        questions:questions!inner (
          *,
          answers:answers (
            *
          )
        ),
        topics:topics!inner (
          id,
          name,
          chapters:chapters!inner (
            id,
            name,
            form,
            subjects:subjects!inner (
              id,
              name
            )
          )
        )
      `
      )
      .eq('id', quizId)
      .order('questions.order_index', { ascending: true })
      .order('questions.answers.order_index', { ascending: true })
      .single();

    if (quizError) {
      logger.error('Error fetching quiz:', quizError);
      return NextResponse.json(
        { error: 'Failed to fetch quiz data' },
        { status: 500 }
      );
    }

    if (!quizData) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Extract topic context
    const topic = quizData.topics;
    const chapter = Array.isArray(topic.chapters)
      ? topic.chapters[0]
      : topic.chapters;
    const subject = Array.isArray(chapter.subjects)
      ? chapter.subjects[0]
      : chapter.subjects;

    const topicContext = {
      topicTitle: topic.name,
      chapterTitle: chapter.name,
      subjectName: subject.name,
      form: chapter.form,
    };

    // Structure the response
    const response = {
      quiz: {
        id: quizData.id,
        name: quizData.name,
        description: quizData.description,
        verified: quizData.verified,
        created_at: quizData.created_at,
        updated_at: quizData.updated_at,
        topic_id: quizData.topic_id,
      },
      questions: quizData.questions || [],
      topicContext,
    };

    logger.log(
      `Successfully fetched quiz with ${response.questions.length} questions`
    );

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Unexpected error in quiz API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
