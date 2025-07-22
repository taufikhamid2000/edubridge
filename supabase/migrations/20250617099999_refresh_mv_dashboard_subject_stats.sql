-- Manual migration to refresh the dashboard subjects materialized view
-- Run this migration after adding or updating subjects, chapters, topics, quizzes, or quiz attempts
-- This ensures the dashboard displays up-to-date subject statistics

REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_dashboard_subject_stats; 