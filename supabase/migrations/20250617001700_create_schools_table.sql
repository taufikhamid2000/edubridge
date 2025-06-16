-- Migration for schools table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create or replace the handle_updated_at function if not exists
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
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  code text NULL,
  district text NOT NULL,
  state text NOT NULL,
  address text NULL,
  website text NULL,
  phone text NULL,
  principal_name text NULL,
  total_students integer NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id),
  CONSTRAINT schools_code_key UNIQUE (code),
  CONSTRAINT schools_type_check CHECK (
    (
      type = ANY (
        ARRAY[
          'SMK'::text,
          'SMKA'::text,
          'MRSM'::text,
          'Sekolah Sains'::text,
          'Sekolah Sukan'::text,
          'Sekolah Seni'::text,
          'SBP'::text,
          'SMJK'::text,
          'KV'::text
        ]
      )
    )
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_type ON public.schools USING btree (type);
CREATE INDEX IF NOT EXISTS idx_schools_state ON public.schools USING btree (state);
CREATE INDEX IF NOT EXISTS idx_schools_district ON public.schools USING btree (district);
CREATE INDEX IF NOT EXISTS idx_schools_name ON public.schools USING btree (name);
CREATE INDEX IF NOT EXISTS idx_schools_created_at ON public.schools USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.schools IS 'Stores information about educational institutions';

-- Drop duplicate trigger if it exists (we'll create only one)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_schools_updated_at'
    AND tgrelid = 'public.schools'::regclass
  ) THEN
    DROP TRIGGER set_schools_updated_at ON public.schools;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at'
    AND tgrelid = 'public.schools'::regclass
  ) THEN
    DROP TRIGGER set_updated_at ON public.schools;
  END IF;
END
$$;

-- Create single trigger for updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' AND policyname = 'Anyone can view schools'
    ) THEN
        DROP POLICY "Anyone can view schools" ON public.schools;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' AND policyname = 'Only admins can create schools'
    ) THEN
        DROP POLICY "Only admins can create schools" ON public.schools;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' AND policyname = 'Only admins can update schools'
    ) THEN
        DROP POLICY "Only admins can update schools" ON public.schools;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' AND policyname = 'Only admins can delete schools'
    ) THEN
        DROP POLICY "Only admins can delete schools" ON public.schools;
    END IF;
END
$$;

-- Create policies

-- Allow all users to view schools
CREATE POLICY "Anyone can view schools" 
ON public.schools 
FOR SELECT 
USING (true);

-- Only admins can create schools
CREATE POLICY "Only admins can create schools" 
ON public.schools 
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

-- Only admins can update schools
CREATE POLICY "Only admins can update schools" 
ON public.schools 
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

-- Only admins can delete schools
CREATE POLICY "Only admins can delete schools" 
ON public.schools 
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
GRANT SELECT ON public.schools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;

-- Add helper functions

-- Function to get schools by criteria
CREATE OR REPLACE FUNCTION public.get_schools_by_criteria(
  p_type text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_district text DEFAULT NULL,
  p_search text DEFAULT NULL
)
RETURNS SETOF public.schools AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.schools s
  WHERE 
    (p_type IS NULL OR s.type = p_type)
    AND (p_state IS NULL OR s.state = p_state)
    AND (p_district IS NULL OR s.district = p_district)
    AND (
      p_search IS NULL 
      OR s.name ILIKE '%' || p_search || '%'
      OR s.code ILIKE '%' || p_search || '%'
    )
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to upsert school record
CREATE OR REPLACE FUNCTION public.upsert_school(
  p_school_id uuid DEFAULT NULL,
  p_name text,
  p_type text,
  p_code text DEFAULT NULL,
  p_district text,
  p_state text,
  p_address text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_principal_name text DEFAULT NULL,
  p_total_students integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_is_admin boolean;
  v_school_id uuid;
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
    RAISE EXCEPTION 'Only administrators can manage schools';
  END IF;

  -- Insert or update school
  IF p_school_id IS NULL THEN
    -- Insert new school
    INSERT INTO public.schools (
      name,
      type,
      code,
      district,
      state,
      address,
      website,
      phone,
      principal_name,
      total_students
    ) VALUES (
      p_name,
      p_type,
      p_code,
      p_district,
      p_state,
      p_address,
      p_website,
      p_phone,
      p_principal_name,
      p_total_students
    )
    RETURNING id INTO v_school_id;
  ELSE
    -- Update existing school
    UPDATE public.schools
    SET
      name = p_name,
      type = p_type,
      code = p_code,
      district = p_district,
      state = p_state,
      address = p_address,
      website = p_website,
      phone = p_phone,
      principal_name = p_principal_name,
      total_students = p_total_students,
      updated_at = now()
    WHERE id = p_school_id
    RETURNING id INTO v_school_id;
  END IF;
  
  RETURN v_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
