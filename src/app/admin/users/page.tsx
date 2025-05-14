'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import AdminNavigation from '@/components/admin/AdminNavigation';
import Image from 'next/image';

// Define the structure of the user data after processing
interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  created_at: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true); // Join user_profiles with auth.users to get email
      // Note: This requires proper RLS policies and permissions
      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          `
          id,
          display_name,
          avatar_url,
          level,
          xp,
          created_at,
          user_roles:user_id (role)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Log the structure for debugging
      console.log(
        'First user data:',
        data && data.length > 0 ? data[0] : 'No data'
      );

      // Fetch emails separately (if your auth setup allows it)
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email');

      if (authError) {
        logger.error('Error fetching auth users:', authError);
      } // Combine the data
      const usersWithEmail = data?.map((user) => {
        const authUser = authUsers?.find((au) => au.id === user.id);

        // Extract role from user_roles array
        let role = 'user'; // default role
        if (
          user.user_roles &&
          Array.isArray(user.user_roles) &&
          user.user_roles.length > 0
        ) {
          role = user.user_roles[0].role;
        }

        return {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          level: user.level,
          xp: user.xp,
          created_at: user.created_at,
          email: authUser?.email || 'Email not available',
          role: role,
        };
      });

      setUsers(usersWithEmail || []);
    } catch (error) {
      logger.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      // Update the user's role in the user_roles table
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role })
        .select();

      if (error) throw error;

      // Update the local state
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, role } : user))
      );

      logger.log('User role updated successfully');
    } catch (error) {
      logger.error('Error updating user role:', error);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Users Management</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level/XP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchTerm
                          ? 'No users found matching your search.'
                          : 'No users found in the system.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {' '}
                              {user.avatar_url ? (
                                <Image
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.avatar_url}
                                  alt={user.display_name}
                                  width={40}
                                  height={40}
                                  unoptimized={user.avatar_url.startsWith(
                                    'data:'
                                  )}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {user.display_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.display_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Level {user.level}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.xp} XP
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className="text-sm border rounded py-1 px-2"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            View
                          </button>
                          <span className="mx-2">|</span>
                          <button className="text-red-600 hover:text-red-900">
                            Disable
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
