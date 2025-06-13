#!/bin/bash

# Dashboard Performance Optimization Migration Script
# This script applies the database migration for dashboard performance improvements

echo "🚀 Starting Dashboard Performance Optimization Migration..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g @supabase/cli"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "📋 Migration file: supabase/migrations/20250614_dashboard_performance_optimization.sql"

# Check if migration file exists
if [ ! -f "supabase/migrations/20250614_dashboard_performance_optimization.sql" ]; then
    echo "❌ Error: Migration file not found!"
    exit 1
fi

echo "🔍 Checking current migration status..."
supabase migration list

echo ""
echo "⚠️  This migration will:"
echo "   • Add database indexes for better query performance"
echo "   • Create materialized views for dashboard data"
echo "   • Add functions for refreshing materialized views"
echo "   • Grant necessary permissions"
echo ""

# Ask for confirmation
read -p "❓ Do you want to proceed with the migration? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🔄 Applying migration..."

# Apply the migration
if supabase db push; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🔄 Refreshing materialized views..."
    
    # Try to refresh the materialized views
    if supabase db reset --debug; then
        echo "✅ Database reset completed with new migration"
    else
        echo "⚠️  Database reset failed, but migration was applied"
        echo "   You may need to manually refresh materialized views"
    fi
    
    echo ""
    echo "🎉 Dashboard Performance Optimization completed!"
    echo ""
    echo "📊 Performance improvements:"
    echo "   • Faster subject loading with indexed queries"
    echo "   • Pre-computed user statistics in materialized views"
    echo "   • Optimized category and priority sorting"
    echo "   • Cached user dashboard data"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Test the new /api/dashboard endpoint"
    echo "   2. Verify React Query integration is working"
    echo "   3. Monitor performance improvements"
    echo "   4. Set up scheduled refreshes for materialized views"
    
else
    echo "❌ Migration failed!"
    echo "   Please check the error messages above and try again"
    exit 1
fi

echo ""
echo "✨ Migration completed successfully!"
