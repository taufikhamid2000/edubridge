-- Enable RLS on tables
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_stats_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.system_logs;
DROP POLICY IF EXISTS "Only admins can delete logs" ON public.system_logs;
DROP POLICY IF EXISTS "No updates allowed on logs" ON public.system_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.school_stats_history;
DROP POLICY IF EXISTS "Only admins can insert stats" ON public.school_stats_history;
DROP POLICY IF EXISTS "Only admins can update stats" ON public.school_stats_history;
DROP POLICY IF EXISTS "Only admins can delete stats" ON public.school_stats_history;

-- System Logs Policies

-- 1. Anyone can insert logs (needed for client-side error reporting)
CREATE POLICY "Enable insert for all users" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- 2. Users can only view their own logs
CREATE POLICY "Users can view own logs" ON public.system_logs
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- 3. Only admins can delete logs
CREATE POLICY "Only admins can delete logs" ON public.system_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. No updates allowed on logs
CREATE POLICY "No updates allowed on logs" ON public.system_logs
  FOR UPDATE USING (false);

-- School Stats History Policies

-- 1. Anyone can view school stats (needed for public leaderboard)
CREATE POLICY "Enable read access for all users" ON public.school_stats_history
  FOR SELECT USING (true);

-- 2. Only admins can insert new stats
CREATE POLICY "Only admins can insert stats" ON public.school_stats_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 3. Only admins can update stats
CREATE POLICY "Only admins can update stats" ON public.school_stats_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. Only admins can delete stats
CREATE POLICY "Only admins can delete stats" ON public.school_stats_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create helper function to record school stats
CREATE OR REPLACE FUNCTION public.record_school_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.school_stats_history (
    recorded_at,
    schools_count,
    students_count,
    average_participation
  )
  SELECT
    NOW(),
    (SELECT COUNT(*) FROM schools),
    (SELECT COUNT(*) FROM user_profiles WHERE school_role = 'student'),
    COALESCE(
      (
        SELECT AVG(participation_rate)
        FROM school_stats
        WHERE participation_rate > 0
      ),
      0
    );
END;
$$;
