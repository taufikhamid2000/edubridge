-- Migration for career_pathways table with RLS policies
-- This table stores career information and subject requirements for the career guidance feature

-- Create career_pathways table
CREATE TABLE IF NOT EXISTS public.career_pathways (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  order_index integer NULL DEFAULT 0,
  is_disabled boolean NOT NULL DEFAULT false,
  CONSTRAINT career_pathways_pkey PRIMARY KEY (id),
  CONSTRAINT career_pathways_slug_key UNIQUE (slug)
);

-- Create career_subject_requirements table for storing subject requirements
CREATE TABLE IF NOT EXISTS public.career_subject_requirements (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  career_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  requirement_type text NOT NULL, -- 'must', 'should', or 'can'
  order_index integer NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT career_subject_requirements_pkey PRIMARY KEY (id),
  CONSTRAINT career_subject_requirements_career_subject_unique UNIQUE (career_id, subject_id),
  CONSTRAINT fk_career_pathways FOREIGN KEY (career_id) REFERENCES public.career_pathways (id) ON DELETE CASCADE,
  CONSTRAINT fk_subjects FOREIGN KEY (subject_id) REFERENCES public.subjects (id) ON DELETE CASCADE,
  CONSTRAINT requirement_type_check CHECK (requirement_type IN ('must', 'should', 'can'))
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_career_pathways_slug ON public.career_pathways USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_career_pathways_is_disabled ON public.career_pathways USING btree (is_disabled);
CREATE INDEX IF NOT EXISTS idx_career_subject_requirements_career_id ON public.career_subject_requirements USING btree (career_id);
CREATE INDEX IF NOT EXISTS idx_career_subject_requirements_subject_id ON public.career_subject_requirements USING btree (subject_id);
CREATE INDEX IF NOT EXISTS idx_career_subject_requirements_type ON public.career_subject_requirements USING btree (requirement_type);

-- Create trigger function for updated_at if not exists
DO $outer$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_updated_at'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $inner$
    BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
    END;
    $inner$ LANGUAGE plpgsql;
  END IF;
END
$outer$;

-- Create trigger to update updated_at automatically for career_pathways
DO $outer$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_career_pathways_updated_at'
    AND tgrelid = 'public.career_pathways'::regclass
  ) THEN
    CREATE TRIGGER set_career_pathways_updated_at
    BEFORE UPDATE ON public.career_pathways
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$outer$;

-- Create trigger to update updated_at automatically for career_subject_requirements
DO $outer$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_career_subject_requirements_updated_at'
    AND tgrelid = 'public.career_subject_requirements'::regclass
  ) THEN
    CREATE TRIGGER set_career_subject_requirements_updated_at
    BEFORE UPDATE ON public.career_subject_requirements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$outer$;

-- Add table comments
COMMENT ON TABLE public.career_pathways IS 'Stores career pathway information for student guidance';
COMMENT ON TABLE public.career_subject_requirements IS 'Maps subjects to careers with requirement types (must, should, can)';

-- Enable Row Level Security
ALTER TABLE public.career_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_subject_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for career_pathways
CREATE POLICY "Anyone can view enabled career pathways" ON public.career_pathways
  FOR SELECT USING (is_disabled = false);
  
CREATE POLICY "Admins can view all career pathways" ON public.career_pathways
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can create career pathways" ON public.career_pathways
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can update career pathways" ON public.career_pathways
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can delete career pathways" ON public.career_pathways
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create RLS policies for career_subject_requirements
CREATE POLICY "Anyone can view career subject requirements" ON public.career_subject_requirements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.career_pathways cp
      WHERE cp.id = career_id AND cp.is_disabled = false
    )
  );
  
CREATE POLICY "Admins can view all career subject requirements" ON public.career_subject_requirements
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can create career subject requirements" ON public.career_subject_requirements
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can update career subject requirements" ON public.career_subject_requirements
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Only admins can delete career subject requirements" ON public.career_subject_requirements
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );
