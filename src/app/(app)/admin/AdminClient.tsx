'use client';

import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

interface AdminClientProps {
  // Reserved for future expansion
  className?: string;
}

export default function AdminClient({ className = '' }: AdminClientProps) {
  return (
    <div className={`min-h-screen bg-gray-900 dark:bg-gray-50 ${className}`}>
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">
              Admin Dashboard
            </h1>
            <div>
              <button
                onClick={() => logger.log('Dashboard refresh clicked')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Refresh Data
              </button>
            </div>
          </div>
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
