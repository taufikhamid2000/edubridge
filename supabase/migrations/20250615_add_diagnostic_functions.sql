-- Create a function that allows executing SQL directly with admin privileges
-- Note: This function should only be used for diagnostic purposes and 
-- should be removed once the issue is resolved

CREATE OR REPLACE FUNCTION public.execute_direct_sql(query_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the owner (typically postgres)
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Log audit trail of who ran what query
  INSERT INTO public.system_logs (
    event_type, 
    user_id, 
    description,
    metadata
  ) VALUES (
    'DIRECT_SQL_EXECUTION', 
    auth.uid(), 
    'Direct SQL execution for diagnostic purposes',
    jsonb_build_object('query', query_text)
  );

  -- Execute the query and return the results as JSON
  EXECUTE 'SELECT to_jsonb(result) FROM (' || query_text || ') as result' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log failures too
  INSERT INTO public.system_logs (
    event_type, 
    user_id, 
    description,
    metadata
  ) VALUES (
    'DIRECT_SQL_ERROR', 
    auth.uid(), 
    'Error executing diagnostic SQL',
    jsonb_build_object('query', query_text, 'error', SQLERRM)
  );
  
  -- Return the error as JSON
  RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_direct_sql TO authenticated;

-- If you need to add a function to directly fetch the quiz with questions
CREATE OR REPLACE FUNCTION public.direct_fetch_quiz(quiz_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with the privileges of the owner
AS $$
DECLARE
  quiz_json jsonb;
BEGIN
  SELECT json_build_object(
    'quiz', q,
    'questions', (
      SELECT json_agg(qq)
      FROM questions qq
      WHERE qq.quiz_id = q.id
    ),
    'question_count', (
      SELECT COUNT(*)
      FROM questions qq
      WHERE qq.quiz_id = q.id
    )
  )::jsonb INTO quiz_json
  FROM quizzes q
  WHERE q.id = quiz_id_param;
  
  RETURN quiz_json;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.direct_fetch_quiz TO authenticated;
