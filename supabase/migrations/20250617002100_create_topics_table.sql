-- Migration for topics table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create topics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  chapter_id uuid NULL,
  name text NOT NULL,
  description text NULL,
  difficulty_level integer NULL,
  time_estimate_minutes integer NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT topics_pkey PRIMARY KEY (id),
  CONSTRAINT topics_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE,
  CONSTRAINT topics_difficulty_level_check CHECK (
    (
      (difficulty_level >= 1)
      AND (difficulty_level <= 5)
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_topics_chapter_id ON public.topics USING btree (chapter_id);
CREATE INDEX IF NOT EXISTS idx_topics_order_index ON public.topics USING btree (order_index);
CREATE INDEX IF NOT EXISTS idx_topics_difficulty_level ON public.topics USING btree (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON public.topics USING btree (created_at);

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
    WHERE tgname = 'set_topics_updated_at'
    AND tgrelid = 'public.topics'::regclass
  ) THEN
    CREATE TRIGGER set_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.topics IS 'Stores topics within chapters for curriculum organization';

-- Enable Row Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'topics' AND policyname = 'Anyone can view topics'
    ) THEN
        DROP POLICY "Anyone can view topics" ON public.topics;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'topics' AND policyname = 'Teachers and admins can create topics'
    ) THEN
        DROP POLICY "Teachers and admins can create topics" ON public.topics;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'topics' AND policyname = 'Teachers and admins can update topics'
    ) THEN
        DROP POLICY "Teachers and admins can update topics" ON public.topics;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'topics' AND policyname = 'Only admins can delete topics'
    ) THEN
        DROP POLICY "Only admins can delete topics" ON public.topics;
    END IF;
END
$$;

-- Create policies

-- Allow anyone to view topics
CREATE POLICY "Anyone can view topics" 
ON public.topics 
FOR SELECT 
USING (true);

-- Allow teachers and admins to create topics
CREATE POLICY "Teachers and admins can create topics" 
ON public.topics 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (
      role = 'admin' OR 
      role LIKE '%admin%' OR 
      role = 'teacher'
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND (school_role = 'admin' OR school_role = 'teacher')
  )
);

-- Allow teachers and admins to update topics
CREATE POLICY "Teachers and admins can update topics" 
ON public.topics 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (
      role = 'admin' OR 
      role LIKE '%admin%' OR 
      role = 'teacher'
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND (school_role = 'admin' OR school_role = 'teacher')
  )
);

-- Only admins can delete topics
CREATE POLICY "Only admins can delete topics" 
ON public.topics 
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
GRANT SELECT ON public.topics TO anon, authenticated;
GRANT INSERT, UPDATE ON public.topics TO authenticated;
GRANT DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;

-- Create helper functions

-- Function to get topics by chapter
CREATE OR REPLACE FUNCTION public.get_topics_by_chapter(p_chapter_id uuid)
RETURNS SETOF public.topics AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.topics
  WHERE chapter_id = p_chapter_id
  ORDER BY order_index, name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to reorder topics within a chapter
CREATE OR REPLACE FUNCTION public.reorder_topics(
  p_chapter_id uuid,
  p_topic_ids uuid[]
)
RETURNS boolean AS $$
DECLARE
  v_can_update boolean;
  v_topic_id uuid;
  v_order integer := 1;
BEGIN
  -- Check if user has permission to update topics
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND (
      role = 'admin' OR 
      role LIKE '%admin%' OR 
      role = 'teacher'
    )
  ) OR EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND (school_role = 'admin' OR school_role = 'teacher')
  ) INTO v_can_update;
  
  -- Only proceed if user can update
  IF NOT v_can_update THEN
    RAISE EXCEPTION 'Insufficient permissions to reorder topics';
  END IF;
  
  -- Update order of each topic
  FOREACH v_topic_id IN ARRAY p_topic_ids
  LOOP
    UPDATE public.topics
    SET order_index = v_order
    WHERE id = v_topic_id
    AND chapter_id = p_chapter_id;
    
    v_order := v_order + 1;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get topic details with chapter info
CREATE OR REPLACE FUNCTION public.get_topic_with_chapter(p_topic_id uuid)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'topic', row_to_json(t),
      'chapter', row_to_json(c),
      'quizzes_count', (
        SELECT COUNT(*)
        FROM public.quizzes q
        WHERE q.topic_id = t.id
      ),
      'has_verified_quizzes', (
        SELECT COUNT(*) > 0
        FROM public.quizzes q
        WHERE q.topic_id = t.id
        AND q.verified = true
      )
    )
    FROM public.topics t
    LEFT JOIN public.chapters c ON t.chapter_id = c.id
    WHERE t.id = p_topic_id
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
