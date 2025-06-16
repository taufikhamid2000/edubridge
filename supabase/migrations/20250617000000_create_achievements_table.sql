-- Migration for achievements table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  progress integer NULL,
  max_progress integer NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements USING btree (user_id);

-- Add table comment
COMMENT ON TABLE public.achievements IS 'Stores user achievements and progress';

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'achievements' AND policyname = 'Users can view their own achievements'
    ) THEN
        DROP POLICY "Users can view their own achievements" ON public.achievements;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'achievements' AND policyname = 'Users cannot insert achievements'
    ) THEN
        DROP POLICY "Users cannot insert achievements" ON public.achievements;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'achievements' AND policyname = 'Users cannot update achievements'
    ) THEN
        DROP POLICY "Users cannot update achievements" ON public.achievements;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'achievements' AND policyname = 'Users cannot delete achievements'
    ) THEN
        DROP POLICY "Users cannot delete achievements" ON public.achievements;
    END IF;
END
$$;

-- Create policies
-- Allow users to view only their own achievements
CREATE POLICY "Users can view their own achievements" 
ON public.achievements 
FOR SELECT 
USING (auth.uid() = user_id);

-- Prevent direct insertion from users - should be handled by functions or service role
CREATE POLICY "Users cannot insert achievements" 
ON public.achievements 
FOR INSERT 
WITH CHECK (false);

-- Prevent users from updating achievements
CREATE POLICY "Users cannot update achievements" 
ON public.achievements 
FOR UPDATE 
USING (false);

-- Prevent users from deleting achievements
CREATE POLICY "Users cannot delete achievements" 
ON public.achievements 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
