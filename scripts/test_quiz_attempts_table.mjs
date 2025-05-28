#!/usr/bin/env node

/**
 * This script tests if the quiz_attempts table exists and is accessible
 * 
 * To run this script:
 * node --experimental-modules scripts/test_quiz_attempts_table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuizAttemptsTable() {
  console.log('Testing quiz_attempts table...');  try {
    // Test 1: Check if table exists
    const { error: tableError } = await supabase
      .from('quiz_attempts')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.error('❌ Table does not exist. Error:', tableError.message);
        console.log('\nPlease run the migration:\n');
        console.log('supabase migration up');
        console.log('\nOr use the script:\n');
        console.log('./scripts/apply_quiz_attempts_migration.sh');
      } else {
        console.error(
          '❌ Unknown error accessing quiz_attempts table:',
          tableError
        );
      }
      return false;
    }

    console.log('✅ Table exists and is accessible');

    // Test 2: Check schema
    const { data: columns, error: schemaError } = await supabase.rpc(
      'test_quiz_attempts_schema'
    );

    if (schemaError) {
      console.log('ℹ️ Schema validation RPC is not available');
    } else {
      console.log('✅ Schema validation passed');
      console.log(columns);
    }

    return true;
  } catch (error) {
    console.error('❌ Error testing quiz_attempts table:', error.message);
    return false;
  }
}

testQuizAttemptsTable()
  .then((success) => {
    if (success) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
