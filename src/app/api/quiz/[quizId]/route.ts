import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

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
        questions:questions (
          *,
          answers:answers (
            *
          )
        ),
        topics:topics (
          id,
          name,
          chapters:chapters (
            id,
            name,
            form,
            subjects:subjects (
              id,
              name
            )
          )
        )
      `
      )
      .eq('id', quizId)
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

    // Extract topic context with null checks
    const topic = quizData.topics;
    const chapter = topic?.chapters
      ? Array.isArray(topic.chapters)
        ? topic.chapters[0]
        : topic.chapters
      : null;
    const subject = chapter?.subjects
      ? Array.isArray(chapter.subjects)
        ? chapter.subjects[0]
        : chapter.subjects
      : null;

    const topicContext = {
      topicTitle: topic?.name || 'Unknown Topic',
      chapterTitle: chapter?.name || 'Unknown Chapter',
      subjectName: subject?.name || 'Unknown Subject',
      form: chapter?.form || 'Unknown Form',
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
