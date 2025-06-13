-- Dashboard Performance Optimization Migration
-- This migration adds indexes and materialized views to improve dashboard performance

-- 1. Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_subjects_category_priority ON subjects(category_priority, order_index);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(id) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_dashboard ON user_profiles(id, last_quiz_date) WHERE school_role = 'student';
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed ON quiz_attempts(user_id, completed, created_at) WHERE completed = true;

-- 2. Create materialized view for dashboard subject statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_subject_stats AS
SELECT 
    s.id,
    s.name,
    s.slug,
    s.description,
    s.icon,
    COALESCE(s.category, 'Uncategorized') as category,
    COALESCE(s.category_priority, 999) as category_priority,
    COALESCE(s.order_index, 999) as order_index,
    COUNT(DISTINCT c.id) as chapter_count,
    COUNT(DISTINCT t.id) as topic_count,
    COUNT(DISTINCT q.id) as quiz_count,
    COUNT(DISTINCT qa.id) as total_attempts,
    COALESCE(AVG(qa.score), 0) as average_score
FROM subjects s
LEFT JOIN chapters c ON s.id = c.subject_id
LEFT JOIN topics t ON c.id = t.chapter_id
LEFT JOIN quizzes q ON t.id = q.topic_id
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.completed = true
GROUP BY s.id, s.name, s.slug, s.description, s.icon, s.category, s.category_priority, s.order_index
ORDER BY category_priority, order_index;

-- 3. Create unique index on the materialized view for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS mv_dashboard_subject_stats_id_idx ON mv_dashboard_subject_stats(id);

-- 4. Create materialized view for user dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_dashboard_stats AS
SELECT 
    up.id as user_id,
    up.display_name,
    up.streak,
    up.xp,
    up.level,
    up.last_quiz_date,
    COUNT(DISTINCT qa.id) as completed_quizzes,
    COALESCE(AVG(qa.score), 0) as average_score,
    COUNT(DISTINCT DATE(qa.created_at)) as active_days,
    COUNT(DISTINCT qa.id) FILTER (WHERE qa.created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_quizzes,
    COALESCE(AVG(qa.score) FILTER (WHERE qa.created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as weekly_average_score
FROM user_profiles up
LEFT JOIN quiz_attempts qa ON up.id = qa.user_id AND qa.completed = true
WHERE up.school_role = 'student' AND up.is_disabled = false
GROUP BY up.id, up.display_name, up.streak, up.xp, up.level, up.last_quiz_date;

-- 5. Create unique index on user stats materialized view
CREATE UNIQUE INDEX IF NOT EXISTS mv_user_dashboard_stats_user_id_idx ON mv_user_dashboard_stats(user_id);

-- 6. Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_subject_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_dashboard_stats;
END;
$$;

-- 7. Create a scheduled refresh function (to be called by cron or triggered)
CREATE OR REPLACE FUNCTION schedule_dashboard_view_refresh()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be called by triggers or scheduled jobs
    -- For now, it's a placeholder for future automation
    PERFORM refresh_dashboard_materialized_views();
    RETURN NULL;
END;
$$;

-- 8. Add comments for documentation
COMMENT ON MATERIALIZED VIEW mv_dashboard_subject_stats IS 'Materialized view containing pre-computed subject statistics for dashboard performance';
COMMENT ON MATERIALIZED VIEW mv_user_dashboard_stats IS 'Materialized view containing pre-computed user statistics for dashboard performance';
COMMENT ON FUNCTION refresh_dashboard_materialized_views() IS 'Function to refresh all dashboard-related materialized views';

-- 9. Grant appropriate permissions (adjust as needed for your RLS setup)
-- These should be accessible to the application role
GRANT SELECT ON mv_dashboard_subject_stats TO authenticated;
GRANT SELECT ON mv_user_dashboard_stats TO authenticated;

-- 10. Initial refresh of materialized views
SELECT refresh_dashboard_materialized_views();
