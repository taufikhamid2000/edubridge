'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';

interface MigrationData {
  name: string;
  lastApplied?: string;
  status?: 'pending' | 'applied' | 'failed';
}

export default function AdminMigrationsPage() {
  const [migrations, setMigrations] = useState<MigrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchMigrations();
  }, []);

  async function fetchMigrations() {
    try {
      setLoading(true);

      // Fetch available migrations from our API endpoint
      const response = await fetch('/api/admin/migrations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch migrations');
      }

      // Format migrations data
      const formattedMigrations: MigrationData[] = data.migrations.map(
        (name: string) => ({
          name,
          status: 'pending',
        })
      );

      setMigrations(formattedMigrations);
    } catch (error) {
      logger.error('Error fetching migrations:', error);
      setMessage({
        type: 'error',
        text: 'Failed to fetch available migrations',
      });
    } finally {
      setLoading(false);
    }
  }

  async function applyMigration(migrationName: string) {
    try {
      setApplying(true);
      setMessage(null);

      // Call our API endpoint to apply the migration
      const response = await fetch('/api/admin/migrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          migrationFile: migrationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply migration');
      }

      // Update the local state
      setMigrations(
        migrations.map((m) =>
          m.name === migrationName
            ? { ...m, status: 'applied', lastApplied: new Date().toISOString() }
            : m
        )
      );

      setMessage({
        type: 'success',
        text:
          data.message || `Migration '${migrationName}' applied successfully`,
      });
    } catch (error: unknown) {
      logger.error('Error applying migration:', error);

      // Update the local state
      setMigrations(
        migrations.map((m) =>
          m.name === migrationName ? { ...m, status: 'failed' } : m
        )
      );

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      setMessage({
        type: 'error',
        text: errorMessage || `Failed to apply migration '${migrationName}'`,
      });
    } finally {
      setApplying(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">
              Database Migrations
            </h1>
            <button
              onClick={fetchMigrations}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>{' '}
          {message && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              <p>{message.text}</p>
            </div>
          )}{' '}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Available Migrations
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Apply database migrations from this interface. Use with caution
                as migrations can modify your database structure.
              </p>
            </div>{' '}
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
              </div>
            ) : migrations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No migration files found. Place SQL migration files in the
                migrations directory.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Migration File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Applied
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {migrations.map((migration) => (
                    <tr key={migration.name}>
                      {' '}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {migration.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {migration.status === 'applied' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Applied
                          </span>
                        ) : migration.status === 'failed' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            Failed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {migration.lastApplied
                          ? new Date(migration.lastApplied).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => applyMigration(migration.name)}
                          disabled={applying}
                          className={`text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 ${applying ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {applying ? 'Applying...' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>{' '}
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              Important Notes
            </h2>
            <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-400">
              <li>Always back up your database before applying migrations</li>
              <li>Migrations are executed in the order they are applied</li>
              <li>
                Failed migrations may leave your database in an inconsistent
                state
              </li>
              <li>Test migrations on a development environment first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
