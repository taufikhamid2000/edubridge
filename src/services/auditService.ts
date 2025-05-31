// Audit service for quiz verification system
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import {
  QuizAuditComment,
  QuestionAuditComment,
  AnswerAuditComment,
  QuizVerificationLog,
  AuditCommentInput,
  VerificationAction,
  QuizWithAudit,
  AuditDashboardStats,
} from '@/types/audit';

/**
 * Get audit comments for a quiz
 */
export async function getQuizAuditComments(
  quizId: string
): Promise<QuizAuditComment[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_audit_comments')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching quiz audit comments:', error);
    return [];
  }
}

/**
 * Get audit comments for a question
 */
export async function getQuestionAuditComments(
  questionId: string
): Promise<QuestionAuditComment[]> {
  try {
    const { data, error } = await supabase
      .from('question_audit_comments')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching question audit comments:', error);
    return [];
  }
}

/**
 * Get audit comments for an answer
 */
export async function getAnswerAuditComments(
  answerId: string
): Promise<AnswerAuditComment[]> {
  try {
    const { data, error } = await supabase
      .from('answer_audit_comments')
      .select('*')
      .eq('answer_id', answerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching answer audit comments:', error);
    return [];
  }
}

/**
 * Add audit comment to a quiz
 */
export async function addQuizAuditComment(
  quizId: string,
  commentInput: AuditCommentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !session.session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase.from('quiz_audit_comments').insert({
      quiz_id: quizId,
      admin_user_id: session.session.user.id,
      comment_text: commentInput.comment_text,
      comment_type: commentInput.comment_type,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Error adding quiz audit comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add audit comment to a question
 */
export async function addQuestionAuditComment(
  questionId: string,
  commentInput: AuditCommentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !session.session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase.from('question_audit_comments').insert({
      question_id: questionId,
      admin_user_id: session.session.user.id,
      comment_text: commentInput.comment_text,
      comment_type: commentInput.comment_type,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Error adding question audit comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add audit comment to an answer
 */
export async function addAnswerAuditComment(
  answerId: string,
  commentInput: AuditCommentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !session.session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase.from('answer_audit_comments').insert({
      answer_id: answerId,
      admin_user_id: session.session.user.id,
      comment_text: commentInput.comment_text,
      comment_type: commentInput.comment_type,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Error adding answer audit comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Resolve an audit comment
 */
export async function resolveAuditComment(
  commentId: string,
  commentType: 'quiz' | 'question' | 'answer'
): Promise<{ success: boolean; error?: string }> {
  try {
    const table = `${commentType}_audit_comments`;
    const { error } = await supabase
      .from(table)
      .update({ is_resolved: true })
      .eq('id', commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error('Error resolving audit comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify or unverify a quiz
 */
export async function updateQuizVerification(
  quizId: string,
  action: VerificationAction
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !session.session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    if (action.action === 'verify') {
      const { error } = await supabase.rpc('verify_quiz', {
        quiz_id_param: quizId,
        admin_user_id_param: session.session.user.id,
        reason_param: action.reason || null,
      });

      if (error) throw error;
    } else if (action.action === 'unverify') {
      const { error } = await supabase.rpc('unverify_quiz', {
        quiz_id_param: quizId,
        admin_user_id_param: session.session.user.id,
        reason_param: action.reason || null,
      });

      if (error) throw error;
    } else if (action.action === 'reject') {
      // For rejection, we unverify and add a rejection comment
      const { error: unverifyError } = await supabase.rpc('unverify_quiz', {
        quiz_id_param: quizId,
        admin_user_id_param: session.session.user.id,
        reason_param: action.reason || 'Quiz rejected',
      });

      if (unverifyError) throw unverifyError;

      // Add rejection comment
      await addQuizAuditComment(quizId, {
        comment_text: action.reason || 'Quiz rejected by admin',
        comment_type: 'rejected',
      });
    }

    return { success: true };
  } catch (error) {
    logger.error('Error updating quiz verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get verification history for a quiz
 */
export async function getQuizVerificationHistory(
  quizId: string
): Promise<QuizVerificationLog[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_verification_log')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching quiz verification history:', error);
    return [];
  }
}

/**
 * Get quizzes that need review (unverified with activity)
 */
export async function getQuizzesNeedingReview(): Promise<QuizWithAudit[]> {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select(
        `
        *,
        topics(name, chapters(subjects(name)))
      `
      )
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // For each quiz, get comment counts
    const quizzesWithAudit: QuizWithAudit[] = await Promise.all(
      (data || []).map(async (quiz) => {
        const { count: commentCount } = await supabase
          .from('quiz_audit_comments')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quiz.id)
          .eq('is_resolved', false);

        return {
          ...quiz,
          unresolved_comments_count: commentCount || 0,
        };
      })
    );

    return quizzesWithAudit;
  } catch (error) {
    logger.error('Error fetching quizzes needing review:', error);
    return [];
  }
}

/**
 * Get audit dashboard statistics
 */
export async function getAuditDashboardStats(): Promise<AuditDashboardStats> {
  try {
    // Get unverified quizzes count
    const { count: unverifiedCount } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false);

    // Get pending comments count
    const { count: pendingCommentsCount } = await supabase
      .from('quiz_audit_comments')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false);

    // Get today's verification stats
    const today = new Date().toISOString().split('T')[0];

    const { count: verifiedTodayCount } = await supabase
      .from('quiz_verification_log')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'verified')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    const { count: rejectedTodayCount } = await supabase
      .from('quiz_verification_log')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'rejected')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // Get quizzes needing review
    const quizzesNeedingReview = await getQuizzesNeedingReview();

    return {
      total_unverified_quizzes: unverifiedCount || 0,
      total_pending_comments: pendingCommentsCount || 0,
      total_verified_today: verifiedTodayCount || 0,
      total_rejected_today: rejectedTodayCount || 0,
      quizzes_needing_review: quizzesNeedingReview.slice(0, 5), // Top 5 for dashboard
    };
  } catch (error) {
    logger.error('Error fetching audit dashboard stats:', error);
    return {
      total_unverified_quizzes: 0,
      total_pending_comments: 0,
      total_verified_today: 0,
      total_rejected_today: 0,
      quizzes_needing_review: [],
    };
  }
}
