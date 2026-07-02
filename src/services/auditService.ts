// Audit service for quiz verification system.
//
// Comments (quiz/question/answer), the verification log, and the verify/
// unverify action itself all come from MyQuiza now (Sprint A item 3),
// proxied through /api/quiz/[quizId]/comments, /api/questions/[id]/comments,
// /api/answers/[id]/comments, /api/quiz/[quizId]/verification-log, and
// /api/quiz/[quizId]/verify. Responses are mapped into the existing
// snake_case shapes below so the consuming pages didn't need to change.
// MyQuiza's comment response has no author/admin_user info, so
// admin_user_id/admin_user are left blank/undefined on the mapped result.
//
// getQuizzesNeedingReview/getAuditDashboardStats are NOT migrated: the
// dashboard stats need an aggregate endpoint across all quizzes that
// MyQuiza hasn't exposed (their comment/log/verify endpoints are all
// scoped to one quiz at a time) — these still read Supabase directly.
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
import { MyQuizaAuditComment, MyQuizaVerificationLogEntry } from '@/lib/myquiza';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

function mapComment<
  T extends {
    id: string;
    comment_text: string;
    comment_type: 'suggestion' | 'issue' | 'approved' | 'rejected';
    is_resolved: boolean;
    created_at: string;
    updated_at: string;
    admin_user_id: string;
  },
>(c: MyQuizaAuditComment, parentField: Extract<keyof T, string>, parentId: string): T {
  return {
    id: c.id,
    [parentField]: parentId,
    admin_user_id: '',
    comment_text: c.commentText,
    comment_type: c.commentType,
    is_resolved: c.isResolved,
    created_at: c.createdAt,
    updated_at: c.createdAt,
  } as unknown as T;
}

/**
 * Get audit comments for a quiz
 */
export async function getQuizAuditComments(
  quizId: string
): Promise<QuizAuditComment[]> {
  try {
    const comments = await fetchJson<MyQuizaAuditComment[]>(
      `/api/quiz/${quizId}/comments`
    );
    return comments.map((c) => mapComment<QuizAuditComment>(c, 'quiz_id', quizId));
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
    const comments = await fetchJson<MyQuizaAuditComment[]>(
      `/api/questions/${questionId}/comments`
    );
    return comments.map((c) =>
      mapComment<QuestionAuditComment>(c, 'question_id', questionId)
    );
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
    const comments = await fetchJson<MyQuizaAuditComment[]>(
      `/api/answers/${answerId}/comments`
    );
    return comments.map((c) =>
      mapComment<AnswerAuditComment>(c, 'answer_id', answerId)
    );
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
    await fetchJson(`/api/quiz/${quizId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentText: commentInput.comment_text,
        commentType: commentInput.comment_type,
      }),
    });
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
    await fetchJson(`/api/questions/${questionId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentText: commentInput.comment_text,
        commentType: commentInput.comment_type,
      }),
    });
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
    await fetchJson(`/api/answers/${answerId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentText: commentInput.comment_text,
        commentType: commentInput.comment_type,
      }),
    });
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
 * Resolve an audit comment. Unlike the old Supabase version (update by
 * comment id alone), MyQuiza scopes comments under their parent entity, so
 * the parent id is now required too.
 */
export async function resolveAuditComment(
  entityId: string,
  commentId: string,
  commentType: 'quiz' | 'question' | 'answer'
): Promise<{ success: boolean; error?: string }> {
  try {
    const base =
      commentType === 'quiz'
        ? `/api/quiz/${entityId}`
        : commentType === 'question'
          ? `/api/questions/${entityId}`
          : `/api/answers/${entityId}`;

    await fetchJson(`${base}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isResolved: true }),
    });
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
 * Verify or unverify a quiz via MyQuiza's POST /api/v1/quizzes/{id}/verify.
 * That endpoint takes a single `verified` boolean (no separate action enum) —
 * 'reject' is our own client-side composition: unverify + a 'rejected'
 * comment, same as before the migration.
 */
export async function updateQuizVerification(
  quizId: string,
  action: VerificationAction
): Promise<{ success: boolean; error?: string }> {
  try {
    const verified = action.action === 'verify';
    const feedback =
      action.action === 'reject'
        ? action.reason || 'Quiz rejected'
        : action.reason || undefined;

    await fetchJson(`/api/quiz/${quizId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified, feedback }),
    });

    if (action.action === 'reject') {
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
    const log = await fetchJson<MyQuizaVerificationLogEntry[]>(
      `/api/quiz/${quizId}/verification-log`
    );
    return log.map((entry) => ({
      id: entry.id,
      quiz_id: quizId,
      admin_user_id: '',
      action: entry.action,
      reason: entry.reason ?? undefined,
      created_at: entry.createdAt,
    }));
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
