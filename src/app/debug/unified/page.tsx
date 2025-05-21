/**
 * EduBridge Admin Debug Console
 *
 * This unified debug console helps diagnose and fix common issues with
 * admin authentication, environment variables, and Google OAuth integration.
 * It combines all debugging functionality into a single interface with tabs for:
 * - Overview: Quick status and issue detection
 * - Authentication: Session and cookie management
 * - Environment: Environment variable validation
 * - Google Auth: Fixes for Google OAuth admin issues
 * - Admin Tools: Manual admin role assignment
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types to help with TypeScript
interface AuthStatus {
  status: string;
  user?: {
    id: string;
    email: string;
    role?: string;
    identities?: Array<{ provider: string }>;
  };
  sessionInfo?: {
    expiresAt: string;
  };
  message?: string;
  timestamp?: string;
}

interface EnvironmentInfo {
  serverTime: string;
  environment: string;
  isServer: boolean;
  credentials: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasServiceKey: boolean;
    serviceKeyLength: number;
  };
  nodeVersion: string;
}

interface AdminKeyTestResult {
  success?: boolean;
  message?: string;
  error?: string;
  hint?: string;
  fixNeeded?: string;
  testing?: boolean;
  keyLength?: number;
  testQuerySuccessful?: boolean;
  recordCount?: number;
}

interface FixResult {
  success: boolean;
  message: string;
  error?: string;
}

interface GoogleAuthResult {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export default function UnifiedDebugConsole() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  const [adminKeyTest, setAdminKeyTest] = useState<AdminKeyTestResult | null>(
    null
  );
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [googleAuthResult, setGoogleAuthResult] =
    useState<GoogleAuthResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  // Load initial data
  useEffect(() => {
    Promise.all([fetchAuthStatus(), fetchEnvironmentInfo()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Fetch auth status
  async function fetchAuthStatus() {
    try {
      const response = await fetch('/api/debug/check-session');
      const data = await response.json();
      setAuthStatus(data);
      return data;
    } catch (err) {
      console.error('Error fetching auth status:', err);
      setError(
        `Auth check failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Fetch environment info
  async function fetchEnvironmentInfo() {
    try {
      const response = await fetch('/api/debug/env-check');
      const data = await response.json();
      setEnvInfo(data);
      return data;
    } catch (err) {
      console.error('Error fetching environment info:', err);
      setError(
        `Environment check failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Test the admin key
  async function testAdminKey() {
    try {
      setAdminKeyTest({
        testing: true,
        success: false,
        message: 'Testing admin key...',
      });
      const response = await fetch('/api/debug/verify-admin-key');
      const data = await response.json();
      setAdminKeyTest(data);
    } catch (err) {
      console.error('Error testing admin key:', err);
      setAdminKeyTest({
        success: false,
        message: 'Error testing admin key',
        error: String(err),
      });
    }
  }

  // Fix cookie issues
  async function fixCookieIssue() {
    try {
      setIsFixing(true);
      setFixResult(null);

      // Get the Supabase client
      const { createClientComponentClient } = await import(
        '@supabase/auth-helpers-nextjs'
      );
      const supabase = createClientComponentClient();

      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        setFixResult({
          success: false,
          message: `Error refreshing session: ${error.message}`,
        });
        return;
      }

      // Send the refresh token to the server to sync cookies
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: data.session?.refresh_token,
        }),
      });

      if (response.ok) {
        setFixResult({
          success: true,
          message: 'Session refreshed successfully!',
        });
        // Re-check auth status after fix
        await fetchAuthStatus();
      } else {
        const errorData = await response.json();
        setFixResult({
          success: false,
          message: errorData.error || 'Failed to refresh session',
        });
      }
    } catch (err) {
      console.error('Error fixing cookies:', err);
      setFixResult({
        success: false,
        message: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsFixing(false);
    }
  }

  // Run Google Auth fix
  async function runGoogleAuthFix() {
    try {
      setIsFixing(true);
      setGoogleAuthResult(null);

      // Call the Google Auth fix endpoint
      const response = await fetch('/api/debug/google-auth-fix');
      const data = await response.json();

      setGoogleAuthResult(data);

      if (data.success) {
        // Re-check auth status after fix
        await fetchAuthStatus();
      }
    } catch (err) {
      console.error('Error running Google Auth fix:', err);
      setGoogleAuthResult({
        success: false,
        message: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsFixing(false);
    }
  }

  // Check if this is a Google Auth user
  const isGoogleAuth = authStatus?.user?.identities?.some(
    (identity) => identity.provider === 'google'
  );

  // Need cookie fix?
  const needsCookieFix =
    authStatus?.status === 'Not logged in' &&
    typeof window !== 'undefined' &&
    localStorage.getItem('edubridge-auth-storage-key');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">EduBridge Admin Debug Console</h1>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`py-3 px-6 ${activeTab === 'auth' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Authentication
        </button>
        <button
          onClick={() => setActiveTab('environment')}
          className={`py-3 px-6 ${activeTab === 'environment' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Environment
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={`py-3 px-6 ${activeTab === 'google' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Google Auth
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`py-3 px-6 ${activeTab === 'admin' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
        >
          Admin Tools
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && !isLoading && (
        <div className="space-y-6">
          {/* Quick Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-6 rounded-lg shadow-md ${authStatus?.status === 'Logged in' ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <h2 className="text-lg font-semibold mb-2">Authentication</h2>
              <p
                className={
                  authStatus?.status === 'Logged in'
                    ? 'text-green-600 font-medium'
                    : 'text-red-600 font-medium'
                }
              >
                {authStatus?.status === 'Logged in'
                  ? '✓ Logged In'
                  : '✗ Not Logged In'}
              </p>
              {authStatus?.status === 'Logged in' && authStatus.user?.role && (
                <p className="mt-1">
                  Role:{' '}
                  <span className="font-medium">{authStatus.user.role}</span>
                </p>
              )}
            </div>

            <div
              className={`p-6 rounded-lg shadow-md ${envInfo?.credentials.hasServiceKey ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <h2 className="text-lg font-semibold mb-2">Service Role Key</h2>
              <p
                className={
                  envInfo?.credentials.hasServiceKey
                    ? 'text-green-600 font-medium'
                    : 'text-red-600 font-medium'
                }
              >
                {envInfo?.credentials.hasServiceKey
                  ? '✓ Available'
                  : '✗ Missing'}
              </p>
              {envInfo?.credentials.hasServiceKey && (
                <p className="mt-1">
                  Length: {envInfo.credentials.serviceKeyLength}
                </p>
              )}
            </div>

            <div className="p-6 rounded-lg shadow-md bg-blue-50">
              <h2 className="text-lg font-semibold mb-2">Environment</h2>
              <p>{envInfo?.environment || 'Unknown'}</p>
              <p className="mt-1">Node: {envInfo?.nodeVersion || 'Unknown'}</p>
            </div>
          </div>

          {/* Issues and Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Issues Detected</h2>

            <div className="space-y-4">
              {!envInfo?.credentials.hasServiceKey && (
                <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="font-semibold text-yellow-800">
                    ❗ Missing Service Role Key
                  </p>
                  <p className="mt-1">
                    Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file and
                    restart the server
                  </p>
                  <button
                    onClick={() => setActiveTab('environment')}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    See details →
                  </button>
                </div>
              )}

              {needsCookieFix && (
                <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="font-semibold text-yellow-800">
                    ❗ Cookie Synchronization Issue
                  </p>
                  <p className="mt-1">
                    Client-server cookie synchronization problem detected.
                  </p>
                  <button
                    onClick={() => setActiveTab('auth')}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Fix cookies →
                  </button>
                </div>
              )}

              {isGoogleAuth && !authStatus?.user?.role && (
                <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="font-semibold text-yellow-800">
                    ❗ Google Auth Role Issue
                  </p>
                  <p className="mt-1">
                    You&apos;re using Google authentication but don&apos;t have
                    an admin role.
                  </p>
                  <button
                    onClick={() => setActiveTab('google')}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Fix Google Auth →
                  </button>
                </div>
              )}

              {authStatus?.status === 'Logged in' &&
                (!authStatus.user?.role ||
                  authStatus.user.role !== 'admin') && (
                  <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                    <p className="font-semibold text-yellow-800">
                      ❗ Missing Admin Role
                    </p>
                    <p className="mt-1">
                      You&apos;re logged in but don&apos;t have admin
                      privileges.
                    </p>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Grant admin role →
                    </button>
                  </div>
                )}

              {authStatus?.status !== 'Logged in' && (
                <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="font-semibold text-yellow-800">
                    ❗ Not Logged In
                  </p>
                  <p className="mt-1">
                    You need to log in before you can access admin features.
                  </p>
                  <Link
                    href="/auth/login"
                    className="mt-2 inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    Log In
                  </Link>
                </div>
              )}

              {/* No issues detected */}
              {envInfo?.credentials.hasServiceKey &&
                authStatus?.status === 'Logged in' &&
                authStatus.user?.role === 'admin' &&
                !needsCookieFix && (
                  <div className="p-4 bg-green-50 rounded border-l-4 border-green-500">
                    <p className="font-semibold text-green-800">
                      ✓ No Issues Detected
                    </p>
                    <p className="mt-1">
                      Everything appears to be configured correctly!
                    </p>
                    <Link
                      href="/admin/users"
                      className="mt-2 inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    >
                      Go to Admin Panel
                    </Link>
                  </div>
                )}
            </div>
          </div>

          {/* Steps to Fix */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Steps to Fix Admin Access
            </h2>

            <ol className="list-decimal list-inside space-y-3">
              <li
                className={`p-2 ${!envInfo?.credentials.hasServiceKey ? 'bg-yellow-50' : ''}`}
              >
                <span className="font-medium">Set the Service Role Key</span>
                <p className="ml-6 text-gray-600 mt-1">
                  Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to your{' '}
                  <code>.env.local</code> file and restart
                </p>
              </li>

              <li
                className={`p-2 ${authStatus?.status !== 'Logged in' ? 'bg-yellow-50' : ''}`}
              >
                <span className="font-medium">Log In</span>
                <p className="ml-6 text-gray-600 mt-1">
                  Make sure you&apos;re logged in to access admin features
                </p>
              </li>

              <li className={`p-2 ${needsCookieFix ? 'bg-yellow-50' : ''}`}>
                <span className="font-medium">Fix Cookie Synchronization</span>
                <p className="ml-6 text-gray-600 mt-1">
                  If you&apos;re logged in but the server doesn&apos;t recognize
                  it, fix cookie synchronization
                </p>
              </li>

              <li
                className={`p-2 ${isGoogleAuth && !authStatus?.user?.role ? 'bg-yellow-50' : ''}`}
              >
                <span className="font-medium">Apply Google Auth Fix</span>
                <p className="ml-6 text-gray-600 mt-1">
                  If you&apos;re using Google Auth, apply the special Google
                  Auth fix
                </p>
              </li>

              <li
                className={`p-2 ${authStatus?.status === 'Logged in' && (!authStatus.user?.role || authStatus.user.role !== 'admin') ? 'bg-yellow-50' : ''}`}
              >
                <span className="font-medium">Grant Admin Privileges</span>
                <p className="ml-6 text-gray-600 mt-1">
                  Use the manual admin role granting tool if needed
                </p>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === 'auth' && !isLoading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Authentication Status
            </h2>

            {authStatus ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded ${authStatus.status === 'Logged in' ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  <p className="font-bold">
                    {authStatus.status === 'Logged in'
                      ? '✓ LOGGED IN'
                      : '✗ NOT LOGGED IN'}
                  </p>
                </div>

                {authStatus.status === 'Logged in' && authStatus.user && (
                  <div className="space-y-2">
                    <p>
                      <strong>User ID:</strong> {authStatus.user.id}
                    </p>
                    <p>
                      <strong>Email:</strong> {authStatus.user.email}
                    </p>
                    <p>
                      <strong>Role:</strong>{' '}
                      {authStatus.user.role ? (
                        <span
                          className={
                            authStatus.user.role === 'admin'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          {authStatus.user.role}
                        </span>
                      ) : (
                        <span className="text-red-600">No role assigned</span>
                      )}
                    </p>
                    {authStatus.sessionInfo && (
                      <p>
                        <strong>Expires:</strong>{' '}
                        {authStatus.sessionInfo.expiresAt}
                      </p>
                    )}
                  </div>
                )}

                {authStatus.status !== 'Logged in' && (
                  <div className="mt-4">
                    <p>
                      <strong>Message:</strong>{' '}
                      {authStatus.message || 'No session detected'}
                    </p>
                    <p>
                      <strong>Timestamp:</strong> {authStatus.timestamp}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>Could not fetch authentication status.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Cookie Analysis & Fixes
            </h2>

            {needsCookieFix ? (
              <div className="space-y-4">
                <div className="bg-yellow-100 p-4 rounded">
                  <p className="font-bold text-yellow-800">
                    ⚠️ Cookie Synchronization Issue Detected
                  </p>
                  <p className="mt-2">
                    You appear to have a client-side session but the server
                    can&apos;t detect it. This is typically caused by cookie
                    synchronization issues.
                  </p>
                </div>

                <button
                  onClick={fixCookieIssue}
                  disabled={isFixing}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isFixing ? 'Fixing...' : 'Fix Session Cookies'}
                </button>

                {fixResult && (
                  <div
                    className={`p-4 rounded ${fixResult.success ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <p
                      className={
                        fixResult.success
                          ? 'text-green-800 font-bold'
                          : 'text-red-800 font-bold'
                      }
                    >
                      {fixResult.success ? '✓ ' : '✗ '}
                      {fixResult.message}
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="font-semibold">
                    If the automatic fix doesn&apos;t work:
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Log out completely using the button below</li>
                    <li>Clear your browser cookies for this site</li>
                    <li>Log back in</li>
                  </ol>

                  <Link
                    href="/auth/logout"
                    className="inline-block mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Log Out
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded">
                <p>
                  No cookie issues detected, or client and server auth are both
                  in the same state.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === 'environment' && !isLoading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Environment Diagnosis
            </h2>

            {envInfo ? (
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Basic Environment</h3>
                  <p>
                    <span className="font-medium">Node Environment:</span>{' '}
                    {envInfo.environment}
                  </p>
                  <p>
                    <span className="font-medium">Node Version:</span>{' '}
                    {envInfo.nodeVersion}
                  </p>
                  <p>
                    <span className="font-medium">Server Time:</span>{' '}
                    {envInfo.serverTime}
                  </p>
                  <p>
                    <span className="font-medium">Execution Context:</span>{' '}
                    {envInfo.isServer ? 'Server' : 'Client'}
                  </p>
                </div>

                <div
                  className={`p-4 rounded ${envInfo.credentials.hasServiceKey ? 'bg-green-50' : 'bg-yellow-50'}`}
                >
                  <h3 className="font-semibold mb-2">Supabase Configuration</h3>
                  <p>
                    <span className="font-medium">Supabase URL:</span>
                    {envInfo.credentials.hasUrl ? (
                      <span className="text-green-600 ml-1">✓ Available</span>
                    ) : (
                      <span className="text-red-600 ml-1">✗ Missing</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Anon Key:</span>
                    {envInfo.credentials.hasAnonKey ? (
                      <span className="text-green-600 ml-1">✓ Available</span>
                    ) : (
                      <span className="text-red-600 ml-1">✗ Missing</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Service Role Key:</span>
                    {envInfo.credentials.hasServiceKey ? (
                      <span className="text-green-600 ml-1">
                        ✓ Available (length:{' '}
                        {envInfo.credentials.serviceKeyLength})
                      </span>
                    ) : (
                      <span className="text-red-600 ml-1">✗ Missing</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p>Could not fetch environment information.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Admin Key Verification
            </h2>

            <div className="space-y-4">
              <button
                onClick={testAdminKey}
                disabled={isFixing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isFixing ? 'Testing...' : 'Test Admin Key'}
              </button>

              {adminKeyTest && !adminKeyTest.testing && (
                <div
                  className={`p-4 rounded ${adminKeyTest.success ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  <h3 className="font-semibold mb-2">Admin Key Test</h3>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {adminKeyTest.message}
                  </p>
                  {adminKeyTest.success ? (
                    <p className="text-green-700">
                      ✓ Your admin key is working properly!
                    </p>
                  ) : (
                    <div className="text-red-700">
                      <p>✗ There was a problem with your admin key.</p>
                      {adminKeyTest.error && <p>Error: {adminKeyTest.error}</p>}
                      {adminKeyTest.hint && <p>Hint: {adminKeyTest.hint}</p>}
                      {adminKeyTest.fixNeeded && (
                        <p>Fix needed: {adminKeyTest.fixNeeded}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {adminKeyTest && adminKeyTest.testing && (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                  <span>Testing admin key...</span>
                </div>
              )}

              {!envInfo?.credentials.hasServiceKey && (
                <div className="p-4 bg-yellow-50 rounded mt-4">
                  <h3 className="font-semibold text-yellow-800">
                    Service Role Key Missing
                  </h3>
                  <p className="mb-2">
                    You need to add the SUPABASE_SERVICE_ROLE_KEY to your
                    environment variables.
                  </p>

                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      Get your service role key from the Supabase dashboard
                      (Project Settings → API)
                    </li>
                    <li>
                      Create or edit the <code>.env.local</code> file in your
                      project root
                    </li>
                    <li>
                      Add this line:{' '}
                      <code>SUPABASE_SERVICE_ROLE_KEY=your-key-here</code>
                    </li>
                    <li>
                      <strong>Restart your Next.js server completely</strong>
                    </li>
                  </ol>
                </div>
              )}

              {envInfo?.credentials.hasServiceKey &&
                envInfo.credentials.serviceKeyLength < 20 && (
                  <div className="p-4 bg-yellow-50 rounded mt-4">
                    <h3 className="font-semibold text-yellow-800">
                      Service Role Key Looks Invalid
                    </h3>
                    <p>
                      Your key appears to be too short (length:{' '}
                      {envInfo.credentials.serviceKeyLength}).
                    </p>
                    <p>
                      Please double-check that you&apos;ve copied the entire key
                      from Supabase.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Google Auth Tab */}
      {activeTab === 'google' && !isLoading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Google Auth Status</h2>

            {authStatus ? (
              <div className="space-y-4">
                <div
                  className={
                    isGoogleAuth
                      ? 'bg-green-100 p-4 rounded'
                      : 'bg-gray-100 p-4 rounded'
                  }
                >
                  <p className="font-semibold">
                    {isGoogleAuth
                      ? '✓ Google Authentication Detected'
                      : '⚠️ Not using Google Authentication'}
                  </p>
                  <p className="mt-2">
                    {isGoogleAuth
                      ? 'You are using Google OAuth for authentication.'
                      : 'This tab is most useful for users with Google authentication.'}
                  </p>
                </div>

                {authStatus.status === 'Logged in' && authStatus.user && (
                  <div className="space-y-2">
                    <p>
                      <strong>User ID:</strong> {authStatus.user.id}
                    </p>
                    <p>
                      <strong>Email:</strong> {authStatus.user.email}
                    </p>
                    <p>
                      <strong>Role:</strong>{' '}
                      {authStatus.user.role ? (
                        <span
                          className={
                            authStatus.user.role === 'admin'
                              ? 'text-green-600 font-bold'
                              : ''
                          }
                        >
                          {authStatus.user.role}
                        </span>
                      ) : (
                        <span className="text-red-600">No role assigned</span>
                      )}
                    </p>
                  </div>
                )}

                {isGoogleAuth && !authStatus.user?.role && (
                  <div className="bg-yellow-100 p-4 rounded">
                    <p className="font-semibold text-yellow-800">
                      ⚠️ Google Auth Role Issue Detected
                    </p>
                    <p className="mt-2">
                      You&apos;re using Google Authentication but don&apos;t
                      have an admin role assigned. This is a common issue with
                      OAuth providers like Google.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>Could not fetch authentication status.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Google Auth Admin Fix
            </h2>

            <p className="mb-4">
              This tool will check if you&apos;re using Google Authentication
              and fix your admin privileges if you should have them. Use this if
              you&apos;re experiencing issues accessing admin features.
            </p>

            <div className="space-y-4">
              <button
                onClick={runGoogleAuthFix}
                disabled={isFixing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
              >
                {isFixing ? 'Running Fix...' : 'Apply Google Auth Fix'}
              </button>

              {googleAuthResult && (
                <div
                  className={`p-4 rounded ${googleAuthResult.success ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  <p
                    className={`font-semibold ${googleAuthResult.success ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {googleAuthResult.message}
                  </p>

                  {googleAuthResult.user && (
                    <div className="mt-2">
                      <p>
                        <strong>User:</strong> {googleAuthResult.user.email}
                      </p>
                      <p>
                        <strong>Role:</strong> {googleAuthResult.user.role}
                      </p>
                    </div>
                  )}

                  {googleAuthResult.error && (
                    <p className="mt-2">
                      <strong>Error:</strong> {googleAuthResult.error}
                    </p>
                  )}
                </div>
              )}

              {!isGoogleAuth && (
                <div className="p-4 bg-gray-100 rounded">
                  <p>
                    You don&apos;t appear to be using Google Authentication.
                    This fix is specifically for users experiencing issues with
                    Google OAuth.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Tools Tab */}
      {activeTab === 'admin' && !isLoading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Manual Admin Role Assignment
            </h2>

            <p className="mb-4">
              If the automated fixes don&apos;t work, you can manually assign
              the admin role to a user. You&apos;ll need the user&apos;s ID from
              the authentication section above.
            </p>

            <div className="space-y-4">
              <ManualAdminAssignment userId={authStatus?.user?.id} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Admin Access Links</h2>

            <div className="space-y-2">
              <p>
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:underline"
                >
                  Admin Users Page
                </Link>{' '}
                - Main admin users management interface
              </p>
              <p>
                <Link
                  href="/api/debug/check-session"
                  className="text-blue-600 hover:underline"
                >
                  Check Session API
                </Link>{' '}
                - Raw session data
              </p>
              <p>
                <Link
                  href="/auth/logout"
                  className="text-blue-600 hover:underline"
                >
                  Logout Page
                </Link>{' '}
                - Clear your session completely
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for manual admin role assignment
function ManualAdminAssignment({ userId }: { userId?: string }) {
  const [manualUserId, setManualUserId] = useState(userId || '');
  const [status, setStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualUserId.trim()) {
      setStatus({ message: 'Please provide a user ID', error: true });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: manualUserId, role: 'admin' }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="userId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          User ID
        </label>
        <input
          type="text"
          id="userId"
          value={manualUserId}
          onChange={(e) => setManualUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="User ID from authentication section"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Grant Admin Role'}
      </button>

      {status && (
        <div
          className={`p-3 rounded ${
            status.error
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {status.message}
        </div>
      )}
    </form>
  );
}
