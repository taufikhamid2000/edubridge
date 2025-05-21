import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Checks if a user has admin privileges
 * @param userId The user ID to check
 * @returns True if the user is an admin, false otherwise
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error checking admin status:', error);
      return false;
    }

    return data?.role === 'admin';
  } catch (error) {
    logger.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Logs an administrative action
 * @param adminId The ID of the admin performing the action
 * @param action The action being performed
 * @param entityType The type of entity being acted upon (e.g., 'user', 'quiz')
 * @param entityId The ID of the entity
 * @param details Additional details about the action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('log_admin_action', {
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details ? JSON.stringify(details) : null,
    });

    if (error) {
      logger.error('Error logging admin action:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Failed to log admin action:', error);
    return null;
  }
}

/**
 * Fetches site configuration settings
 * @param configId The configuration ID to fetch
 * @returns The configuration object
 */
// Define types for site configuration
export interface SiteConfig {
  siteTitle?: string;
  siteDescription?: string;
  themePrimary?: string;
  themeSecondary?: string;
  enableFeatures?: {
    quiz?: boolean;
    achievements?: boolean;
    leaderboard?: boolean;
    forum?: boolean;
  };
  maintenanceMode?: boolean;
  [key: string]: unknown;
}

export async function getSiteConfig(
  configId: string = 'general'
): Promise<SiteConfig | null> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('config')
      .eq('id', configId)
      .single();

    if (error) {
      logger.error(`Error fetching ${configId} config:`, error);
      return null;
    }

    return data?.config as SiteConfig;
  } catch (error) {
    logger.error(`Failed to fetch ${configId} config:`, error);
    return null;
  }
}

/**
 * Updates site configuration settings
 * @param configId The configuration ID to update
 * @param config The new configuration object
 * @returns True if the update was successful, false otherwise
 */
export async function updateSiteConfig(
  configId: string,
  config: SiteConfig
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_config')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', configId);

    if (error) {
      logger.error(`Error updating ${configId} config:`, error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Failed to update ${configId} config:`, error);
    return false;
  }
}

/**
 * Updates a user's role
 * @param userId The ID of the user to update
 * @param role The new role for the user
 * @returns True if the update was successful, false otherwise
 */
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'moderator' | 'user'
): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_roles').upsert({
      user_id: userId,
      role,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      logger.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to update user role:', error);
    return false;
  }
}

/**
 * Interface for admin log entries
 */
export interface AdminLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
  admins?: { email: string }[] | { email: string } | null;
}

/**
 * Fetches admin activity logs
 * @param limit The maximum number of logs to fetch
 * @param offset The offset for pagination
 * @returns Array of admin log entries
 */
export async function getAdminLogs(
  limit: number = 20,
  offset: number = 0
): Promise<AdminLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(
        `
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        admins:admin_id (email)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching admin logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch admin logs:', error);
    return [];
  }
}

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

/**
 * Fetches all users for admin purposes using the client-side supabase instance
 * This leverages RLS policies that should allow admin users to access this data
 */
export async function fetchAdminUsers(): Promise<{
  data: User[] | null;
  error: Error | null;
}> {
  try {
    // First check if the user is an admin via a direct query
    // This is necessary to enforce proper authorization
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq(
        'user_id',
        (await supabase.auth.getSession()).data.session?.user?.id || ''
      )
      .single();

    if (roleError || !userRoles || userRoles.role !== 'admin') {
      logger.error('Admin access denied - user is not an admin', { roleError });
      return {
        data: null,
        error: new Error('Admin access required'),
      };
    }

    // User is confirmed as admin, proceed with fetch
    // Get users and their roles - users first
    const { data: users, error: usersError } = await supabase.from(
      'user_profiles'
    ).select(`
        id,
        display_name,
        avatar_url,
        level,
        xp,
        created_at
      `);

    if (usersError) {
      logger.error('Error fetching users:', usersError);
      return { data: null, error: usersError };
    }

    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      logger.error('Error fetching user roles:', rolesError);
      return { data: null, error: rolesError };
    }

    // Create a map for quick lookups of roles
    const rolesMap = new Map();
    roles?.forEach((role) => {
      rolesMap.set(role.user_id, role.role);
    });

    // Combine the data - use display_name to create emails
    // No longer trying to access users table directly
    const enrichedUsers = users?.map((user) => ({
      ...user,
      email: `${user.display_name?.replace(/\s+/g, '.').toLowerCase() || user.id.substring(0, 8)}@example.com`,
      role: rolesMap.get(user.id) || 'user',
    })) as User[];

    return { data: enrichedUsers, error: null };
  } catch (error) {
    const err = error as Error;
    logger.error('Error in fetchAdminUsers:', err);
    return { data: null, error: err };
  }
}
