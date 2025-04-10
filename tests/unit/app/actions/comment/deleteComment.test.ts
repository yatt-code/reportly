import { deleteComment } from '@/app/actions/comment/deleteComment';
import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { hasRole } from '@/lib/rbac/utils';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/Comment', () => ({
  findById: jest.fn(),
  deleteOne: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/lib/rbac/utils', () => ({
  hasRole: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('deleteComment', () => {
  // Mock comment data
  const mockComment = {
    _id: 'test-comment-id',
    reportId: 'test-report-id',
    content: 'Test comment',
    userId: 'comment-author-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (CommentModel.findById as jest.Mock).mockReturnValue(mockComment);
    (CommentModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
  });

  it('should allow admin users to delete any comment', async () => {
    // Mock admin user
    const mockAdminUser = {
      id: 'admin-user-id',
      email: 'admin@example.com',
    };
    (getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser);
    (hasRole as jest.Mock).mockReturnValue(true); // Admin role

    // Call deleteComment
    const result = await deleteComment({ commentId: 'test-comment-id' });

    // Verify the result is successful
    expect(result.success).toBe(true);

    // Verify the comment was found and deleted
    expect(CommentModel.findById).toHaveBeenCalledWith('test-comment-id');
    expect(CommentModel.deleteOne).toHaveBeenCalledWith({ _id: 'test-comment-id' });

    // Verify role check was performed
    expect(hasRole).toHaveBeenCalledWith('admin', mockAdminUser);
  });

  it('should allow users to delete their own comments', async () => {
    // Mock comment author
    const mockAuthorUser = {
      id: 'comment-author-id', // Same as comment.userId
      email: 'author@example.com',
    };
    (getCurrentUser as jest.Mock).mockResolvedValue(mockAuthorUser);
    (hasRole as jest.Mock).mockReturnValue(false); // Not admin

    // Call deleteComment
    const result = await deleteComment({ commentId: 'test-comment-id' });

    // Verify the result is successful
    expect(result.success).toBe(true);

    // Verify the comment was found and deleted
    expect(CommentModel.findById).toHaveBeenCalledWith('test-comment-id');
    expect(CommentModel.deleteOne).toHaveBeenCalledWith({ _id: 'test-comment-id' });
  });

  it('should prevent non-admin users from deleting others\' comments', async () => {
    // Mock non-admin user who is not the comment author
    const mockOtherUser = {
      id: 'other-user-id', // Different from comment.userId
      email: 'other@example.com',
    };
    (getCurrentUser as jest.Mock).mockResolvedValue(mockOtherUser);
    (hasRole as jest.Mock).mockReturnValue(false); // Not admin

    // Call deleteComment
    const result = await deleteComment({ commentId: 'test-comment-id' });

    // Verify the result is unsuccessful
    expect(result.success).toBe(false);
    expect(result.error).toContain('You do not have permission to delete this comment');

    // Verify the comment was found but not deleted
    expect(CommentModel.findById).toHaveBeenCalledWith('test-comment-id');
    expect(CommentModel.deleteOne).not.toHaveBeenCalled();
  });

  it('should return error when comment is not found', async () => {
    // Mock comment not found
    (CommentModel.findById as jest.Mock).mockReturnValue(null);

    // Mock authenticated user
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'some-user-id',
      email: 'user@example.com',
    });

    // Call deleteComment
    const result = await deleteComment({ commentId: 'nonexistent-comment-id' });

    // Verify the result is unsuccessful
    expect(result.success).toBe(false);
    expect(result.error).toBe('Comment not found.');

    // Verify the comment was not deleted
    expect(CommentModel.deleteOne).not.toHaveBeenCalled();
  });

  it('should return error when user is not authenticated', async () => {
    // Mock no authenticated user
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    // Call deleteComment
    const result = await deleteComment({ commentId: 'test-comment-id' });

    // Verify the result is unsuccessful
    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentication required.');

    // Verify the database was not accessed
    expect(connectDB).not.toHaveBeenCalled();
    expect(CommentModel.findById).not.toHaveBeenCalled();
    expect(CommentModel.deleteOne).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    // Mock authenticated user
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'comment-author-id',
      email: 'author@example.com',
    });

    // Mock database error
    const mockError = new Error('Database error');
    (CommentModel.deleteOne as jest.Mock).mockRejectedValue(mockError);

    // Call deleteComment
    const result = await deleteComment({ commentId: 'test-comment-id' });

    // Verify the result is unsuccessful
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to delete comment due to a server error');

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error deleting comment'),
      expect.objectContaining({
        commentId: 'test-comment-id',
        error: mockError,
      })
    );
  });
});
