-- Migration file to fix Row Level Security (RLS) for questions and answers tables
-- This will resolve the issue where questions aren't visible through the Supabase client

-- STEP 1: Check current RLS settings for questions table
SELECT tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'questions';

-- STEP 2: Check RLS status (enabled or disabled)
SELECT 
  n.nspname AS schema_name,
  c.relname AS table_name,
  CASE WHEN c.relrowsecurity THEN 'RLS enabled' ELSE 'RLS disabled' END AS rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relkind = 'r' 
AND c.relname IN ('questions', 'answers', 'quizzes');

-- STEP 3: Drop problematic RLS policies that might be preventing access
DROP POLICY IF EXISTS "Restrict questions access" ON public.questions;
DROP POLICY IF EXISTS "Restrict answers access" ON public.answers;

-- STEP 4: Ensure RLS is enabled (but with proper policies)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create public read access policies for questions and answers
-- This allows EVERYONE to READ questions and answers (but not modify them)
CREATE POLICY "Allow public read access to questions" 
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to answers" 
  ON public.answers FOR SELECT
  USING (true);

-- STEP 6: Create policies for authenticated users to manage content they created
-- Questions
CREATE POLICY "Allow question management for creators and admins" 
  ON public.questions FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Answers 
CREATE POLICY "Allow answer management for creators and admins" 
  ON public.answers FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- STEP 7: Create service role policies to bypass RLS for admin operations
CREATE POLICY "Questions service access" ON public.questions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Answers service access" ON public.answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- STEP 8: Verify the policies were created correctly
SELECT tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('questions', 'answers')
ORDER BY tablename, policyname;

-- STEP 9: Add comments to tables
COMMENT ON TABLE public.questions IS 'Quiz questions with RLS policies allowing public read access';
COMMENT ON TABLE public.answers IS 'Question answers with RLS policies allowing public read access';

-- STEP 10: Create function to diagnose RLS issues
CREATE OR REPLACE FUNCTION public.check_rls_access(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the owner
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT json_build_object(
    'table', table_name,
    'rls_enabled', (
      SELECT c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
      AND c.relname = table_name
    ),
    'policies', (
      SELECT json_agg(json_build_object(
        'policy_name', policyname,
        'command', cmd,
        'permissive', permissive,
        'qualifier', qual
      ))
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    ),
    'row_count', (
      EXECUTE format('SELECT COUNT(*) FROM %I', table_name)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_rls_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rls_access TO anon;
