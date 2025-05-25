#!/bin/bash

# Script to apply the quiz_attempts database migration to Supabase
# This can be run with: ./scripts/apply_quiz_attempts_migration.sh

echo "Applying quiz_attempts table migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Apply migration using Supabase CLI
echo "Applying migration..."
supabase migration up

# Alternative: Run SQL directly against Supabase
# echo "Applying SQL directly..."
# cat supabase/migrations/20230615000000_create_quiz_attempts.sql | supabase db query

# Verify that the table was created
echo "Verifying table creation..."
supabase db query "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_attempts');"

# Run the test script to verify the table and schema
echo "Running validation tests..."
npm run db:test

echo "Migration complete!"
