// This script assigns admin role to a specified user ID
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

// The user ID to make admin
const userId = process.argv[2] || 'df4d2086-e505-4370-a82a-4950ab472e19'; // Default to your UUID if none provided

if (!userId) {
  console.error('Please provide a user ID as an argument');
  console.log('Usage: node set-admin.mjs <userId>');
  process.exit(1);
}

async function setAdminRole() {
  try {
    // Check if user exists in user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError) {
      // User might exist in auth but not have a profile yet
      console.log('Warning: User profile not found, but continuing anyway');
      console.log('User ID:', userId);
    } else {
      console.log('User found with ID:', userId);
    }

    // Check if role already exists for this user
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      console.log(`User already has role: ${existingRole.role}`);

      // Update to admin if not already
      if (existingRole.role !== 'admin') {
        const { data, error } = await supabase
          .from('user_roles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        console.log('✅ User role updated to admin successfully!');
      } else {
        console.log('✅ User is already an admin.');
      }

      return;
    }

    // Insert new admin role
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: 'admin' }]);

    if (error) {
      throw error;
    }

    console.log('✅ Admin role assigned successfully!');
  } catch (error) {
    console.error('Error setting admin role:', error.message);
    process.exit(1);
  }
}

setAdminRole();
