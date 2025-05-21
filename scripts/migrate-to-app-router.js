#!/usr/bin/env node

/**
 * This script helps migrate from Pages Router to App Router
 * It creates backups of Pages Router files before deleting them
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Configuration
const PAGES_DIR = path.join(__dirname, '..', 'src', 'pages');
const BACKUP_DIR = path.join(__dirname, '..', 'src', '_pages_backup');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Function to recursively copy a directory
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Backed up: ${src} -> ${dest}`);
  }
}

// Function to move from pages router to app router
function migrateToAppRouter() {
  try {
    // Create backup of pages directory
    copyRecursiveSync(PAGES_DIR, BACKUP_DIR);
    console.log('Backup completed successfully!');

    // We'll use the Git staging to find any uncommitted changes
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking git status: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Git status stderr: ${stderr}`);
        return;
      }

      // If there are uncommitted changes, warn the user
      if (stdout.trim()) {
        console.warn(
          '\n⚠️ WARNING: You have uncommitted changes. Please commit your changes before continuing.\n'
        );
        process.exit(1);
      }

      console.log(
        '\n✅ No uncommitted changes. Proceeding with migration...\n'
      );

      // Remove pages directory
      console.log('Removing Pages Router files...');
      fs.rmSync(PAGES_DIR, { recursive: true, force: true });
      console.log('Pages Router files removed.');

      console.log('\n🎉 Migration completed successfully!');
      console.log(
        `\nBackup of the Pages Router files is available at: ${BACKUP_DIR}`
      );
      console.log('\nNext steps:');
      console.log(
        '1. Run your application to verify everything works as expected'
      );
      console.log(
        '2. Update your next.config.js file to remove any Pages Router specific configuration'
      );
      console.log(
        '3. Delete the backup directory when you are confident everything works'
      );
    });
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration function
migrateToAppRouter();
