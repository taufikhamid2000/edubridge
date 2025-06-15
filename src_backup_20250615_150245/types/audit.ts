// Types for the audit system that replaces quiz edit functionality

export interface QuizAuditComment {
  id: string;
  quiz_id: string;
  admin_user_id: string;
  comment_text: string;
  comment_type: 'suggestion' | 'issue' | 'approved' | 'rejected';
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  // Optional joined data
  admin_user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface QuestionAuditComment {
  id: string;
  question_id: string;
  admin_user_id: string;
  comment_text: string;
  comment_type: 'suggestion' | 'issue' | 'approved' | 'rejected';
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  // Optional joined data
  admin_user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface AnswerAuditComment {
  id: string;
  answer_id: string;
  admin_user_id: string;
  comment_text: string;
  comment_type: 'suggestion' | 'issue' | 'approved' | 'rejected';
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  // Optional joined data
  admin_user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface QuizVerificationLog {
  id: string;
  quiz_id: string;
  admin_user_id: string;
  action: 'verified' | 'unverified' | 'rejected';
  reason?: string;
  created_at: string;
  // Optional joined data
  admin_user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface AuditCommentInput {
  comment_text: string;
  comment_type: 'suggestion' | 'issue' | 'approved' | 'rejected';
}

export interface VerificationAction {
  action: 'verify' | 'unverify' | 'reject';
  reason?: string;
}

// Extended quiz type with audit information
export interface QuizWithAudit {
  id: string;
  topic_id: string;
  name: string;
  created_by: string;
  created_at: string;
  verified: boolean;
  // Audit information
  audit_comments?: QuizAuditComment[];
  verification_logs?: QuizVerificationLog[];
  unresolved_comments_count?: number;
  last_audit_date?: string;
}

// Audit dashboard summary
export interface AuditDashboardStats {
  total_unverified_quizzes: number;
  total_pending_comments: number;
  total_verified_today: number;
  total_rejected_today: number;
  quizzes_needing_review: QuizWithAudit[];
}
