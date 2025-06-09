-- Create function to get a random topic
CREATE OR REPLACE FUNCTION get_random_topic()
RETURNS TABLE (
  id uuid,
  subject_slug text
)
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
as $$
BEGIN  RETURN QUERY
  SELECT 
    t.id,
    s.slug as subject_slug
  FROM topics t
  INNER JOIN chapters c ON t.chapter_id = c.id AND c.id IS NOT NULL
  INNER JOIN subjects s ON c.subject_id = s.id AND s.id IS NOT NULL AND s.slug IS NOT NULL
  ORDER BY random()
  LIMIT 1;
END;
$$;
