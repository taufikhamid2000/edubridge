import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Immediate fix: disable RLS temporarily to see if that resolves the issue
async function emergencyFixRls() {
  try {
    console.log('🛠️ Applying emergency RLS fix to allow quiz submissions...');
    // Execute SQL statement to disable RLS temporarily
    const { error } = await supabase.rpc('pg_query', {
      query: `
        -- Disable RLS temporarily to test if that's the issue
        ALTER TABLE public.school_stats_history DISABLE ROW LEVEL SECURITY;
      `,
    });

    if (error) {
      console.error('❌ Error applying emergency fix:', error);
      return;
    }

    console.log('✅ Emergency fix applied successfully!');
    console.log(
      'Note: This is a temporary solution. Proper RLS should be configured once the issue is resolved.'
    );
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

emergencyFixRls();
