-- Migration for answers table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create answers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  question_id uuid NOT NULL,
  text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT answers_pkey PRIMARY KEY (id),
  CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE
);

-- Create index for faster lookups by question_id
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers USING btree (question_id);

-- Add table comment
COMMENT ON TABLE public.answers IS 'Stores answer options for questions';

-- Create or replace trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS answers_updated_at ON public.answers;
CREATE TRIGGER answers_updated_at
BEFORE UPDATE ON public.answers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Allow read access to all answers'
    ) THEN
        DROP POLICY "Allow read access to all answers" ON public.answers;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Content creators can insert answers'
    ) THEN
        DROP POLICY "Content creators can insert answers" ON public.answers;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Content creators can update answers'
    ) THEN
        DROP POLICY "Content creators can update answers" ON public.answers;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answers' AND policyname = 'Content creators can delete answers'
    ) THEN
        DROP POLICY "Content creators can delete answers" ON public.answers;
    END IF;
END
$$;

-- Create policies
-- Allow all authenticated users to read answers
CREATE POLICY "Allow read access to all answers" 
ON public.answers 
FOR SELECT 
USING (true);

-- Content creators can insert answers 
-- (for questions they created or if they are an admin/teacher)
CREATE POLICY "Content creators can insert answers" 
ON public.answers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.questions q
    WHERE q.id = question_id
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

-- Content creators can update answers
-- (for questions they created or if they are an admin/teacher)
CREATE POLICY "Content creators can update answers" 
ON public.answers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.questions q
    WHERE q.id = question_id
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

-- Content creators can delete answers
-- (for questions they created or if they are an admin/teacher)
CREATE POLICY "Content creators can delete answers" 
ON public.answers 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.questions q
    WHERE q.id = question_id
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
GRANT SELECT ON public.answers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT ALL ON public.answers TO service_role;
