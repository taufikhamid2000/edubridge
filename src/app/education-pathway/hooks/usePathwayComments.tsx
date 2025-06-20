import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import {
  PathwayCommentService,
  PathwayComment,
  CreatePathwayCommentParams,
} from '@/services/pathwayCommentService';

/**
 * Custom hook for managing pathway comments
 */
export function usePathwayComments(pathwayId: string) {
  const [comments, setComments] = useState<PathwayComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const commentsPerPage = 3;

  // Get auth context to check if user is logged in
  const { user, isLoading: authLoading } = useSupabaseAuth();

  // Check if user is an admin
  const { isAdmin, isLoading: adminCheckLoading } = useAdminStatus();

  // Load comments on component mount or when pathwayId changes
  useEffect(() => {
    async function loadComments() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await PathwayCommentService.getComments(pathwayId);
        setComments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load comments')
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadComments();
  }, [pathwayId]);

  // Sort comments based on sortOrder
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Calculate pagination
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = sortedComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(sortedComments.length / commentsPerPage);

  // Handle adding a new comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      const authorName = user?.user_metadata?.name || 'Guest User';

      const commentData: CreatePathwayCommentParams = {
        pathwayId,
        comment: commentText.trim(),
        isAnonymous,
        authorName,
        userId: user?.id, // Will be undefined for unauthenticated users
      };

      const newComment = await PathwayCommentService.addComment(commentData);

      if (newComment) {
        // Add the new comment to the state
        setComments((prev) => [newComment, ...prev]);
        // Reset the form
        setCommentText('');
        setIsAnonymous(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add comment'));
    }
  };

  // Handle comment deletion (admin only)
  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;

    try {
      const success = await PathwayCommentService.deleteComment(commentId);

      if (success) {
        // Remove the deleted comment from state
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      } else {
        setError(new Error('Failed to delete comment'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to delete comment')
      );
    }
  };

  return {
    comments: currentComments,
    totalComments: comments.length,
    isLoading,
    error,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    commentText,
    setCommentText,
    isAnonymous,
    setIsAnonymous,
    handleSubmitComment,
    isAuthenticated: !!user,
    authLoading,
    isAdmin,
    adminCheckLoading,
    handleDeleteComment,
  };
}
