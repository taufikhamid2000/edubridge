-- Enable RLS on tables
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_stats_history ENABLE ROW LEVEL SECURITY;

-- System Logs Policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable insert for all users" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.system_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.system_logs;
DROP POLICY IF EXISTS "Admins can delete logs" ON public.system_logs;

-- 1. Anyone can insert logs (needed for client-side error reporting)
CREATE POLICY "Enable insert for all users" ON public.system_logs
  FOR INSERT TO public
  WITH CHECK (true);

-- 2. Users can read their own logs
CREATE POLICY "Users can view own logs" ON public.system_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Admins can read all logs
CREATE POLICY "Admins can view all logs" ON public.system_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. Only admins can delete logs
CREATE POLICY "Admins can delete logs" ON public.system_logs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- School Stats History Policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.school_stats_history;
DROP POLICY IF EXISTS "Enable admin write access" ON public.school_stats_history;

-- 1. Anyone can read stats history (used for public leaderboard)
CREATE POLICY "Enable read access for all users" ON public.school_stats_history
  FOR SELECT TO public
  USING (true);

-- 2. Only admins can insert/update/delete stats history
CREATE POLICY "Enable admin write access" ON public.school_stats_history
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to automatically populate school_stats_history
CREATE OR REPLACE FUNCTION public.record_school_stats()
RETURNS void AS $$
DECLARE
  schools_total INTEGER;
  students_total INTEGER;
  avg_participation NUMERIC(5,2);
BEGIN
  -- Get total number of schools
  SELECT COUNT(*) INTO schools_total FROM schools;
  
  -- Get total number of students
  SELECT COUNT(*) INTO students_total 
  FROM user_profiles 
  WHERE school_role = 'student' AND is_disabled = false;
  
  -- Calculate average participation
  SELECT COALESCE(AVG(participation_rate), 0) INTO avg_participation 
  FROM school_stats;
  
  -- Insert into history
  INSERT INTO school_stats_history (
    recorded_at,
    schools_count,
    students_count,
    average_participation
  ) VALUES (
    NOW(),
    schools_total,
    students_total,
    avg_participation
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
