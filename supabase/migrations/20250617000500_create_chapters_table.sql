-- Migration for chapters table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create chapters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  subject_id uuid NULL,
  form integer NOT NULL,
  topics text[] NULL,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name text NOT NULL,
  CONSTRAINT chapters_pkey PRIMARY KEY (id),
  CONSTRAINT chapters_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

-- Create index for faster lookups by subject_id
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters USING btree (subject_id);

-- Add table comment
COMMENT ON TABLE public.chapters IS 'Stores chapters for educational subjects';

-- Create or replace trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updating the updated_at timestamp
DROP TRIGGER IF EXISTS chapters_updated_at ON public.chapters;
CREATE TRIGGER chapters_updated_at
BEFORE UPDATE ON public.chapters
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chapters' AND policyname = 'Allow read access to all chapters'
    ) THEN
        DROP POLICY "Allow read access to all chapters" ON public.chapters;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chapters' AND policyname = 'Admins and teachers can insert chapters'
    ) THEN
        DROP POLICY "Admins and teachers can insert chapters" ON public.chapters;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chapters' AND policyname = 'Admins and teachers can update chapters'
    ) THEN
        DROP POLICY "Admins and teachers can update chapters" ON public.chapters;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chapters' AND policyname = 'Admins and teachers can delete chapters'
    ) THEN
        DROP POLICY "Admins and teachers can delete chapters" ON public.chapters;
    END IF;
END
$$;

-- Create policies
-- Allow all authenticated users to read chapters
CREATE POLICY "Allow read access to all chapters" 
ON public.chapters 
FOR SELECT 
USING (true);

-- Only admins and teachers can insert chapters
CREATE POLICY "Admins and teachers can insert chapters" 
ON public.chapters 
FOR INSERT 
WITH CHECK (
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

-- Only admins and teachers can update chapters
CREATE POLICY "Admins and teachers can update chapters" 
ON public.chapters 
FOR UPDATE 
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

-- Only admins and teachers can delete chapters
CREATE POLICY "Admins and teachers can delete chapters" 
ON public.chapters 
FOR DELETE 
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

-- Grant appropriate privileges
GRANT SELECT ON public.chapters TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
