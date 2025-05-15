// This script verifies that the admin role checks are working correctly

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Try to load from .env.local first (development), fallback to .env (production)
let envFile = join(rootDir, '.env.local');
if (!fs.existsSync(envFile)) {
  envFile = join(rootDir, '.env');
}

dotenv.config({ path: envFile });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service role
const adminClient = createClient(supabaseUrl, serviceKey);

// The user ID to check (default or from command line)
const userId = process.argv[2] || 'df4d2086-e505-4370-a82a-4950ab472e19';

async function verifyAdminRoles() {
  try {
    console.log('🔍 Verifying admin roles functionality...');

    // 1. Check table structure and constraint
    console.log('\n1. Checking user_roles table structure:');
    const { data: columns, error: columnsError } = await adminClient
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_roles')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
    } else {
      console.table(columns);
    }

    // 2. Check constraint on role column
    console.log('\n2. Checking role column constraint:');
    const { data: constraints, error: constraintsError } =
      await adminClient.rpc('get_constraint_def', {
        table_name: 'user_roles',
        constraint_name: 'user_roles_role_check',
      });

    if (constraintsError) {
      console.error('Error checking constraint:', constraintsError);
    } else {
      console.log(constraints);
    }

    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies:');
    const { data: policies, error: policiesError } = await adminClient.rpc(
      'get_policies',
      { table_name: 'user_roles' }
    );

    if (policiesError) {
      console.error('Error checking RLS policies:', policiesError);
    } else {
      console.table(policies);
    }

    // 4. Check specific user role
    console.log(`\n4. Checking role for user ${userId}:`);
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
    } else {
      console.log(`Role: ${roleData?.role}`);

      // Test if this role would pass the admin check in the app
      const roleValue = (roleData?.role || '').toLowerCase();
      const wouldPassCheck =
        roleValue === 'admin' || roleValue.includes('admin');
      console.log(
        `Would pass admin check in app: ${wouldPassCheck ? 'YES ✅' : 'NO ❌'}`
      );
    }

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

// Define the RPC functions for Supabase if they don't exist
async function setupRPCFunctions() {
  try {
    // Create function to get constraint definition
    const constraintFunc = `
      CREATE OR REPLACE FUNCTION get_constraint_def(table_name text, constraint_name text)
      RETURNS text AS $$
      BEGIN
        RETURN (
          SELECT pg_get_constraintdef(oid) 
          FROM pg_constraint
          WHERE conrelid = (table_name::regclass)::oid 
          AND conname = constraint_name
        );
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Create function to get policies
    const policiesFunc = `
      CREATE OR REPLACE FUNCTION get_policies(table_name text)
      RETURNS TABLE(
        policyname text,
        permissive text,
        cmd text,
        qual text
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT p.policyname, 
               CASE WHEN p.permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
               p.cmd::text,
               pg_get_expr(p.qual, p.tableid) AS qual
        FROM pg_policies p
        WHERE p.tablename = table_name
        AND p.schemaname = 'public';
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Create exec_sql function for running SQL statements
    const execSqlFunc = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Execute the function creation statements
    await adminClient.sql(constraintFunc);
    await adminClient.sql(policiesFunc);
    await adminClient.sql(execSqlFunc);

    console.log('Helper functions created for verification');
  } catch (error) {
    console.error('Error creating helper functions:', error);
    // Continue anyway, they might already exist
  }
}

// Run the verification
async function run() {
  try {
    await setupRPCFunctions();
    await verifyAdminRoles();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
