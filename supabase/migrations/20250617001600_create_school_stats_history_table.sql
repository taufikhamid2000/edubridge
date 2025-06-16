-- Migration for school_stats_history table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create school_stats_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_stats_history (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  recorded_at timestamp with time zone NOT NULL,
  schools_count integer NOT NULL,
  students_count integer NOT NULL,
  average_participation numeric(5, 2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT school_stats_history_pkey PRIMARY KEY (id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS school_stats_history_recorded_at_idx ON public.school_stats_history USING btree (recorded_at);
CREATE INDEX IF NOT EXISTS school_stats_history_created_at_idx ON public.school_stats_history USING btree (created_at);

-- Add table comment
COMMENT ON TABLE public.school_stats_history IS 'Historical snapshots of aggregate school statistics over time';

-- Enable Row Level Security
ALTER TABLE public.school_stats_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats_history' AND policyname = 'Admins can view school stats history'
    ) THEN
        DROP POLICY "Admins can view school stats history" ON public.school_stats_history;
    END IF;

    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats_history' AND policyname = 'Service role can insert school stats history'
    ) THEN
        DROP POLICY "Service role can insert school stats history" ON public.school_stats_history;
    END IF;
    
    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats_history' AND policyname = 'No updates to school stats history'
    ) THEN
        DROP POLICY "No updates to school stats history" ON public.school_stats_history;
    END IF;
    
    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats_history' AND policyname = 'Only admins can delete old history entries'
    ) THEN
        DROP POLICY "Only admins can delete old history entries" ON public.school_stats_history;
    END IF;
END
$$;

-- Create policies

-- Allow platform admins to view all history entries
CREATE POLICY "Admins can view school stats history" 
ON public.school_stats_history 
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

-- Only service role can insert history entries (for scheduled tasks)
CREATE POLICY "Service role can insert school stats history" 
ON public.school_stats_history 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- No updates to history entries (immutable historical record)
CREATE POLICY "No updates to school stats history" 
ON public.school_stats_history 
FOR UPDATE 
USING (false);

-- Only admins can delete old history entries (for data retention)
CREATE POLICY "Only admins can delete old history entries" 
ON public.school_stats_history 
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
GRANT SELECT ON public.school_stats_history TO authenticated;
GRANT INSERT ON public.school_stats_history TO service_role;
GRANT DELETE ON public.school_stats_history TO service_role;
GRANT ALL ON public.school_stats_history TO postgres;

-- Create function to capture daily stats history
CREATE OR REPLACE FUNCTION public.capture_school_stats_snapshot()
RETURNS uuid AS $$
DECLARE
  v_snapshot_id uuid;
BEGIN
  -- Insert the aggregated statistics
  INSERT INTO public.school_stats_history (
    recorded_at,
    schools_count,
    students_count,
    average_participation
  )
  SELECT 
    now() as recorded_at,
    COUNT(DISTINCT s.id) as schools_count,
    COUNT(DISTINCT up.id) as students_count,
    AVG(COALESCE(ss.participation_rate, 0)) as average_participation
  FROM 
    public.schools s
    LEFT JOIN public.user_profiles up ON s.id = up.school_id AND up.role = 'student' AND up.is_active = true
    LEFT JOIN public.school_stats ss ON s.id = ss.school_id
  RETURNING id INTO v_snapshot_id;
  
  -- Clean up old history entries (keep last 365 days)
  DELETE FROM public.school_stats_history
  WHERE recorded_at < (now() - interval '365 days');
  
  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
