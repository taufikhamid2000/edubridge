'use client';

import { ReactNode, useState } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  refreshAction?: () => void;
  isLoading?: boolean;
}

export default function AdminLayout({
  children,
  title,
  refreshAction,
  isLoading = false,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Mobile menu button */}
        <div className="md:hidden p-4 bg-gray-800 dark:bg-white shadow sticky top-0 z-10 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold dark:text-white">{title}</h1>
          <div className="w-6"></div> {/* Empty div for flex spacing */}
        </div>

        {/* Sidebar - responsive */}
        <div
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } md:block md:sticky md:top-0 md:h-screen`}
        >
          <AdminNavigation onCloseMobile={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-8 max-w-full overflow-hidden">
          {/* Header - Desktop view */}
          <div className="hidden md:block mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white mr-4">
                  {title}
                </h1>
                {refreshAction && (
                  <button
                    onClick={refreshAction}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-1 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
