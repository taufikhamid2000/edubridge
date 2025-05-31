-- Create audit system for quiz verification
-- This replaces edit functionality with admin review/audit system

-- Create audit comments table for quizzes
CREATE TABLE IF NOT EXISTS public.quiz_audit_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('suggestion', 'issue', 'approved', 'rejected')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit comments table for questions
CREATE TABLE IF NOT EXISTS public.question_audit_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('suggestion', 'issue', 'approved', 'rejected')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit comments table for answers
CREATE TABLE IF NOT EXISTS public.answer_audit_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('suggestion', 'issue', 'approved', 'rejected')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit log table for tracking verification status changes
CREATE TABLE IF NOT EXISTS public.quiz_verification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('verified', 'unverified', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment to tables
COMMENT ON TABLE public.quiz_audit_comments IS 'Admin comments and feedback on quizzes during verification process';
COMMENT ON TABLE public.question_audit_comments IS 'Admin comments and feedback on questions during verification process';
COMMENT ON TABLE public.answer_audit_comments IS 'Admin comments and feedback on answers during verification process';
COMMENT ON TABLE public.quiz_verification_log IS 'Log of verification status changes for audit trail';

-- Create indexes for better performance
CREATE INDEX idx_quiz_audit_comments_quiz_id ON public.quiz_audit_comments(quiz_id);
CREATE INDEX idx_quiz_audit_comments_admin_user_id ON public.quiz_audit_comments(admin_user_id);
CREATE INDEX idx_quiz_audit_comments_comment_type ON public.quiz_audit_comments(comment_type);
CREATE INDEX idx_quiz_audit_comments_created_at ON public.quiz_audit_comments(created_at);

CREATE INDEX idx_question_audit_comments_question_id ON public.question_audit_comments(question_id);
CREATE INDEX idx_question_audit_comments_admin_user_id ON public.question_audit_comments(admin_user_id);
CREATE INDEX idx_question_audit_comments_comment_type ON public.question_audit_comments(comment_type);

CREATE INDEX idx_answer_audit_comments_answer_id ON public.answer_audit_comments(answer_id);
CREATE INDEX idx_answer_audit_comments_admin_user_id ON public.answer_audit_comments(admin_user_id);

CREATE INDEX idx_quiz_verification_log_quiz_id ON public.quiz_verification_log(quiz_id);
CREATE INDEX idx_quiz_verification_log_admin_user_id ON public.quiz_verification_log(admin_user_id);
CREATE INDEX idx_quiz_verification_log_action ON public.quiz_verification_log(action);
CREATE INDEX idx_quiz_verification_log_created_at ON public.quiz_verification_log(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.quiz_audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_verification_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit comments
CREATE POLICY "Admins can view all quiz audit comments"
  ON public.quiz_audit_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert quiz audit comments"
  ON public.quiz_audit_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update quiz audit comments"
  ON public.quiz_audit_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for question audit comments
CREATE POLICY "Admins can view all question audit comments"
  ON public.question_audit_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert question audit comments"
  ON public.question_audit_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update question audit comments"
  ON public.question_audit_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Similar policies for answer audit comments
CREATE POLICY "Admins can view all answer audit comments"
  ON public.answer_audit_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert answer audit comments"
  ON public.answer_audit_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update answer audit comments"
  ON public.answer_audit_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for verification log
CREATE POLICY "Admins can view all verification logs"
  ON public.quiz_verification_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert verification logs"
  ON public.quiz_verification_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Quiz creators can view audit comments on their own quizzes (read-only)
CREATE POLICY "Quiz creators can view audit comments on their quizzes"
  ON public.quiz_audit_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes
      WHERE id = quiz_id AND created_by = auth.uid()::text
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_audit_comments_updated_at
  BEFORE UPDATE ON public.quiz_audit_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_question_audit_comments_updated_at
  BEFORE UPDATE ON public.question_audit_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_answer_audit_comments_updated_at
  BEFORE UPDATE ON public.answer_audit_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to verify a quiz
CREATE OR REPLACE FUNCTION public.verify_quiz(
  quiz_id_param UUID,
  admin_user_id_param UUID,
  reason_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = admin_user_id_param AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can verify quizzes';
  END IF;

  -- Update quiz to verified
  UPDATE public.quizzes
  SET verified = true, updated_at = now()
  WHERE id = quiz_id_param;

  -- Log the verification
  INSERT INTO public.quiz_verification_log (quiz_id, admin_user_id, action, reason)
  VALUES (quiz_id_param, admin_user_id_param, 'verified', reason_param);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unverify a quiz
CREATE OR REPLACE FUNCTION public.unverify_quiz(
  quiz_id_param UUID,
  admin_user_id_param UUID,
  reason_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = admin_user_id_param AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can unverify quizzes';
  END IF;

  -- Update quiz to unverified
  UPDATE public.quizzes
  SET verified = false, updated_at = now()
  WHERE id = quiz_id_param;

  -- Log the unverification
  INSERT INTO public.quiz_verification_log (quiz_id, admin_user_id, action, reason)
  VALUES (quiz_id_param, admin_user_id_param, 'unverified', reason_param);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.quiz_audit_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.question_audit_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.answer_audit_comments TO authenticated;
GRANT SELECT, INSERT ON public.quiz_verification_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_quiz TO authenticated;
GRANT EXECUTE ON FUNCTION public.unverify_quiz TO authenticated;
