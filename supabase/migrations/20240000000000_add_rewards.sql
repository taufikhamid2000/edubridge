-- Create reward claims table
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add participation_rate to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS participation_rate NUMERIC CHECK (participation_rate >= 0 AND participation_rate <= 100);
