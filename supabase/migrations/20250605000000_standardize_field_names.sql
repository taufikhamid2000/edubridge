-- Migration to standardize field naming across tables
-- Rename 'title' to 'name' in the chapters table

-- First add a new column
ALTER TABLE chapters ADD COLUMN name text;

-- Copy data from title to name
UPDATE chapters SET name = title;

-- Make the name column not null if title was not null
ALTER TABLE chapters ALTER COLUMN name SET NOT NULL;

-- Remove the title column
ALTER TABLE chapters DROP COLUMN title;

-- Update any views or functions that might be using title
-- (You may need to add specific view/function updates here based on your schema)

-- Add a comment explaining the standardization
COMMENT ON TABLE chapters IS 'Educational chapters with standardized naming conventions';
COMMENT ON COLUMN chapters.name IS 'Primary name/identifier for the chapter (previously called title)';
