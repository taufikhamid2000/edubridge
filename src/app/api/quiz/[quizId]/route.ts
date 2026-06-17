import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { getQuizDetail } from '@/lib/myquiza';

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

    // Quiz + questions come from MyQuiza (answer key never leaves the server)
    let quizData;
    try {
      quizData = await getQuizDetail(quizId);
    } catch (err) {
      // MyQuiza returns 404 for unknown ids
      if (err instanceof Error && err.message.includes('404')) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }
      throw err;
    }

    // Breadcrumb context — MyQuiza only carries topicId, so source the
    // topic/chapter/subject names from Supabase (content tree stays on Supabase).
    let topicTitle = 'Unknown Topic';
    let chapterTitle = 'Unknown Chapter';
    let subjectName = 'Unknown Subject';
    let form: number | undefined = undefined;

    if (quizData.topicId) {
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select(
          `
          id,
          name,
          chapter:chapter_id (
            id,
            name,
            form,
            subject:subject_id (
              id,
              name
            )
          )
        `
        )
        .eq('id', quizData.topicId)
        .single();

      if (topicError) {
        logger.error('Error fetching topic breadcrumb:', topicError);
      } else if (topicData) {
        topicTitle = topicData.name || topicTitle;
        const chapter = Array.isArray(topicData.chapter)
          ? topicData.chapter[0]
          : topicData.chapter;
        if (chapter) {
          chapterTitle = chapter.name || chapterTitle;
          form = chapter.form;
          const subject = Array.isArray(chapter.subject)
            ? chapter.subject[0]
            : chapter.subject;
          if (subject) {
            subjectName = subject.name || subjectName;
          }
        }
      }
    }

    const topicContext = { topicTitle, chapterTitle, subjectName, form };

    // Map MyQuiza camelCase questions/options to the frontend shape.
    // No is_correct field — scoring is server-side on submit.
    const questions = quizData.questions.map((q) => ({
      id: q.id,
      quiz_id: quizData.id,
      text: q.text,
      type: q.type === 'checkbox' ? 'checkbox' : 'radio',
      order_index: q.orderIndex,
      created_at: '',
      updated_at: '',
      answers: q.options.map((o) => ({
        id: o.id,
        question_id: q.id,
        text: o.text,
        order_index: o.orderIndex,
        created_at: '',
        updated_at: '',
      })),
    }));

    const response = {
      quiz: {
        id: quizData.id,
        name: quizData.name,
        verified: quizData.verified,
        topic_id: quizData.topicId,
        timeLimit: quizData.timeLimit, // seconds; null -> client default
      },
      questions,
      topicContext,
    };

    logger.log(
      `Quiz API: prepared ${questions.length} questions for quiz ${quizId}`
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
