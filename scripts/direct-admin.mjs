// Direct admin insertion script
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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Your user ID
const userId = 'df4d2086-e505-4370-a82a-4950ab472e19';

// Initialize Supabase with service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Directly insert or update the admin role
async function makeAdmin() {
  try {
    console.log(`Starting admin role setup for user: ${userId}`);

    // Option 1: Direct Database Insert with RLS bypass
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin',
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      throw error;
    }

    console.log('✅ Admin role assigned successfully!');

    // Verify the insertion
    const { data, error: verifyError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('⚠️ Verification failed:', verifyError.message);
    } else {
      console.log(`✓ Verified role in database: ${data.role}`);
    }
  } catch (error) {
    console.error('Error setting admin role:', error.message);
    process.exit(1);
  }
}

makeAdmin();
