/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';

export default function MakeAdminTool() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      setStatus({ message: 'Please provide a user ID', error: true });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Direct API call to manually set a user as admin
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: 'admin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set admin role');
      }

      setStatus({ message: 'Success! User is now an admin.', error: false });
    } catch (error) {
      setStatus({
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Make User Admin</h2>

      <p className="mb-4 text-gray-600">
        Use this tool to grant admin privileges to a user. You'll need the
        user's ID from the Supabase dashboard or database.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700"
          >
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g., b6827677-c221-49a5-9758-9665c9d2b4ac"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            The user ID from Supabase (UUID format)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Processing...' : 'Make Admin'}
        </button>
      </form>

      {status && (
        <div
          className={`mt-4 p-3 rounded-md ${status.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {status.message}
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h3 className="text-md font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Get the user ID from the Supabase dashboard or database</li>
          <li>Enter the ID in the field above</li>
          <li>Click "Make Admin" to grant admin privileges</li>
          <li>The user will have admin access on their next login</li>
        </ol>
      </div>
    </div>
  );
}
