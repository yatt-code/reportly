import { hasRole } from '@/lib/rbac/utils';
import logger from '@/lib/utils/logger';

/**
 * Check if the current user has permission to delete a comment
 * 
 * @param commentUserId - The ID of the user who created the comment
 * @param currentUserId - The ID of the current user
 * @returns True if the user has permission to delete the comment, false otherwise
 */
export async function checkDeletePermission(commentUserId: string, currentUserId: string): Promise<boolean> {
  // Check if current user is an admin
  const isAdmin = await hasRole('admin', { id: currentUserId });
  
  // Admin can delete any comment
  if (isAdmin) {
    logger.log('Admin user authorized to delete comment', { currentUserId, commentUserId });
    return true;
  }
  
  // Regular users can only delete their own comments
  const isOwnComment = commentUserId === currentUserId;
  
  if (isOwnComment) {
    logger.log('User authorized to delete own comment', { currentUserId });
    return true;
  }
  
  // Not authorized
  logger.warn('User not authorized to delete comment', { currentUserId, commentUserId });
  return false;
}
