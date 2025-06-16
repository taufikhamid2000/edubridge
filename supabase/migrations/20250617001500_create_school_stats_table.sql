-- Migration for school_stats table with RLS policies
-- This handles creating the table, indexes, and security policies

-- Create school_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_stats (
  school_id uuid NOT NULL,
  average_score numeric(5, 2) NOT NULL DEFAULT 0,
  participation_rate numeric(5, 2) NOT NULL DEFAULT 0,
  total_quizzes_taken integer NOT NULL DEFAULT 0,
  total_questions_answered integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  last_calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  active_students integer NOT NULL DEFAULT 0,
  CONSTRAINT school_stats_pkey PRIMARY KEY (school_id),
  CONSTRAINT school_stats_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS school_stats_school_id_idx ON public.school_stats USING btree (school_id);
CREATE INDEX IF NOT EXISTS school_stats_average_score_idx ON public.school_stats USING btree (average_score);
CREATE INDEX IF NOT EXISTS school_stats_participation_rate_idx ON public.school_stats USING btree (participation_rate);
CREATE INDEX IF NOT EXISTS school_stats_last_calculated_at_idx ON public.school_stats USING btree (last_calculated_at);
CREATE INDEX IF NOT EXISTS school_stats_active_students_idx ON public.school_stats USING btree (active_students);

-- Add table comment
COMMENT ON TABLE public.school_stats IS 'Aggregate statistics for each school';

-- Enable Row Level Security
ALTER TABLE public.school_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for school admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats' AND policyname = 'School admins can view their school stats'
    ) THEN
        DROP POLICY "School admins can view their school stats" ON public.school_stats;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats' AND policyname = 'Admins can view all school stats'
    ) THEN
        DROP POLICY "Admins can view all school stats" ON public.school_stats;
    END IF;

    -- Drop insert/update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats' AND policyname = 'Service role can manage school stats'
    ) THEN
        DROP POLICY "Service role can manage school stats" ON public.school_stats;
    END IF;

    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_stats' AND policyname = 'No manual deletion of school stats'
    ) THEN
        DROP POLICY "No manual deletion of school stats" ON public.school_stats;
    END IF;
END
$$;

-- Create policies

-- Allow school admins to view their school stats
CREATE POLICY "School admins can view their school stats" 
ON public.school_stats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.schools s ON up.school_id = s.id
    WHERE up.id = auth.uid()
    AND s.id = school_stats.school_id
    AND up.school_role IN ('admin', 'school_admin', 'teacher')
  )
);

-- Allow platform admins to view all school stats
CREATE POLICY "Admins can view all school stats" 
ON public.school_stats 
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

-- Only service role can insert/update stats (for scheduled tasks)
CREATE POLICY "Service role can manage school stats" 
ON public.school_stats 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- No manual deletion of school stats (cascade from school deletion)
CREATE POLICY "No manual deletion of school stats" 
ON public.school_stats 
FOR DELETE 
USING (false);

-- Grant appropriate privileges
GRANT SELECT ON public.school_stats TO authenticated;
GRANT ALL ON public.school_stats TO service_role;

-- Create function to refresh school stats
CREATE OR REPLACE FUNCTION public.refresh_school_stats(p_school_id uuid DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_school record;
BEGIN
  -- Process a specific school if provided, otherwise all schools
  FOR v_school IN
    SELECT id FROM public.schools
    WHERE (p_school_id IS NULL OR id = p_school_id)
  LOOP
    -- Get total active students
    WITH active_students AS (
      SELECT COUNT(DISTINCT up.id) as count
      FROM public.user_profiles up
      WHERE up.school_id = v_school.id
      AND up.is_active = true
      AND up.role = 'student'
    ),
    -- Get quiz statistics
    quiz_stats AS (
      SELECT 
        COUNT(DISTINCT qa.id) as total_quizzes,
        COUNT(qr.id) as total_questions,
        SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers
      FROM public.quiz_attempts qa
      JOIN public.question_responses qr ON qa.id = qr.quiz_attempt_id
      JOIN public.user_profiles up ON qa.user_id = up.id
      WHERE up.school_id = v_school.id
      AND qa.completed_at IS NOT NULL
    )
    -- Update or insert school stats
    INSERT INTO public.school_stats (
      school_id,
      active_students,
      total_quizzes_taken,
      total_questions_answered,
      correct_answers,
      average_score,
      participation_rate,
      last_calculated_at
    )
    SELECT
      v_school.id,
      COALESCE(a.count, 0),
      COALESCE(q.total_quizzes, 0),
      COALESCE(q.total_questions, 0),
      COALESCE(q.correct_answers, 0),
      CASE 
        WHEN COALESCE(q.total_questions, 0) > 0 
        THEN (COALESCE(q.correct_answers, 0)::numeric / q.total_questions::numeric) * 100
        ELSE 0
      END,
      CASE 
        WHEN COALESCE(a.count, 0) > 0 
        THEN LEAST((COALESCE(q.total_quizzes, 0)::numeric / a.count::numeric) * 100, 100)
        ELSE 0
      END,
      now()
    FROM active_students a
    CROSS JOIN quiz_stats q
    ON CONFLICT (school_id)
    DO UPDATE SET
      active_students = EXCLUDED.active_students,
      total_quizzes_taken = EXCLUDED.total_quizzes_taken,
      total_questions_answered = EXCLUDED.total_questions_answered,
      correct_answers = EXCLUDED.correct_answers,
      average_score = EXCLUDED.average_score,
      participation_rate = EXCLUDED.participation_rate,
      last_calculated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update school stats when user profiles change
CREATE OR REPLACE FUNCTION public.handle_school_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule refresh for affected school
  PERFORM public.refresh_school_stats(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.school_id
      ELSE NEW.school_id
    END
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to user_profiles for school assignment changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_refresh_school_stats_on_profile_change'
  ) THEN
    CREATE TRIGGER trigger_refresh_school_stats_on_profile_change
    AFTER INSERT OR UPDATE OF school_id, is_active, role OR DELETE
    ON public.user_profiles
    FOR EACH ROW
    WHEN (
      (TG_OP = 'UPDATE' AND 
       (OLD.school_id IS DISTINCT FROM NEW.school_id OR 
        OLD.is_active IS DISTINCT FROM NEW.is_active OR
        OLD.role IS DISTINCT FROM NEW.role)) OR
      TG_OP = 'INSERT' OR 
      TG_OP = 'DELETE'
    )
    EXECUTE FUNCTION public.handle_school_stats_trigger();
  END IF;
END
$$;
