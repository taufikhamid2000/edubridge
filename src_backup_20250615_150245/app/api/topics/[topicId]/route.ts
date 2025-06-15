import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    logger.log(`Fetching topic data for topic ID: ${topicId}`); // Single optimized query to get topic with chapter, subject, and quizzes
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select(
        `
        id,
        name,
        description,
        difficulty_level,
        time_estimate_minutes,
        order_index,
        chapter_id,
        chapters:chapters!inner (
          id,
          name,
          form,
          order_index,
          subjects:subjects!inner (
            id,
            name,
            slug,
            description,
            icon,
            category,
            category_priority,
            order_index
          )
        ),
        quizzes:quizzes (
          id,
          name,
          created_by,
          created_at,
          verified,
          topic_id
        )
      `
      )
      .eq('id', topicId)
      .single();

    if (topicError) {
      logger.error('Error fetching topic data:', topicError);
      return NextResponse.json(
        { error: 'Failed to fetch topic data' },
        { status: 500 }
      );
    }

    if (!topicData) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Extract and structure the response
    const chapter = Array.isArray(topicData.chapters)
      ? topicData.chapters[0]
      : topicData.chapters;

    const subject = chapter?.subjects
      ? Array.isArray(chapter.subjects)
        ? chapter.subjects[0]
        : chapter.subjects
      : null; // Process quizzes to add user profile data
    const processedQuizzes = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (topicData.quizzes || []).map(async (quiz: any) => {
        try {
          // Fetch user profile info using created_by as UUID
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', quiz.created_by)
            .single();

          return {
            id: quiz.id,
            name: quiz.name,
            created_by: quiz.created_by,
            created_at: quiz.created_at,
            verified: quiz.verified,
            topic_id: quiz.topic_id,
            display_name: profile?.display_name || null,
          };
        } catch {
          // If profile fetch fails, return quiz without display_name
          return {
            id: quiz.id,
            name: quiz.name,
            created_by: quiz.created_by,
            created_at: quiz.created_at,
            verified: quiz.verified,
            topic_id: quiz.topic_id,
            display_name: null,
          };
        }
      })
    );

    const response = {
      topic: {
        id: topicData.id,
        name: topicData.name,
        description: topicData.description,
        difficulty_level: topicData.difficulty_level,
        time_estimate_minutes: topicData.time_estimate_minutes,
        order_index: topicData.order_index,
        chapter_id: topicData.chapter_id,
        chapters: [], // Keep for compatibility
      },
      chapter: chapter
        ? {
            id: chapter.id,
            name: chapter.name,
            form: chapter.form,
            order_index: chapter.order_index,
          }
        : null,
      subject: subject
        ? {
            id: subject.id,
            name: subject.name,
            slug: subject.slug,
            description: subject.description,
            icon: subject.icon,
            category: subject.category,
            category_priority: subject.category_priority,
            order_index: subject.order_index,
          }
        : null,
      quizzes: processedQuizzes,
    };

    logger.log(
      `Successfully fetched topic data with ${processedQuizzes.length} quizzes`
    );

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Unexpected error in topic API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
