-- Create the quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER,  -- Time spent in seconds
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.quiz_attempts IS 'Stores user quiz attempt information';

-- Add RLS policies
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own attempts
CREATE POLICY "Users can update their own quiz attempts"
  ON public.quiz_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for admins to view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_created_at ON public.quiz_attempts(created_at);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
