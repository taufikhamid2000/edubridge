// This script will help apply database migrations using the Supabase client
import { supabaseAdmin } from '../src/lib/supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Path to our migration file
    const migrationFile = path.join(
      __dirname,
      'migrations',
      'leaderboard-migration.sql'
    );

    // Read the SQL file
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Log what we're about to do
    console.log('Applying migration: leaderboard-migration.sql');

    // Apply the migration using the supabase admin client
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });

    if (error) {
      throw error;
    }

    console.log('✅ Migration successfully applied!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

main();
