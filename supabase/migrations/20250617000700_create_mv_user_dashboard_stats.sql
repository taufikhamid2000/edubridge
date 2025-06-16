-- Migration for mv_user_dashboard_stats materialized view
-- This creates a materialized view for user dashboard statistics

-- Drop the materialized view if it already exists (for idempotency)
DROP MATERIALIZED VIEW IF EXISTS public.mv_user_dashboard_stats;

-- Create the materialized view
CREATE MATERIALIZED VIEW public.mv_user_dashboard_stats AS
SELECT
  up.id AS user_id,
  up.display_name,
  up.streak,
  up.xp,
  up.level,
  up.last_quiz_date,
  COUNT(DISTINCT qa.id) AS completed_quizzes,
  COALESCE(AVG(qa.score), 0::numeric) AS average_score,
  COUNT(DISTINCT DATE(qa.created_at)) AS active_days,
  COUNT(DISTINCT qa.id) FILTER (
    WHERE
      qa.created_at >= (CURRENT_DATE - '7 days'::interval)
  ) AS weekly_quizzes,
  COALESCE(
    AVG(qa.score) FILTER (
      WHERE
        qa.created_at >= (CURRENT_DATE - '7 days'::interval)
    ),
    0::numeric
  ) AS weekly_average_score
FROM
  public.user_profiles up
  LEFT JOIN public.quiz_attempts qa ON up.id = qa.user_id
  AND qa.completed = true
WHERE
  up.school_role = 'student'::text
  AND up.is_disabled = false
GROUP BY
  up.id,
  up.display_name,
  up.streak,
  up.xp,
  up.level,
  up.last_quiz_date;

-- Add comment to the materialized view
COMMENT ON MATERIALIZED VIEW public.mv_user_dashboard_stats IS 'Provides aggregated statistics about student users for dashboard display';

-- Create indexes on the materialized view for better performance
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_user_id ON public.mv_user_dashboard_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_level ON public.mv_user_dashboard_stats(level);
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_xp ON public.mv_user_dashboard_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_mv_user_stats_completed_quizzes ON public.mv_user_dashboard_stats(completed_quizzes DESC);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_mv_user_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a comment on the refresh function
COMMENT ON FUNCTION public.refresh_mv_user_dashboard_stats() IS 'Refreshes the user dashboard statistics materialized view';

-- Add RLS policy to ensure users can only access their own stats
ALTER MATERIALIZED VIEW public.mv_user_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DO $$
BEGIN
    -- Drop select policy for users if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mv_user_dashboard_stats' AND policyname = 'Users can view their own stats'
    ) THEN
        DROP POLICY "Users can view their own stats" ON public.mv_user_dashboard_stats;
    END IF;

    -- Drop select policy for admins if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mv_user_dashboard_stats' AND policyname = 'Admins and teachers can view all stats'
    ) THEN
        DROP POLICY "Admins and teachers can view all stats" ON public.mv_user_dashboard_stats;
    END IF;
END
$$;

-- Create policies
CREATE POLICY "Users can view their own stats"
ON public.mv_user_dashboard_stats
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins and teachers can view all stats"
ON public.mv_user_dashboard_stats
FOR SELECT
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
GRANT SELECT ON public.mv_user_dashboard_stats TO authenticated;
GRANT ALL ON public.mv_user_dashboard_stats TO service_role;

-- Create a trigger function to refresh the materialized view when relevant tables change
CREATE OR REPLACE FUNCTION public.refresh_user_stats_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue a refresh of the materialized view
  -- Using pg_notify to avoid blocking the transaction
  PERFORM pg_notify('refresh_mv_user_stats', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_refresh_user_stats_profiles ON public.user_profiles;
DROP TRIGGER IF EXISTS trigger_refresh_user_stats_quiz_attempts ON public.quiz_attempts;

-- Create triggers on relevant tables
CREATE TRIGGER trigger_refresh_user_stats_profiles
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.user_profiles
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_user_stats_on_change();

CREATE TRIGGER trigger_refresh_user_stats_quiz_attempts
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.quiz_attempts
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_user_stats_on_change();

-- Create a scheduled function to refresh the view daily
CREATE OR REPLACE FUNCTION public.scheduled_refresh_user_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
