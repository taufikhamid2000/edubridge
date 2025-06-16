-- Migration for subjects table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create subjects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL,
  description text NULL,
  icon text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  order_index integer NULL DEFAULT 0,
  category text NULL,
  category_priority integer NULL DEFAULT 999,
  is_disabled boolean NOT NULL DEFAULT false,
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_slug_key UNIQUE (slug),
  CONSTRAINT subjects_slug_unique UNIQUE (slug)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subjects_category_priority ON public.subjects USING btree (category_priority, order_index);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON public.subjects USING btree (id) WHERE (category IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects USING btree (name);
CREATE INDEX IF NOT EXISTS idx_subjects_is_disabled ON public.subjects USING btree (is_disabled);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects USING btree (category);

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
    WHERE tgname = 'set_subjects_updated_at'
    AND tgrelid = 'public.subjects'::regclass
  ) THEN
    CREATE TRIGGER set_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- Add table comment
COMMENT ON TABLE public.subjects IS 'Stores academic subjects for the curriculum';

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'Anyone can view enabled subjects'
    ) THEN
        DROP POLICY "Anyone can view enabled subjects" ON public.subjects;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'Admins can view all subjects'
    ) THEN
        DROP POLICY "Admins can view all subjects" ON public.subjects;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'Only admins can create subjects'
    ) THEN
        DROP POLICY "Only admins can create subjects" ON public.subjects;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'Only admins can update subjects'
    ) THEN
        DROP POLICY "Only admins can update subjects" ON public.subjects;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subjects' AND policyname = 'Only admins can delete subjects'
    ) THEN
        DROP POLICY "Only admins can delete subjects" ON public.subjects;
    END IF;
END
$$;

-- Create policies

-- Allow anyone to view enabled subjects
CREATE POLICY "Anyone can view enabled subjects" 
ON public.subjects 
FOR SELECT 
USING (is_disabled = false);

-- Allow admins to view all subjects including disabled ones
CREATE POLICY "Admins can view all subjects" 
ON public.subjects 
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

-- Only admins can create subjects
CREATE POLICY "Only admins can create subjects" 
ON public.subjects 
FOR INSERT 
WITH CHECK (
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

-- Only admins can update subjects
CREATE POLICY "Only admins can update subjects" 
ON public.subjects 
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

-- Only admins can delete subjects
CREATE POLICY "Only admins can delete subjects" 
ON public.subjects 
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
GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;

-- Create helper functions

-- Function to get active subjects
CREATE OR REPLACE FUNCTION public.get_active_subjects()
RETURNS SETOF public.subjects AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.subjects
  WHERE is_disabled = false
  ORDER BY 
    COALESCE(category_priority, 999),
    COALESCE(order_index, 0),
    name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to get subjects by category
CREATE OR REPLACE FUNCTION public.get_subjects_by_category(p_category text)
RETURNS SETOF public.subjects AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.subjects
  WHERE category = p_category
  AND is_disabled = false
  ORDER BY 
    COALESCE(order_index, 0),
    name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to toggle subject status
CREATE OR REPLACE FUNCTION public.toggle_subject_status(p_subject_id uuid)
RETURNS boolean AS $$
DECLARE
  v_is_admin boolean;
  v_current_status boolean;
BEGIN
  -- Check if user is an admin
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
  
  -- Only proceed if user is an admin
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can toggle subject status';
  END IF;
  
  -- Get current status
  SELECT is_disabled INTO v_current_status
  FROM public.subjects
  WHERE id = p_subject_id;
  
  -- Update status (toggle)
  UPDATE public.subjects
  SET is_disabled = NOT v_current_status
  WHERE id = p_subject_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
