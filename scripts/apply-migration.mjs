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
    // Get the migration file from command line arguments or default to leaderboard-migration.sql
    const migrationFileName = process.argv[2] || 'leaderboard-migration.sql';

    // Path to our migration file
    const migrationFile = path.join(__dirname, 'migrations', migrationFileName);

    // Check if file exists
    if (!fs.existsSync(migrationFile)) {
      console.error(`Migration file not found: ${migrationFileName}`);
      console.error(
        `Available migrations: ${fs.readdirSync(path.join(__dirname, 'migrations')).join(', ')}`
      );
      process.exit(1);
    }

    // Read the SQL file
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Log what we're about to do
    console.log(`Applying migration: ${migrationFileName}`);

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
