-- Update quiz_attempts table to match the application requirements
-- Add missing columns if they don't exist

-- Add max_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='max_score') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN max_score INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add correct_answers column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='correct_answers') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN correct_answers INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add total_questions column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='total_questions') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN total_questions INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='updated_at') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Rename time_taken to time_spent if time_taken exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='quiz_attempts' AND column_name='time_taken') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='time_spent') THEN
        ALTER TABLE public.quiz_attempts RENAME COLUMN time_taken TO time_spent;
    END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quiz_attempts_updated_at ON public.quiz_attempts;
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Display the current schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;
