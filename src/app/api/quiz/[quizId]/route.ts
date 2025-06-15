import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Define interfaces for the database schema
interface DbQuestion {
  id: string;
  quiz_id: string;
  text: string; // Actual field name is 'text', not 'question_text'
  type?: 'radio' | 'checkbox';
  order_index?: number;
  created_at: string;
  updated_at?: string;
  answers?: DbAnswer[];
}

interface DbAnswer {
  id: string;
  question_id: string;
  text: string; // Actual field name is 'text', not 'answer_text'
  is_correct: boolean;
  order_index?: number;
  created_at: string;
  updated_at?: string;
}

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

    // Using simplified query structure that worked successfully in quizzes-list
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        questions (
          *,
          answers (
            *
          )
        )
      `
      )
      .eq('id', quizId)
      .single();

    // Debug log to see raw quiz data structure
    logger.log('Raw quiz data structure before topic lookup:', {
      hasData: !!quizData,
      hasQuestions: quizData && Array.isArray(quizData.questions),
      questionCount: quizData?.questions?.length || 0,
    });

    // If we found the quiz, get the topic info separately
    let topicData = null;
    if (quizData && quizData.topic_id) {
      const { data: topicResult, error: topicError } = await supabase
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
        .eq('id', quizData.topic_id)
        .single();

      if (topicError) {
        logger.error('Error fetching topic:', topicError);
      } else {
        topicData = topicResult;
      }
    }

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

    // Debug log the raw data structure from database
    logger.log('Raw quiz data structure:', {
      hasQuestions: !!quizData.questions,
      questionCount: quizData.questions?.length || 0,
      firstQuestionSample:
        quizData.questions?.length > 0
          ? {
              id: quizData.questions[0].id,
              text: quizData.questions[0].text,
              fields: Object.keys(quizData.questions[0]),
              hasAnswers: Array.isArray(quizData.questions[0].answers),
              answerCount: quizData.questions[0].answers?.length || 0,
            }
          : null,
      topicData: topicData,
    });

    // Extract topic context from the separate topic query
    let topicTitle = 'Unknown Topic';
    let chapterTitle = 'Unknown Chapter';
    let subjectName = 'Unknown Subject';
    let form = undefined;

    if (topicData) {
      topicTitle = topicData.name || 'Unknown Topic';

      const chapter = topicData.chapter;
      if (chapter && typeof chapter === 'object') {
        // Handle both single object and array cases
        const chapterObj = Array.isArray(chapter) ? chapter[0] : chapter;
        if (chapterObj) {
          chapterTitle = chapterObj.name || 'Unknown Chapter';
          form = chapterObj.form;

          const subject = chapterObj.subject;
          if (subject) {
            // Handle both single object and array cases
            const subjectObj = Array.isArray(subject) ? subject[0] : subject;
            if (subjectObj) {
              subjectName = subjectObj.name || 'Unknown Subject';
            }
          }
        }
      }
    }

    const topicContext = {
      topicTitle,
      chapterTitle,
      subjectName,
      form,
    };

    // Map database fields to frontend expected format
    const mappedQuestions =
      quizData.questions?.map((question: DbQuestion) => ({
        id: question.id,
        quiz_id: question.quiz_id,
        text: question.text || '', // Field is already named 'text'
        type: question.type || 'radio',
        order_index: question.order_index || 0,
        created_at: question.created_at,
        updated_at: question.updated_at,
        answers:
          question.answers?.map((answer: DbAnswer) => ({
            id: answer.id,
            question_id: answer.question_id,
            text: answer.text || '', // Field is already named 'text'
            is_correct: answer.is_correct || false,
            order_index: answer.order_index || 0,
            created_at: answer.created_at,
            updated_at: answer.updated_at,
          })) || [],
      })) || [];

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
      questions: mappedQuestions,
      topicContext,
    };

    // Add detailed logging to help diagnose issues
    logger.log(`Quiz API: Successfully prepared response for quiz ${quizId}`, {
      originalQuestionCount: quizData.questions?.length || 0,
      mappedQuestionCount: mappedQuestions.length,
      // Log the first question's structure to verify it matches expected format
      sampleQuestion:
        mappedQuestions.length > 0
          ? {
              id: mappedQuestions[0].id.slice(-8), // Only show part of ID for brevity
              textLength: mappedQuestions[0].text?.length || 0,
              textSample: mappedQuestions[0].text?.slice(0, 30) + '...', // First 30 chars for debugging
              answerCount: mappedQuestions[0].answers?.length || 0,
              firstAnswer:
                mappedQuestions[0].answers?.length > 0
                  ? {
                      id: mappedQuestions[0].answers[0].id.slice(-8),
                      textLength:
                        mappedQuestions[0].answers[0].text?.length || 0,
                      textSample:
                        mappedQuestions[0].answers[0].text?.slice(0, 30) +
                        '...',
                      isCorrect: mappedQuestions[0].answers[0].is_correct,
                    }
                  : null,
            }
          : null,
    });

    // Direct console log for debugging
    console.log(`Quiz ${quizId} response:`, {
      questionCount: mappedQuestions.length,
      questionsSample: mappedQuestions.slice(0, 2).map((q: DbQuestion) => ({
        id: q.id.slice(-8),
        textSample: q.text?.slice(0, 30),
        answerCount: q.answers?.length || 0,
      })),
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Unexpected error in quiz API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
