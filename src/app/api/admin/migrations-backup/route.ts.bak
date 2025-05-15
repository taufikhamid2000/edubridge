// This API endpoint will apply the specified migration
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import { isUserAdmin } from '@/services/adminService';

// Helper function to read migration file
const readMigrationFile = async (fileName: string): Promise<string | null> => {
  try {
    const filePath = path.join(
      process.cwd(),
      'scripts',
      'migrations',
      fileName
    );
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    logger.error('Error reading migration file:', error);
    return null;
  }
};

// List all available migrations
const listAvailableMigrations = async (): Promise<string[]> => {
  try {
    const migrationsDir = path.join(process.cwd(), 'scripts', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      return [];
    }
    return fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'));
  } catch (error) {
    logger.error('Error listing migrations:', error);
    return [];
  }
};

export async function GET() {
  try {
    const migrations = await listAvailableMigrations();
    return NextResponse.json({ migrations });
  } catch (error) {
    logger.error('Error in migration API:', error);
    return NextResponse.json(
      { error: 'Failed to list migrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await isUserAdmin(session.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Administrator privileges required' },
        { status: 403 }
      );
    }

    // Get the migration file name from the request
    const { migrationFile } = await request.json();
    if (!migrationFile) {
      return NextResponse.json(
        { error: 'No migration file specified' },
        { status: 400 }
      );
    }

    // Read the migration file
    const sql = await readMigrationFile(migrationFile);
    if (!sql) {
      return NextResponse.json(
        { error: `Migration file '${migrationFile}' not found` },
        { status: 404 }
      );
    }

    // Apply the migration
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      logger.error('Migration error:', error);
      return NextResponse.json(
        { error: `Failed to apply migration: ${error.message}` },
        { status: 500 }
      );
    }

    // Log the action
    logger.log(
      `Migration '${migrationFile}' applied successfully by ${session.user.id}`
    );

    return NextResponse.json({
      success: true,
      message: `Migration '${migrationFile}' applied successfully`,
    });
  } catch (error) {
    logger.error('Error in migration API:', error);
    return NextResponse.json(
      { error: 'Failed to apply migration' },
      { status: 500 }
    );
  }
}
