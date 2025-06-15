import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationFile =
  'supabase/migrations/20250615001000_fix_questions_and_answers_rls.sql';

async function applyMigration() {
  try {
    console.log('📋 Reading migration file:', migrationFile);

    const migrationPath = path.join(process.cwd(), migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Applying migration...');
    console.log(
      'SQL Preview (first 200 chars):',
      sql.substring(0, 200) + '...'
    );

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(
          `  ⏳ Executing statement ${i + 1}/${statements.length}...`
        ); // Execute SQL statement directly
        const { error } = await supabase.from('_exec_sql').rpc('run_sql', {
          query: statement + ';',
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          console.error('Statement was:', statement);
          throw error;
        } else {
          console.log(`  ✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('🎉 Migration applied successfully!');
    console.log('✨ Dashboard performance optimization is now active');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
