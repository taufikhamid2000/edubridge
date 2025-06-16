-- Migration for user_topic_progress table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create user_topic_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  topic_id uuid NULL,
  status text NULL,
  last_attempted_at timestamp with time zone NULL,
  score integer NULL,
  attempts integer NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_topic_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_topic_progress_user_id_topic_id_key UNIQUE (user_id, topic_id),
  CONSTRAINT user_topic_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE,
  CONSTRAINT user_topic_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_topic_progress_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'not_started'::text,
          'in_progress'::text,
          'completed'::text
        ]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_topic_id ON public.user_topic_progress USING btree (topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_id ON public.user_topic_progress USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_status ON public.user_topic_progress USING btree (status);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_last_attempted_at ON public.user_topic_progress USING btree (last_attempted_at);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_score ON public.user_topic_progress USING btree (score);

-- Create trigger function for updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create trigger to update updated_at automatically
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_user_topic_progress_updated_at'
    AND tgrelid = 'public.user_topic_progress'::regclass
  ) THEN
    CREATE TRIGGER set_user_topic_progress_updated_at
    BEFORE UPDATE ON public.user_topic_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.user_topic_progress IS 'Tracks user progress through curriculum topics';

-- Enable Row Level Security
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Users can view their own progress'
    ) THEN
        DROP POLICY "Users can view their own progress" ON public.user_topic_progress;
    END IF;

    -- Drop select policy for teachers if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Teachers can view their students'' progress'
    ) THEN
        DROP POLICY "Teachers can view their students'' progress" ON public.user_topic_progress;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Admins can view all progress'
    ) THEN
        DROP POLICY "Admins can view all progress" ON public.user_topic_progress;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Users can track their own progress'
    ) THEN
        DROP POLICY "Users can track their own progress" ON public.user_topic_progress;
    END IF;
    
    -- Drop update policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Users can update their own progress'
    ) THEN
        DROP POLICY "Users can update their own progress" ON public.user_topic_progress;
    END IF;
    
    -- Drop update policy for service role if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Service role can update any progress'
    ) THEN
        DROP POLICY "Service role can update any progress" ON public.user_topic_progress;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_topic_progress' AND policyname = 'Only admins can delete progress records'
    ) THEN
        DROP POLICY "Only admins can delete progress records" ON public.user_topic_progress;
    END IF;
END
$$;

-- Create policies

-- Allow users to view their own progress
CREATE POLICY "Users can view their own progress" 
ON public.user_topic_progress 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow teachers to view their students' progress
CREATE POLICY "Teachers can view their students' progress" 
ON public.user_topic_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles teacher
    JOIN public.user_profiles student ON teacher.school_id = student.school_id
    WHERE teacher.id = auth.uid()
    AND teacher.school_role = 'teacher'
    AND student.id = user_topic_progress.user_id
  )
);

-- Allow admins to view all progress
CREATE POLICY "Admins can view all progress" 
ON public.user_topic_progress 
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

-- Allow users to track their own progress
CREATE POLICY "Users can track their own progress" 
ON public.user_topic_progress 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own progress
CREATE POLICY "Users can update their own progress" 
ON public.user_topic_progress 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow service role to update any progress (for system processes)
CREATE POLICY "Service role can update any progress" 
ON public.user_topic_progress 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Only admins can delete progress records
CREATE POLICY "Only admins can delete progress records" 
ON public.user_topic_progress 
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
GRANT SELECT ON public.user_topic_progress TO authenticated;
GRANT INSERT, UPDATE ON public.user_topic_progress TO authenticated;
GRANT DELETE ON public.user_topic_progress TO authenticated;
GRANT ALL ON public.user_topic_progress TO service_role;

-- Create helper functions

-- Function to track or update topic progress
CREATE OR REPLACE FUNCTION public.track_topic_progress(
  p_user_id uuid,
  p_topic_id uuid,
  p_status text,
  p_score integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_progress_id uuid;
  v_attempts integer;
BEGIN
  -- Validate status
  IF p_status NOT IN ('not_started', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Invalid status: must be "not_started", "in_progress", or "completed"';
  END IF;

  -- Check if a record already exists
  SELECT id, COALESCE(attempts, 0)
  INTO v_progress_id, v_attempts
  FROM public.user_topic_progress
  WHERE user_id = p_user_id
  AND topic_id = p_topic_id;
  
  IF v_progress_id IS NOT NULL THEN
    -- Update existing record
    UPDATE public.user_topic_progress
    SET 
      status = p_status,
      last_attempted_at = now(),
      score = COALESCE(p_score, score),
      attempts = v_attempts + 1
    WHERE id = v_progress_id
    RETURNING id INTO v_progress_id;
  ELSE
    -- Insert new record
    INSERT INTO public.user_topic_progress (
      user_id,
      topic_id,
      status,
      last_attempted_at,
      score,
      attempts
    ) VALUES (
      p_user_id,
      p_topic_id,
      p_status,
      now(),
      p_score,
      1
    )
    RETURNING id INTO v_progress_id;
  END IF;
  
  -- If completed with a good score, award XP
  IF p_status = 'completed' AND p_score >= 70 THEN
    PERFORM public.add_user_xp(p_user_id, 50);
  END IF;
  
  RETURN v_progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user progress summary
CREATE OR REPLACE FUNCTION public.get_user_topic_progress_summary(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_topics', (SELECT COUNT(*) FROM public.topics),
    'completed', (
      SELECT COUNT(*) 
      FROM public.user_topic_progress 
      WHERE user_id = p_user_id AND status = 'completed'
    ),
    'in_progress', (
      SELECT COUNT(*) 
      FROM public.user_topic_progress 
      WHERE user_id = p_user_id AND status = 'in_progress'
    ),
    'not_started', (
      SELECT COUNT(*) 
      FROM public.topics
      WHERE id NOT IN (
        SELECT topic_id 
        FROM public.user_topic_progress 
        WHERE user_id = p_user_id
      )
    ),
    'average_score', (
      SELECT COALESCE(AVG(score), 0) 
      FROM public.user_topic_progress 
      WHERE user_id = p_user_id AND score IS NOT NULL
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
