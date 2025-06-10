-- Add school visibility column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_school_visible boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.is_school_visible IS 'Controls whether the user''s school affiliation is visible to other users';
