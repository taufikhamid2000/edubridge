-- Migration for quiz_verification_log table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create quiz_verification_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_verification_log (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  quiz_id uuid NOT NULL,
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  reason text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quiz_verification_log_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_verification_log_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT quiz_verification_log_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_verification_log_action_check CHECK (
    (
      action = ANY (
        ARRAY[
          'verified'::text,
          'unverified'::text,
          'rejected'::text
        ]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_verification_log_quiz_id ON public.quiz_verification_log USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_verification_log_admin_user_id ON public.quiz_verification_log USING btree (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_verification_log_action ON public.quiz_verification_log USING btree (action);
CREATE INDEX IF NOT EXISTS idx_quiz_verification_log_created_at ON public.quiz_verification_log USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.quiz_verification_log IS 'Stores audit trail of quiz verification actions';

-- Enable Row Level Security
ALTER TABLE public.quiz_verification_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_verification_log' AND policyname = 'Admins can view all verification logs'
    ) THEN
        DROP POLICY "Admins can view all verification logs" ON public.quiz_verification_log;
    END IF;

    -- Drop select policy for quiz creators if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_verification_log' AND policyname = 'Quiz creators can view logs for their quizzes'
    ) THEN
        DROP POLICY "Quiz creators can view logs for their quizzes" ON public.quiz_verification_log;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_verification_log' AND policyname = 'Only admins can insert verification logs'
    ) THEN
        DROP POLICY "Only admins can insert verification logs" ON public.quiz_verification_log;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_verification_log' AND policyname = 'No one can update verification logs'
    ) THEN
        DROP POLICY "No one can update verification logs" ON public.quiz_verification_log;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_verification_log' AND policyname = 'No one can delete verification logs'
    ) THEN
        DROP POLICY "No one can delete verification logs" ON public.quiz_verification_log;
    END IF;
END
$$;

-- Create policies
-- Allow admins to view all verification logs
CREATE POLICY "Admins can view all verification logs" 
ON public.quiz_verification_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND school_role = 'admin'
  )
);

-- Allow quiz creators to view verification logs for their quizzes
CREATE POLICY "Quiz creators can view logs for their quizzes" 
ON public.quiz_verification_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = quiz_verification_log.quiz_id
    AND q.created_by = auth.uid()
  )
);

-- Only admins can insert verification logs (and they must be the admin performing the action)
CREATE POLICY "Only admins can insert verification logs" 
ON public.quiz_verification_log 
FOR INSERT 
WITH CHECK (
  (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR role LIKE '%admin%')
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE id = auth.uid()
      AND school_role = 'admin'
    )
  )
  AND auth.uid() = admin_user_id
);

-- No one can update verification logs (immutable audit trail)
CREATE POLICY "No one can update verification logs" 
ON public.quiz_verification_log 
FOR UPDATE 
USING (false);

-- No one can delete verification logs (immutable audit trail)
CREATE POLICY "No one can delete verification logs" 
ON public.quiz_verification_log 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT ON public.quiz_verification_log TO authenticated;
GRANT INSERT ON public.quiz_verification_log TO authenticated;
GRANT ALL ON public.quiz_verification_log TO service_role;

-- Create function to log quiz verification actions
CREATE OR REPLACE FUNCTION public.log_quiz_verification(
  p_quiz_id UUID,
  p_admin_user_id UUID,
  p_action TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is an admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_admin_user_id 
    AND (role = 'admin' OR role LIKE '%admin%')
  ) OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = p_admin_user_id
    AND school_role = 'admin'
  ) INTO v_is_admin;
  
  -- Only proceed if user is an admin
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can log verification actions';
  END IF;

  -- Insert verification log
  INSERT INTO public.quiz_verification_log (
    quiz_id,
    admin_user_id,
    action,
    reason
  ) VALUES (
    p_quiz_id,
    p_admin_user_id,
    p_action,
    p_reason
  )
  RETURNING id INTO v_log_id;
  
  -- Also update the quiz status if needed
  IF p_action = 'verified' THEN
    UPDATE public.quizzes
    SET verified = TRUE,
        verified_by = p_admin_user_id,
        verified_at = NOW()
    WHERE id = p_quiz_id;
  ELSIF p_action = 'unverified' OR p_action = 'rejected' THEN
    UPDATE public.quizzes
    SET verified = FALSE,
        verified_by = NULL,
        verified_at = NULL
    WHERE id = p_quiz_id;
  END IF;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
