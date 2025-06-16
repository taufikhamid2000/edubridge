#!/usr/bin/env node

/**
 * Run all Supabase migrations in order
 *
 * This script connects to your Supabase database and
 * runs all migrations in the migrations directory.
 *
 * Usage:
 * 1. Set environment variables for connection (or add .env file)
 * 2. Run: node apply-migrations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Pool } = pg;

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get configuration from environment variables or .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL; // Format: postgres://user:password@host:port/database

// Validate the connection info
if (!SUPABASE_URL && !SUPABASE_DB_URL) {
  console.error(
    'Error: You must provide either SUPABASE_URL or SUPABASE_DB_URL environment variable.'
  );
  process.exit(1);
}

if (SUPABASE_URL && !SUPABASE_SERVICE_KEY) {
  console.error(
    'Error: If using SUPABASE_URL, you must also provide SUPABASE_SERVICE_KEY environment variable.'
  );
  process.exit(1);
}

// Function to get migration files from the migrations directory
async function getMigrationFiles() {
  // Define migrations directory
  const migrationsDir = path.join(__dirname, 'migrations');

  // Read all files in the migrations directory
  const files = await fs.promises.readdir(migrationsDir);

  // Filter for .sql files and sort by name
  const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();

  return sqlFiles.map((file) => ({
    name: file,
    path: path.join(migrationsDir, file),
  }));
}

// Function to execute SQL directly using pg Pool
async function executeSqlWithPool(sql) {
  const pool = new Pool({
    connectionString: SUPABASE_DB_URL,
    // Add additional settings as needed
    ssl: {
      rejectUnauthorized: false, // May need to be set for Supabase connections
    },
  });

  try {
    await pool.query(sql);
  } catch (error) {
    throw error;
  } finally {
    await pool.end();
  }
}

// Function to execute SQL using Supabase client
async function executeSqlWithSupabase(sql) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
  } catch (error) {
    throw error;
  }
}

// Main function to run migrations
async function runMigrations() {
  try {
    const migrations = await getMigrationFiles();
    console.log(`Found ${migrations.length} migration files.`);

    // Execute each migration in order
    for (const migration of migrations) {
      console.log(`Applying migration: ${migration.name}`);

      const sql = await fs.promises.readFile(migration.path, 'utf8');

      // Choose the appropriate execution method based on provided credentials
      if (SUPABASE_DB_URL) {
        await executeSqlWithPool(sql);
      } else {
        await executeSqlWithSupabase(sql);
      }

      console.log(`Successfully applied migration: ${migration.name}`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();
