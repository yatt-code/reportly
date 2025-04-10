import { postComment } from '@/app/actions/comment/postComment';
import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/Comment', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({
      _id: 'test-comment-id',
      reportId: 'test-report-id',
      content: 'Test comment with @user1 and @user2',
      userId: 'current-user-id',
      mentions: ['user1-id', 'user2-id'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }));
});
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/lib/supabaseClient', () => ({
  getSupabaseServiceRoleClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock('@/lib/achievements/checkAchievements', () => ({
  checkAchievements: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/xp', () => ({
  addXp: jest.fn().mockResolvedValue({
    newXp: 100,
    newLevel: 1,
    levelUp: false,
    unlockedAchievements: [],
  }),
}));

describe('postComment - Mentions and Notifications', () => {
  // Mock Supabase client
  const mockSupabaseInsert = jest.fn().mockReturnValue({ error: null });
  const mockSupabaseFrom = jest.fn().mockReturnValue({
    insert: mockSupabaseInsert,
  });
  const mockSupabaseClient = {
    from: mockSupabaseFrom,
  };

  // Mock user data
  const mockCurrentUser = {
    id: 'current-user-id',
    email: 'current@example.com',
  };

  // Mock user lookup response
  const mockUserLookupResponse = {
    data: [
      { id: 'user1-id', username: 'user1' },
      { id: 'user2-id', username: 'user2' },
      { id: 'current-user-id', username: 'currentuser' },
    ],
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockResolvedValue(mockCurrentUser);
    (getSupabaseServiceRoleClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    
    // Mock Supabase user lookup
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              data: mockUserLookupResponse.data,
              error: mockUserLookupResponse.error,
            }),
          }),
        };
      }
      return {
        insert: mockSupabaseInsert,
      };
    });
  });

  it('should extract mentions from comment content and create notifications', async () => {
    // Call postComment with a comment containing mentions
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment mentioning @user1 and @user2',
      parentId: null,
    });

    // Verify the result is successful
    expect(result.success).toBe(true);
    expect(result.comment).toBeDefined();

    // Verify mentions were extracted and saved
    expect(CommentModel).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'This is a test comment mentioning @user1 and @user2',
        reportId: 'test-report-id',
        userId: 'current-user-id',
      })
    );

    // Verify notifications were created for mentioned users
    expect(mockSupabaseFrom).toHaveBeenCalledWith('notifications');
    expect(mockSupabaseInsert).toHaveBeenCalledWith([
      {
        userId: 'user1-id',
        type: 'mention',
        contextId: 'test-comment-id',
        reportId: 'test-report-id',
      },
      {
        userId: 'user2-id',
        type: 'mention',
        contextId: 'test-comment-id',
        reportId: 'test-report-id',
      },
    ]);
  });

  it('should not create notifications for self-mentions', async () => {
    // Call postComment with a comment containing a self-mention
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment mentioning @currentuser and @user1',
      parentId: null,
    });

    // Verify the result is successful
    expect(result.success).toBe(true);

    // Verify notifications were only created for other users (not self)
    expect(mockSupabaseInsert).toHaveBeenCalledWith([
      {
        userId: 'user1-id',
        type: 'mention',
        contextId: 'test-comment-id',
        reportId: 'test-report-id',
      },
    ]);
  });

  it('should handle errors during notification creation gracefully', async () => {
    // Mock Supabase error
    mockSupabaseInsert.mockReturnValueOnce({ error: new Error('Supabase error') });

    // Call postComment with a comment containing mentions
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment mentioning @user1 and @user2',
      parentId: null,
    });

    // Verify the result is still successful (comment saved despite notification error)
    expect(result.success).toBe(true);
    expect(result.comment).toBeDefined();

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to insert mention notifications'),
      expect.anything()
    );
  });

  it('should handle case with no mentions', async () => {
    // Call postComment with a comment containing no mentions
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment with no mentions',
      parentId: null,
    });

    // Verify the result is successful
    expect(result.success).toBe(true);

    // Verify no notifications were created
    expect(mockSupabaseFrom).not.toHaveBeenCalledWith('notifications');
    expect(mockSupabaseInsert).not.toHaveBeenCalled();
  });

  it('should handle case with unresolved mentions', async () => {
    // Mock empty user lookup response
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              data: [], // No users found
              error: null,
            }),
          }),
        };
      }
      return {
        insert: mockSupabaseInsert,
      };
    });

    // Call postComment with a comment containing mentions that don't resolve
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment mentioning @nonexistentuser',
      parentId: null,
    });

    // Verify the result is successful
    expect(result.success).toBe(true);

    // Verify no notifications were created
    expect(mockSupabaseInsert).not.toHaveBeenCalled();
  });
});
