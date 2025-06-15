-- Migration to enhance quiz verification functionality
-- This adds additional columns for tracking verification metadata

-- First check if columns exist before trying to add them
DO $$
BEGIN
    -- Add verified_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_name = 'quizzes' 
        AND column_name = 'verified_by'
    ) THEN
        ALTER TABLE public.quizzes ADD COLUMN verified_by UUID NULL;
    END IF;

    -- Add verified_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_name = 'quizzes' 
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE public.quizzes ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;

    -- Add verification_feedback column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_name = 'quizzes' 
        AND column_name = 'verification_feedback'
    ) THEN
        ALTER TABLE public.quizzes ADD COLUMN verification_feedback TEXT NULL;
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'quizzes_verified_by_fkey'
    ) THEN
        ALTER TABLE public.quizzes 
        ADD CONSTRAINT quizzes_verified_by_fkey 
        FOREIGN KEY (verified_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Create an index on verified status for faster queries of pending quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_verified ON public.quizzes (verified);

-- Update existing verified quizzes with verification timestamps if needed
UPDATE public.quizzes 
SET verified_at = created_at
WHERE verified = true AND verified_at IS NULL;
