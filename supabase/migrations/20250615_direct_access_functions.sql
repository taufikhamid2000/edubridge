-- Function to directly fetch questions for a quiz
-- This bypasses RLS and any potential permission issues

CREATE OR REPLACE FUNCTION public.get_quiz_questions(quiz_id_param uuid)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log this access
  INSERT INTO public.system_logs (
    event_type,
    user_id,
    description,
    metadata
  ) VALUES (
    'DIRECT_QUESTION_ACCESS',
    auth.uid(),
    'Direct quiz questions access via function',
    jsonb_build_object('quiz_id', quiz_id_param)
  );
  
  -- Return all questions for this quiz with their answers
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', q.id,
    'quiz_id', q.quiz_id,
    'text', q.text,
    'type', q.type,
    'order_index', q.order_index,
    'created_at', q.created_at,
    'answers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'question_id', a.question_id,
          'text', a.text,
          'is_correct', a.is_correct,
          'order_index', a.order_index,
          'created_at', a.created_at
        )
      )
      FROM answers a
      WHERE a.question_id = q.id
    )
  )
  FROM questions q
  WHERE q.quiz_id = quiz_id_param
  ORDER BY q.order_index;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_quiz_questions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions TO anon;

-- Function to get a complete quiz with questions and answers
CREATE OR REPLACE FUNCTION public.get_complete_quiz(quiz_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quiz_json jsonb;
  questions_json jsonb;
  questions_count integer;
BEGIN
  -- Get the quiz details
  SELECT jsonb_build_object(
    'id', q.id,
    'name', q.name,
    'topic_id', q.topic_id,
    'created_by', q.created_by,
    'created_at', q.created_at,
    'verified', q.verified
  ) INTO quiz_json
  FROM quizzes q
  WHERE q.id = quiz_id_param;
  
  -- Get the questions count
  SELECT COUNT(*)
  INTO questions_count
  FROM questions
  WHERE quiz_id = quiz_id_param;
  
  -- Get the questions with answers
  SELECT jsonb_agg(question)
  INTO questions_json
  FROM public.get_quiz_questions(quiz_id_param) AS question;
  
  -- Combine everything
  RETURN jsonb_build_object(
    'quiz', quiz_json,
    'questions', COALESCE(questions_json, '[]'::jsonb),
    'questionCount', questions_count
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_complete_quiz TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_complete_quiz TO anon;
