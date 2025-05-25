-- Function to test quiz_attempts schema
-- Returns the column information if successful
CREATE OR REPLACE FUNCTION test_quiz_attempts_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  columns_info JSONB;
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts'
  ) THEN
    RAISE EXCEPTION 'Table quiz_attempts does not exist';
  END IF;

  -- Get column information
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      )
    )
  INTO columns_info
  FROM information_schema.columns
  WHERE table_schema = 'public' 
  AND table_name = 'quiz_attempts';

  -- Check required columns
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts'
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Required column user_id is missing';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts'
    AND column_name = 'quiz_id'
  ) THEN
    RAISE EXCEPTION 'Required column quiz_id is missing';
  END IF;

  RETURN columns_info;
END;
$$;
