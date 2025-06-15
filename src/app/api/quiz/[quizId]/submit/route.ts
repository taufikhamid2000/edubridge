import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface SubmitQuizRequest {
  userId: string;
  score: number;
  answers: { questionId: string; selectedAnswerIds: string[] }[];
  timeElapsed?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const body: SubmitQuizRequest = await request.json();
    const { userId, score, answers, timeElapsed } = body;

    // Validate required fields
    if (!quizId || !userId || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: quizId, userId, score' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }
    if (!uuidRegex.test(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quizId format' },
        { status: 400 }
      );
    }

    logger.log('Submitting quiz attempt:', { quizId, userId, score });

    // Check if the quiz exists and get verification status
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('verified, name, topic_id')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      logger.error('Quiz not found:', quizError);
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const isQuizVerified = quizData.verified || false;

    // Insert quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          quiz_id: quizId,
          user_id: userId,
          score: score,
          completed: true,
          quiz_title: quizData.name,
          time_taken: timeElapsed || null,
          created_at: new Date().toISOString(),
          is_verified_quiz: isQuizVerified, // Store verification status with the attempt
        },
      ])
      .select()
      .single();

    if (attemptError) {
      logger.error('Error inserting quiz attempt:', attemptError);
      return NextResponse.json(
        { error: 'Failed to save quiz attempt' },
        { status: 500 }
      );
    }

    // Only award XP and update stats for verified quizzes
    let earnedXp = 0;
    if (isQuizVerified) {
      try {
        // Import the leaderboardService to update user stats
        const { updateUserStats } = await import(
          '@/services/leaderboardService'
        );

        // Calculate XP based on score (10 XP per percentage point)
        earnedXp = Math.round(score * 10);

        // Update user stats for leaderboard
        await updateUserStats(userId, earnedXp, true);
        logger.log(`Awarded ${earnedXp} XP for verified quiz completion`);
      } catch (xpError) {
        logger.error('Error updating user stats:', xpError);
        // Don't fail the entire request if XP update fails
      }
    } else {
      logger.log('No XP awarded - quiz is not verified');
    }

    // Store detailed answers if provided (optional - for future analytics)
    if (answers && answers.length > 0) {
      const answerDetails = answers.map((answer) => ({
        attempt_id: attemptData.id,
        question_id: answer.questionId,
        selected_answer_ids: answer.selectedAnswerIds,
      }));

      // Try to insert answer details, but don't fail if table doesn't exist
      try {
        await supabase.from('quiz_attempt_answers').insert(answerDetails);
      } catch (answerError) {
        logger.log(
          'Answer details storage failed (table may not exist):',
          answerError
        );
      }
    }

    return NextResponse.json({
      success: true,
      attempt: attemptData,
      earnedXp,
      isVerified: isQuizVerified,
    });
  } catch (error) {
    logger.error('Unexpected error in quiz submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
