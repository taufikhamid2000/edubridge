-- Create function to get a random quiz
CREATE OR REPLACE FUNCTION get_random_quiz()
RETURNS TABLE (
  quiz_id uuid,
  topic_id uuid,
  subject_slug text
)
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
as $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as quiz_id,
    t.id as topic_id,
    s.slug as subject_slug
  FROM quizzes q
  INNER JOIN topics t ON q.topic_id = t.id
  INNER JOIN chapters c ON t.chapter_id = c.id
  INNER JOIN subjects s ON c.subject_id = s.id
  ORDER BY random()
  LIMIT 1;
END;
$$;
