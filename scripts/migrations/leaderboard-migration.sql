-- SQL migration script for leaderboard feature
-- This would be executed in your Supabase project SQL editor

-- Create user_profiles table in public schema to extend auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  daily_xp INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  last_quiz_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better leaderboard query performance
CREATE INDEX IF NOT EXISTS user_profiles_xp_idx ON public.user_profiles (xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_daily_xp_idx ON public.user_profiles (daily_xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_weekly_xp_idx ON public.user_profiles (weekly_xp DESC);
CREATE INDEX IF NOT EXISTS user_profiles_last_quiz_date_idx ON public.user_profiles (last_quiz_date DESC);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- URL or emoji code
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INTEGER, -- For partial achievements
  max_progress INTEGER, -- For partial achievements
  
  -- Add any additional fields needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups of user achievements
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements (user_id);

-- Add trigger to auto-create user_profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for achievements
CREATE POLICY "Users can view all achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can update own achievements"
  ON public.achievements FOR UPDATE
  USING (auth.uid() = user_id);
  
-- Function to create sample leaderboard data (for development only)
-- This will help test the leaderboard before having real users
CREATE OR REPLACE FUNCTION public.create_sample_leaderboard_data(num_users integer DEFAULT 20) 
RETURNS void AS $$
DECLARE
  i integer;
  user_id uuid;
BEGIN
  FOR i IN 1..num_users LOOP
    -- Create a sample user profile
    INSERT INTO public.user_profiles (
      id, 
      display_name, 
      xp, 
      level, 
      streak, 
      daily_xp,
      weekly_xp,
      last_quiz_date
    ) VALUES (
      gen_random_uuid(), -- Random UUID
      'User ' || i, -- User name
      floor(random() * 5000)::integer, -- Random XP between 0-5000
      floor(random() * 10 + 1)::integer, -- Random level between 1-10
      floor(random() * 30)::integer, -- Random streak between 0-30
      floor(random() * 200)::integer, -- Random daily XP
      floor(random() * 1000)::integer, -- Random weekly XP
      NOW() - (floor(random() * 10) || ' days')::interval -- Recent activity
    )
    RETURNING id INTO user_id;
    
    -- Add some achievements for this user
    INSERT INTO public.achievements (
      user_id,
      achievement_type,
      title,
      description,
      icon,
      earned_at
    ) VALUES (
      user_id,
      'streak',
      'Consistent Learner',
      'Maintained a streak of 5 days',
      '🔥',
      NOW() - (floor(random() * 20) || ' days')::interval
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create sample data (comment this out in production)
-- The number passed is how many sample users to create
SELECT public.create_sample_leaderboard_data(20);
