-- Migration for quizzes table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create quizzes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  topic_id uuid NOT NULL,
  name text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  verified boolean NULL DEFAULT false,
  verified_by uuid NULL,
  verified_at timestamp with time zone NULL,
  verification_feedback text NULL,
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE,
  CONSTRAINT quizzes_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON public.quizzes USING btree (topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_verified ON public.quizzes USING btree (verified);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON public.quizzes USING btree (created_at);

-- Add updated_at column and trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quizzes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.quizzes 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    
    -- Create function for updated_at trigger if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'update_timestamp' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
      CREATE OR REPLACE FUNCTION public.update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    END IF;
    
    -- Create trigger for updated_at
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.quizzes IS 'Stores quizzes created by users';

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Anyone can view verified quizzes'
    ) THEN
        DROP POLICY "Anyone can view verified quizzes" ON public.quizzes;
    END IF;

    -- Drop select policy for creator if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Users can view their own quizzes'
    ) THEN
        DROP POLICY "Users can view their own quizzes" ON public.quizzes;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Admins can view all quizzes'
    ) THEN
        DROP POLICY "Admins can view all quizzes" ON public.quizzes;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Authenticated users can create quizzes'
    ) THEN
        DROP POLICY "Authenticated users can create quizzes" ON public.quizzes;
    END IF;

    -- Drop update policy for creator if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Users can update their own unverified quizzes'
    ) THEN
        DROP POLICY "Users can update their own unverified quizzes" ON public.quizzes;
    END IF;

    -- Drop update policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Admins can update any quiz'
    ) THEN
        DROP POLICY "Admins can update any quiz" ON public.quizzes;
    END IF;

    -- Drop delete policy for creator if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Users can delete their own unverified quizzes'
    ) THEN
        DROP POLICY "Users can delete their own unverified quizzes" ON public.quizzes;
    END IF;

    -- Drop delete policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quizzes' AND policyname = 'Admins can delete any quiz'
    ) THEN
        DROP POLICY "Admins can delete any quiz" ON public.quizzes;
    END IF;
END
$$;

-- Create policies

-- Allow anyone to view verified quizzes
CREATE POLICY "Anyone can view verified quizzes" 
ON public.quizzes 
FOR SELECT 
USING (verified = true);

-- Allow users to view their own quizzes regardless of verification status
CREATE POLICY "Users can view their own quizzes" 
ON public.quizzes 
FOR SELECT 
USING (created_by = auth.uid()::text);

-- Allow admins to view all quizzes
CREATE POLICY "Admins can view all quizzes" 
ON public.quizzes 
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

-- Allow authenticated users to create quizzes
CREATE POLICY "Authenticated users can create quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  created_by = auth.uid()::text
);

-- Allow users to update their own unverified quizzes
CREATE POLICY "Users can update their own unverified quizzes" 
ON public.quizzes 
FOR UPDATE 
USING (
  created_by = auth.uid()::text AND 
  (verified IS NULL OR verified = false)
);

-- Allow admins to update any quiz
CREATE POLICY "Admins can update any quiz" 
ON public.quizzes 
FOR UPDATE 
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

-- Allow users to delete their own unverified quizzes
CREATE POLICY "Users can delete their own unverified quizzes" 
ON public.quizzes 
FOR DELETE 
USING (
  created_by = auth.uid()::text AND 
  (verified IS NULL OR verified = false)
);

-- Allow admins to delete any quiz
CREATE POLICY "Admins can delete any quiz" 
ON public.quizzes 
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
GRANT SELECT ON public.quizzes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT ALL ON public.quizzes TO service_role;

-- Create helper functions for quiz management
CREATE OR REPLACE FUNCTION public.is_quiz_creator(quiz_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.quizzes
    WHERE id = quiz_id
    AND created_by = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get verified status of quiz
CREATE OR REPLACE FUNCTION public.is_quiz_verified(quiz_id uuid)
RETURNS boolean AS $$
DECLARE
  v_verified boolean;
BEGIN
  SELECT verified INTO v_verified
  FROM public.quizzes
  WHERE id = quiz_id;
  
  RETURN COALESCE(v_verified, false);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Create function to check if user can edit quiz
CREATE OR REPLACE FUNCTION public.can_edit_quiz(quiz_id uuid)
RETURNS boolean AS $$
DECLARE
  v_is_creator boolean;
  v_is_verified boolean;
  v_is_admin boolean;
BEGIN
  -- Check if user is creator
  SELECT EXISTS (
    SELECT 1
    FROM public.quizzes
    WHERE id = quiz_id
    AND created_by = auth.uid()::text
  ) INTO v_is_creator;
  
  -- Check if quiz is verified
  SELECT verified INTO v_is_verified
  FROM public.quizzes
  WHERE id = quiz_id;
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR role LIKE '%admin%')
  ) OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND school_role = 'admin'
  ) INTO v_is_admin;
  
  -- Creator can edit if quiz is not verified, admin can edit anything
  RETURN (v_is_creator AND (v_is_verified IS NULL OR v_is_verified = FALSE)) OR v_is_admin;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
