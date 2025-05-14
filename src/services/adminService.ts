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
