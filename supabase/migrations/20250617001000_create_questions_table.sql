-- Migration for questions table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  quiz_id uuid NOT NULL,
  text text NOT NULL,
  type text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT questions_type_check CHECK (
    (
      type = ANY (ARRAY['radio'::text, 'checkbox'::text])
    )
  )
);

-- Create index for faster lookups by quiz_id
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions USING btree (quiz_id);

-- Add table comment
COMMENT ON TABLE public.questions IS 'Stores quiz questions';

-- Create or replace trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS questions_updated_at ON public.questions;
CREATE TRIGGER questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' AND policyname = 'Allow read access to all questions'
    ) THEN
        DROP POLICY "Allow read access to all questions" ON public.questions;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' AND policyname = 'Quiz creators can insert questions'
    ) THEN
        DROP POLICY "Quiz creators can insert questions" ON public.questions;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' AND policyname = 'Quiz creators can update questions'
    ) THEN
        DROP POLICY "Quiz creators can update questions" ON public.questions;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'questions' AND policyname = 'Quiz creators can delete questions'
    ) THEN
        DROP POLICY "Quiz creators can delete questions" ON public.questions;
    END IF;
END
$$;

-- Create policies
-- Allow all authenticated users to read questions
CREATE POLICY "Allow read access to all questions" 
ON public.questions 
FOR SELECT 
USING (true);

-- Quiz creators can insert questions 
-- (for quizzes they created or if they are an admin/teacher)
CREATE POLICY "Quiz creators can insert questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = quiz_id
    AND (
      q.created_by = auth.uid()
      OR EXISTS (
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
  )
);

-- Quiz creators can update questions
-- (for quizzes they created or if they are an admin/teacher)
CREATE POLICY "Quiz creators can update questions" 
ON public.questions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = quiz_id
    AND (
      q.created_by = auth.uid()
      OR EXISTS (
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
  )
);

-- Quiz creators can delete questions
-- (for quizzes they created or if they are an admin/teacher)
CREATE POLICY "Quiz creators can delete questions" 
ON public.questions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = quiz_id
    AND (
      q.created_by = auth.uid()
      OR EXISTS (
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
  )
);

-- Grant appropriate privileges
GRANT SELECT ON public.questions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
