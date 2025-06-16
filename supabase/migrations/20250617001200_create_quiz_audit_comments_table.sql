-- Migration for quiz_audit_comments table with RLS policies
-- This handles creating the table, indexes, and security policies

-- First, ensure the handle_updated_at function exists if not already created
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create quiz_audit_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_audit_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  quiz_id uuid NOT NULL,
  admin_user_id uuid NOT NULL,
  comment_text text NOT NULL,
  comment_type text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quiz_audit_comments_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_audit_comments_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT quiz_audit_comments_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_audit_comments_comment_type_check CHECK (
    (
      comment_type = ANY (
        ARRAY[
          'suggestion'::text,
          'issue'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_audit_comments_quiz_id ON public.quiz_audit_comments USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_audit_comments_admin_user_id ON public.quiz_audit_comments USING btree (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_audit_comments_comment_type ON public.quiz_audit_comments USING btree (comment_type);
CREATE INDEX IF NOT EXISTS idx_quiz_audit_comments_created_at ON public.quiz_audit_comments USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.quiz_audit_comments IS 'Stores admin review comments for quiz verification';

-- Create trigger for automatically updating updated_at timestamp
DROP TRIGGER IF EXISTS update_quiz_audit_comments_updated_at ON public.quiz_audit_comments;
CREATE TRIGGER update_quiz_audit_comments_updated_at 
BEFORE UPDATE ON public.quiz_audit_comments 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.quiz_audit_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_audit_comments' AND policyname = 'Admins can view all quiz comments'
    ) THEN
        DROP POLICY "Admins can view all quiz comments" ON public.quiz_audit_comments;
    END IF;

    -- Drop creator select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_audit_comments' AND policyname = 'Quiz creators can view comments on their quizzes'
    ) THEN
        DROP POLICY "Quiz creators can view comments on their quizzes" ON public.quiz_audit_comments;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_audit_comments' AND policyname = 'Only admins can insert quiz comments'
    ) THEN
        DROP POLICY "Only admins can insert quiz comments" ON public.quiz_audit_comments;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_audit_comments' AND policyname = 'Only comment author can update quiz comments'
    ) THEN
        DROP POLICY "Only comment author can update quiz comments" ON public.quiz_audit_comments;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_audit_comments' AND policyname = 'Only admins can delete quiz comments'
    ) THEN
        DROP POLICY "Only admins can delete quiz comments" ON public.quiz_audit_comments;
    END IF;
END
$$;

-- Create policies
-- Allow admins to view all comments
CREATE POLICY "Admins can view all quiz comments" 
ON public.quiz_audit_comments 
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

-- Allow quiz creators to view comments on their quizzes
CREATE POLICY "Quiz creators can view comments on their quizzes" 
ON public.quiz_audit_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = quiz_audit_comments.quiz_id
    AND q.created_by = auth.uid()
  )
);

-- Allow admins to insert comments
CREATE POLICY "Only admins can insert quiz comments" 
ON public.quiz_audit_comments 
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

-- Only comment author can update their own comments
CREATE POLICY "Only comment author can update quiz comments" 
ON public.quiz_audit_comments 
FOR UPDATE 
USING (
  auth.uid() = admin_user_id
);

-- Only admins can delete comments
CREATE POLICY "Only admins can delete quiz comments" 
ON public.quiz_audit_comments 
FOR DELETE 
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

-- Grant appropriate privileges
GRANT SELECT ON public.quiz_audit_comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quiz_audit_comments TO authenticated;
GRANT ALL ON public.quiz_audit_comments TO service_role;

-- Create function to get audit comment history for a quiz
CREATE OR REPLACE FUNCTION public.get_quiz_audit_history(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  admin_user_id uuid,
  admin_name text,
  comment_text text,
  comment_type text,
  is_resolved boolean,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qac.id,
    qac.admin_user_id,
    up.display_name as admin_name,
    qac.comment_text,
    qac.comment_type,
    qac.is_resolved,
    qac.created_at
  FROM 
    public.quiz_audit_comments qac
    LEFT JOIN public.user_profiles up ON qac.admin_user_id = up.id
  WHERE 
    qac.quiz_id = p_quiz_id
  ORDER BY 
    qac.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
