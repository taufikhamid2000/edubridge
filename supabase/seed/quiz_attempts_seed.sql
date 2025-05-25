-- Sample quiz attempts data for development and testing
-- Note: Replace user_id values with actual user IDs from your auth.users table
-- This script assumes you have some quizzes already created

-- Create some sample quiz IDs (normally these would be from your quizzes table)
-- In a production setup, replace these with actual quiz IDs
DO $$
DECLARE
  test_user_id UUID;
  admin_user_id UUID;
  quiz_id1 UUID := uuid_generate_v4();
  quiz_id2 UUID := uuid_generate_v4();
  quiz_id3 UUID := uuid_generate_v4();
  three_days_ago TIMESTAMP WITH TIME ZONE := now() - INTERVAL '3 days';
  two_days_ago TIMESTAMP WITH TIME ZONE := now() - INTERVAL '2 days';
  one_day_ago TIMESTAMP WITH TIME ZONE := now() - INTERVAL '1 day';
BEGIN
  -- Get a test user ID and admin ID
  -- You should replace this with an actual user ID from your database
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- Insert sample quiz attempts
  IF test_user_id IS NOT NULL THEN
    -- Complete quiz with good score
    INSERT INTO public.quiz_attempts 
      (user_id, quiz_id, score, max_score, correct_answers, total_questions, time_spent, completed, created_at)
    VALUES 
      (test_user_id, quiz_id1, 90, 100, 9, 10, 420, true, three_days_ago);

    -- Incomplete quiz
    INSERT INTO public.quiz_attempts 
      (user_id, quiz_id, score, max_score, correct_answers, total_questions, time_spent, completed, created_at)
    VALUES 
      (test_user_id, quiz_id2, 30, 100, 3, 10, 180, false, two_days_ago);

    -- Complete quiz with perfect score
    INSERT INTO public.quiz_attempts 
      (user_id, quiz_id, score, max_score, correct_answers, total_questions, time_spent, completed, created_at)
    VALUES 
      (test_user_id, quiz_id3, 100, 100, 10, 10, 350, true, one_day_ago);

    -- Quiz with multiple attempts
    INSERT INTO public.quiz_attempts 
      (user_id, quiz_id, score, max_score, correct_answers, total_questions, time_spent, completed, created_at)
    VALUES 
      (test_user_id, quiz_id1, 70, 100, 7, 10, 480, true, now());
  END IF;

END $$;
