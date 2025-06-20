import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface PathwayComment {
  id: string;
  pathwayId: string;
  userId?: string;
  authorName: string;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  avatar?: string; // This is for UI display, not stored in DB
}

export interface CreatePathwayCommentParams {
  pathwayId: string;
  comment: string;
  isAnonymous: boolean;
  authorName: string;
  userId?: string;
}

/**
 * Service for managing education pathway comments
 */
export class PathwayCommentService {
  /**
   * Get comments for a specific pathway
   * @param pathwayId The ID of the pathway to get comments for
   * @returns Array of comments for the pathway
   */
  static async getComments(pathwayId: string): Promise<PathwayComment[]> {
    try {
      const { data, error } = await supabase
        .from('pathway_comments')
        .select('*')
        .eq('pathway_id', pathwayId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching pathway comments:', error);
        throw new Error(`Failed to fetch pathway comments: ${error.message}`);
      }

      // Transform database result into PathwayComment objects
      // Adding default avatar based on author's name first letter
      return data.map((comment) => ({
        id: comment.id,
        pathwayId: comment.pathway_id,
        userId: comment.user_id,
        authorName: comment.is_anonymous ? 'Anonymous' : comment.author_name,
        comment: comment.comment,
        isAnonymous: comment.is_anonymous,
        createdAt: comment.created_at,
        avatar: this.getAvatarEmoji(comment.author_name),
      }));
    } catch (error) {
      logger.error('Error in getComments:', error);
      return [];
    }
  }

  /**
   * Add a new comment for a pathway
   * @param commentData The comment data to add
   * @returns The newly created comment or null if failed
   */
  static async addComment(
    commentData: CreatePathwayCommentParams
  ): Promise<PathwayComment | null> {
    try {
      // Prepare the data for insertion
      const { pathwayId, comment, isAnonymous, authorName, userId } =
        commentData;

      // For authenticated users, we require a userId
      // For unauthenticated users, we don't have a userId

      const { data, error } = await supabase
        .from('pathway_comments')
        .insert({
          pathway_id: pathwayId,
          user_id: userId, // Will be null for unauthenticated users
          author_name: authorName,
          comment,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error adding pathway comment:', error);
        throw new Error(`Failed to add pathway comment: ${error.message}`);
      }

      // Return the newly created comment
      return {
        id: data.id,
        pathwayId: data.pathway_id,
        userId: data.user_id,
        authorName: data.is_anonymous ? 'Anonymous' : data.author_name,
        comment: data.comment,
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
        avatar: this.getAvatarEmoji(data.author_name),
      };
    } catch (error) {
      logger.error('Error in addComment:', error);
      return null;
    }
  }

  /**
   * Delete a comment (admin only)
   * @param commentId ID of the comment to delete
   * @returns true if successful, false otherwise
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pathway_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        logger.error('Error deleting pathway comment:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteComment:', error);
      return false;
    }
  }

  /**
   * Get all comments (for admin use only)
   * @returns Array of all pathway comments
   */
  static async getAllComments(): Promise<PathwayComment[]> {
    try {
      const { data, error } = await supabase
        .from('pathway_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching all pathway comments:', error);
        throw new Error(
          `Failed to fetch all pathway comments: ${error.message}`
        );
      }

      // Transform database result into PathwayComment objects
      return data.map((comment) => ({
        id: comment.id,
        pathwayId: comment.pathway_id,
        userId: comment.user_id,
        authorName: comment.is_anonymous ? 'Anonymous' : comment.author_name,
        comment: comment.comment,
        isAnonymous: comment.is_anonymous,
        createdAt: comment.created_at,
        avatar: this.getAvatarEmoji(comment.author_name),
      }));
    } catch (error) {
      logger.error('Error in getAllComments:', error);
      return [];
    }
  }

  /**
   * Get a simple emoji avatar based on the first letter of the author's name
   * @param name Author's name
   * @returns An emoji to use as avatar
   */
  private static getAvatarEmoji(name: string): string {
    const avatarOptions = [
      '👤',
      '👩‍🎓',
      '👨‍🎓',
      '🧑‍🎓',
      '👩‍💻',
      '👨‍💻',
      '🧑‍💼',
      '👩‍🏫',
      '👨‍🔬',
      '🧑‍🔬',
    ];

    if (!name) return '👤';

    // Use first character of name to deterministically select an emoji
    const charCode = name.charCodeAt(0);
    const index = charCode % avatarOptions.length;
    return avatarOptions[index];
  }
}
