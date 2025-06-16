-- Migration for mv_dashboard_subject_stats materialized view
-- This creates a materialized view for dashboard statistics on subjects

-- Drop the materialized view if it already exists (for idempotency)
DROP MATERIALIZED VIEW IF EXISTS public.mv_dashboard_subject_stats;

-- Create the materialized view
CREATE MATERIALIZED VIEW public.mv_dashboard_subject_stats AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.description,
  s.icon,
  COALESCE(s.category, 'Uncategorized'::text) AS category,
  COALESCE(s.category_priority, 999) AS category_priority,
  COALESCE(s.order_index, 999) AS order_index,
  COUNT(DISTINCT c.id) AS chapter_count,
  COUNT(DISTINCT t.id) AS topic_count,
  COUNT(DISTINCT q.id) AS quiz_count,
  COUNT(DISTINCT qa.id) AS total_attempts,
  COALESCE(AVG(qa.score), 0::numeric) AS average_score
FROM
  public.subjects s
  LEFT JOIN public.chapters c ON s.id = c.subject_id
  LEFT JOIN public.topics t ON c.id = t.chapter_id
  LEFT JOIN public.quizzes q ON t.id = q.topic_id
  LEFT JOIN public.quiz_attempts qa ON q.id = qa.quiz_id
  AND qa.completed = true
GROUP BY
  s.id,
  s.name,
  s.slug,
  s.description,
  s.icon,
  s.category,
  s.category_priority,
  s.order_index
ORDER BY
  (COALESCE(s.category_priority, 999)),
  (COALESCE(s.order_index, 999));

-- Add comment to the materialized view
COMMENT ON MATERIALIZED VIEW public.mv_dashboard_subject_stats IS 'Provides aggregated statistics about subjects for dashboard display';

-- Create index on the materialized view for better performance
CREATE INDEX IF NOT EXISTS idx_mv_subject_stats_id ON public.mv_dashboard_subject_stats(id);
CREATE INDEX IF NOT EXISTS idx_mv_subject_stats_category ON public.mv_dashboard_subject_stats(category);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_mv_dashboard_subject_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_subject_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a comment on the refresh function
COMMENT ON FUNCTION public.refresh_mv_dashboard_subject_stats() IS 'Refreshes the dashboard subject statistics materialized view';

-- Grant appropriate privileges
GRANT SELECT ON public.mv_dashboard_subject_stats TO authenticated;
GRANT SELECT ON public.mv_dashboard_subject_stats TO anon;
GRANT ALL ON public.mv_dashboard_subject_stats TO service_role;

-- Create a trigger function to refresh the materialized view when subjects, chapters, topics, quizzes, or quiz_attempts change
CREATE OR REPLACE FUNCTION public.refresh_subject_stats_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue a refresh of the materialized view
  -- Using pg_notify to avoid blocking the transaction
  PERFORM pg_notify('refresh_mv_subject_stats', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_refresh_subject_stats_subjects ON public.subjects;
DROP TRIGGER IF EXISTS trigger_refresh_subject_stats_chapters ON public.chapters;
DROP TRIGGER IF EXISTS trigger_refresh_subject_stats_topics ON public.topics;
DROP TRIGGER IF EXISTS trigger_refresh_subject_stats_quizzes ON public.quizzes;
DROP TRIGGER IF EXISTS trigger_refresh_subject_stats_quiz_attempts ON public.quiz_attempts;

-- Create triggers on relevant tables
CREATE TRIGGER trigger_refresh_subject_stats_subjects
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.subjects
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_subject_stats_on_change();

CREATE TRIGGER trigger_refresh_subject_stats_chapters
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.chapters
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_subject_stats_on_change();

CREATE TRIGGER trigger_refresh_subject_stats_topics
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.topics
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_subject_stats_on_change();

CREATE TRIGGER trigger_refresh_subject_stats_quizzes
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.quizzes
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_subject_stats_on_change();

CREATE TRIGGER trigger_refresh_subject_stats_quiz_attempts
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.quiz_attempts
FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_subject_stats_on_change();
