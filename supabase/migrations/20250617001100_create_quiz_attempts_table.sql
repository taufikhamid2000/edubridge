-- Migration for quiz_attempts table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  quiz_id uuid NOT NULL,
  user_id uuid NOT NULL,
  score integer NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  quiz_title text NULL,
  subject text NULL,
  topic text NULL,
  time_taken integer NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  max_score integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_verified_quiz boolean NULL DEFAULT false,
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx ON public.quiz_attempts USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed ON public.quiz_attempts USING btree (user_id, completed, created_at)
WHERE (completed = true);

-- Add table comment
COMMENT ON TABLE public.quiz_attempts IS 'Stores user quiz attempt records and scores';

-- Ensure the handle_updated_at function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatically updating updated_at timestamp
DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON public.quiz_attempts;
CREATE TRIGGER update_quiz_attempts_updated_at 
BEFORE UPDATE ON public.quiz_attempts 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create or replace the trigger_update_school_stats function
CREATE OR REPLACE FUNCTION public.trigger_update_school_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Queue a job to update school stats (e.g., through pg_notify)
    PERFORM pg_notify('update_school_stats', '');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update school stats on quiz attempt changes
DROP TRIGGER IF EXISTS update_school_stats_on_quiz_attempt ON public.quiz_attempts;
CREATE TRIGGER update_school_stats_on_quiz_attempt
AFTER INSERT OR DELETE OR UPDATE ON public.quiz_attempts
FOR EACH STATEMENT EXECUTE FUNCTION public.trigger_update_school_stats();

-- Enable Row Level Security
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_attempts' AND policyname = 'Users can view their own quiz attempts'
    ) THEN
        DROP POLICY "Users can view their own quiz attempts" ON public.quiz_attempts;
    END IF;

    -- Drop select policy for teachers if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_attempts' AND policyname = 'Teachers and admins can view all quiz attempts'
    ) THEN
        DROP POLICY "Teachers and admins can view all quiz attempts" ON public.quiz_attempts;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_attempts' AND policyname = 'Users can insert their own quiz attempts'
    ) THEN
        DROP POLICY "Users can insert their own quiz attempts" ON public.quiz_attempts;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_attempts' AND policyname = 'Users can update their own quiz attempts'
    ) THEN
        DROP POLICY "Users can update their own quiz attempts" ON public.quiz_attempts;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_attempts' AND policyname = 'No one can delete quiz attempts'
    ) THEN
        DROP POLICY "No one can delete quiz attempts" ON public.quiz_attempts;
    END IF;
END
$$;

-- Create policies
-- Allow users to view their own quiz attempts
CREATE POLICY "Users can view their own quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (
  user_id = auth.uid()
);

-- Allow teachers and admins to view all quiz attempts (for reporting)
CREATE POLICY "Teachers and admins can view all quiz attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND (up.school_role = 'teacher' OR up.school_role = 'admin')
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (ur.role = 'admin' OR ur.role LIKE '%admin%')
  )
);

-- Allow users to insert their own quiz attempts (ensure they can only create records for themselves)
CREATE POLICY "Users can insert their own quiz attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
);

-- Allow users to update only their own incomplete quiz attempts (restricts changing completed attempts)
CREATE POLICY "Users can update their own quiz attempts" 
ON public.quiz_attempts 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  AND (
    -- Allow updating if attempt is not completed yet or by service role
    completed = false OR 
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND (up.school_role = 'teacher' OR up.school_role = 'admin')
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND (ur.role = 'admin' OR ur.role LIKE '%admin%')
    )
  )
);

-- Prevent deletion of quiz attempts (immutable record)
CREATE POLICY "No one can delete quiz attempts" 
ON public.quiz_attempts 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT ON public.quiz_attempts TO authenticated;
GRANT INSERT, UPDATE ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

-- Function to check if a quiz attempt can be awarded XP
CREATE OR REPLACE FUNCTION public.can_award_xp_for_quiz_attempt(attempt_id uuid)
RETURNS boolean AS $$
DECLARE
  is_verified boolean;
  is_completed boolean;
  has_user boolean;
BEGIN
  SELECT 
    q.verified,
    qa.completed,
    qa.user_id IS NOT NULL
  INTO 
    is_verified, 
    is_completed,
    has_user
  FROM 
    public.quiz_attempts qa
    JOIN public.quizzes q ON qa.quiz_id = q.id
  WHERE 
    qa.id = attempt_id;

  -- Award XP only if the quiz is verified, the attempt is completed, and there's a user
  RETURN is_verified AND is_completed AND has_user;
END;
$$ LANGUAGE plpgsql;
