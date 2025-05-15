// This script applies the fix for the user_roles table constraints and permissions

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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRoles() {
  try {
    console.log('🔧 Starting user_roles table fix...');

    // Read the SQL file
    const sqlPath = join(__dirname, 'migrations', 'fix-role-enum.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL as a stored procedure
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // Fallback to direct SQL execution if RPC fails
      console.log('RPC failed, trying direct SQL execution...');

      // Split the SQL script into separate statements
      const statements = sql
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.sql(statement);
          if (error) {
            console.error(`Error executing SQL: ${error.message}`);
          }
        }
      }
    }

    // Verify user_roles table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_roles')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('Error checking table structure:', columnsError);
    } else {
      console.log('✅ Table structure confirmed:');
      console.table(columns);
    }

    // Check for admin users
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin');

    if (adminsError) {
      console.error('Error checking admin users:', adminsError);
    } else {
      console.log(`✅ Found ${admins?.length || 0} admin users`);
      if (admins?.length) {
        console.table(admins);
      }
    }

    console.log('✅ Role fix completed!');
  } catch (error) {
    console.error('Error fixing roles:', error.message);
    process.exit(1);
  }
}

fixRoles();
