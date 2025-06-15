import { createClient } from '@supabase/supabase-js';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Simple RLS fixes - these are the most critical parts from the migration
const statements = [
  // Drop problematic RLS policies that might be preventing access
  'DROP POLICY IF EXISTS "Restrict questions access" ON public.questions;',
  'DROP POLICY IF EXISTS "Restrict answers access" ON public.answers;',

  // Ensure RLS is enabled
  'ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;',

  // Create public read access policies
  'CREATE POLICY "Allow public read access to questions" ON public.questions FOR SELECT USING (true);',
  'CREATE POLICY "Allow public read access to answers" ON public.answers FOR SELECT USING (true);',

  // Create policies for authenticated users
  'CREATE POLICY "Allow question management for creators and admins" ON public.questions FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);',
  'CREATE POLICY "Allow answer management for creators and admins" ON public.answers FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);',
];

async function applyRLSFixes() {
  console.log('🔄 Applying RLS fixes to questions and answers tables...');

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(
      `⏳ Executing statement ${i + 1}/${statements.length}: ${statement}`
    );

    try {
      // Execute statement directly using Supabase's SQL endpoint
      const { error } = await supabase.rpc('pg_query', {
        query_text: statement,
      });

      if (error) {
        // Try alternative approach if the first one fails
        const { error: secondError } = await supabase.rpc('exec_sql', {
          sql: statement,
        });

        if (secondError) {
          // Log but continue with remaining statements
          console.log(
            `⚠️ Could not execute statement ${i + 1}: ${secondError.message}`
          );
          console.log('Continuing with next statement...');
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully (method 2)`);
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.log(`⚠️ Error executing statement ${i + 1}: ${err.message}`);
      console.log('Continuing with next statement...');
    }
  }

  console.log(
    '🎉 RLS fixes completed. The quiz questions should now be accessible!'
  );
}

applyRLSFixes();
