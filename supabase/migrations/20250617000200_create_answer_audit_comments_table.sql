-- Migration for answer_audit_comments table with RLS policies
-- This handles creating the table, indexes, and security policies

-- First, ensure the handle_updated_at function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create answer_audit_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.answer_audit_comments (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  answer_id uuid NOT NULL,
  admin_user_id uuid NOT NULL,
  comment_text text NOT NULL,
  comment_type text NOT NULL,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT answer_audit_comments_pkey PRIMARY KEY (id),
  CONSTRAINT answer_audit_comments_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT answer_audit_comments_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON DELETE CASCADE,
  CONSTRAINT answer_audit_comments_comment_type_check CHECK (
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
CREATE INDEX IF NOT EXISTS idx_answer_audit_comments_answer_id ON public.answer_audit_comments USING btree (answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_audit_comments_admin_user_id ON public.answer_audit_comments USING btree (admin_user_id);

-- Add table comment
COMMENT ON TABLE public.answer_audit_comments IS 'Stores admin review comments for answer auditing';

-- Create trigger for automatically updating updated_at timestamp
DROP TRIGGER IF EXISTS update_answer_audit_comments_updated_at ON public.answer_audit_comments;
CREATE TRIGGER update_answer_audit_comments_updated_at 
BEFORE UPDATE ON public.answer_audit_comments 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.answer_audit_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_audit_comments' AND policyname = 'Admins can view all comments'
    ) THEN
        DROP POLICY "Admins can view all comments" ON public.answer_audit_comments;
    END IF;

    -- Drop creator select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_audit_comments' AND policyname = 'Answer creators can view comments on their answers'
    ) THEN
        DROP POLICY "Answer creators can view comments on their answers" ON public.answer_audit_comments;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_audit_comments' AND policyname = 'Only admins can insert comments'
    ) THEN
        DROP POLICY "Only admins can insert comments" ON public.answer_audit_comments;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_audit_comments' AND policyname = 'Only comment author can update comments'
    ) THEN
        DROP POLICY "Only comment author can update comments" ON public.answer_audit_comments;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'answer_audit_comments' AND policyname = 'Only admins can delete comments'
    ) THEN
        DROP POLICY "Only admins can delete comments" ON public.answer_audit_comments;
    END IF;
END
$$;

-- Create policies
-- Allow admins to view all comments
CREATE POLICY "Admins can view all comments" 
ON public.answer_audit_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
);

-- Allow answer creators to view comments on their answers
CREATE POLICY "Answer creators can view comments on their answers" 
ON public.answer_audit_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.answers a
    WHERE a.id = answer_audit_comments.answer_id
    AND a.created_by = auth.uid()
  )
);

-- Allow admins to insert comments
CREATE POLICY "Only admins can insert comments" 
ON public.answer_audit_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
  AND auth.uid() = admin_user_id
);

-- Only comment author can update their own comments
CREATE POLICY "Only comment author can update comments" 
ON public.answer_audit_comments 
FOR UPDATE 
USING (
  auth.uid() = admin_user_id
);

-- Only admins can delete comments
CREATE POLICY "Only admins can delete comments" 
ON public.answer_audit_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  )
);

-- Grant appropriate privileges
GRANT SELECT ON public.answer_audit_comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.answer_audit_comments TO authenticated;
GRANT ALL ON public.answer_audit_comments TO service_role;
