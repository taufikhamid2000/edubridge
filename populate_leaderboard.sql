-- Sample data for student leaderboard
INSERT INTO public.user_profiles (
  id,
  display_name,
  avatar_url,
  xp,
  level,
  streak,
  daily_xp,
  weekly_xp,
  last_quiz_date,
  school_role,
  is_school_visible
)
SELECT 
  gen_random_uuid(), -- Random UUID for each student
  'Student ' || i, -- Numbered student names
  'https://ui-avatars.com/api/?name=S' || i, -- Generated avatars
  -- Random XP between 1000-10000
  floor(random() * 9000 + 1000)::int,
  -- Level based on XP (simple sqrt formula)
  floor(sqrt(floor(random() * 9000 + 1000)::int / 100))::int + 1,
  -- Random streak 0-30
  floor(random() * 30)::int,
  -- Daily XP 0-500
  floor(random() * 500)::int,
  -- Weekly XP 0-2000 
  floor(random() * 2000)::int,
  -- Last quiz date within past week
  NOW() - (floor(random() * 7) || ' days')::interval,
  'student',
  true
FROM generate_series(1, 100) s(i);

-- Update some students to have quizzes today for daily leaderboard
UPDATE public.user_profiles
SET last_quiz_date = NOW(),
    daily_xp = floor(random() * 500)::int
WHERE id IN (
  SELECT id FROM public.user_profiles
  ORDER BY random()
  LIMIT 20
);

-- Update some students to have high weekly XP
UPDATE public.user_profiles
SET weekly_xp = floor(random() * 2000 + 1000)::int
WHERE id IN (
  SELECT id FROM public.user_profiles
  WHERE last_quiz_date >= NOW() - interval '7 days'
  ORDER BY random()
  LIMIT 30
);

-- Create some top performers
UPDATE public.user_profiles
SET xp = floor(random() * 5000 + 15000)::int,
    level = floor(sqrt(floor(random() * 5000 + 15000)::int / 100))::int + 1,
    streak = floor(random() * 20 + 30)::int,
    daily_xp = floor(random() * 200 + 300)::int,
    weekly_xp = floor(random() * 1000 + 2000)::int
WHERE id IN (
  SELECT id FROM public.user_profiles
  ORDER BY random()
  LIMIT 10
);
