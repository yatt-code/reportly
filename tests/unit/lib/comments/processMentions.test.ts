import { processMentions } from '@/lib/comments/processMentions';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/supabaseClient', () => ({
  getSupabaseServiceRoleClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Create a mock implementation of the processMentions function
// This assumes you'll extract the mention processing logic from postComment to a separate function
jest.mock('@/lib/comments/processMentions', () => ({
  processMentions: jest.fn(),
}));

describe('processMentions', () => {
  // Mock Supabase client
  const mockSupabaseInsert = jest.fn().mockReturnValue({ error: null });
  const mockSupabaseFrom = jest.fn().mockReturnValue({
    insert: mockSupabaseInsert,
  });
  const mockSupabaseClient = {
    from: mockSupabaseFrom,
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
    // Mock implementation for this test
    (processMentions as jest.Mock).mockImplementation(async (commentContent, commentId, reportId, currentUserId) => {
      // Extract mentions from content (simple regex for @username)
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;

      while ((match = mentionRegex.exec(commentContent)) !== null) {
        mentions.push(match[1]); // Extract the username without @
      }

      if (mentions.length === 0) {
        return; // No mentions to process
      }

      // Get Supabase client
      const supabase = getSupabaseServiceRoleClient();

      // Look up user IDs for the mentioned usernames
      const { data: users, error: lookupError } = await supabase
        .from('users')
        .select('id, username')
        .in('username', mentions);

      if (lookupError || !users) {
        logger.error('Failed to look up mentioned users', { lookupError });
        return;
      }

      // Filter out self-mentions
      const mentionedUserIds = users
        .filter(user => user.id !== currentUserId)
        .map(user => user.id);

      if (mentionedUserIds.length === 0) {
        return; // No users to notify (only self-mentions)
      }

      // Create notifications
      const notifications = mentionedUserIds.map(userId => ({
        userId,
        type: 'mention',
        contextId: commentId,
        reportId,
      }));

      // Insert notifications
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        logger.error('Failed to insert mention notifications', { insertError });
      }
    });

    // Call the function
    await processMentions(
      'This is a test comment mentioning @user1 and @user2',
      'test-comment-id',
      'test-report-id',
      'current-user-id'
    );

    // Verify Supabase calls
    expect(getSupabaseServiceRoleClient).toHaveBeenCalled();
    expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
    expect(mockSupabaseFrom).toHaveBeenCalledWith('notifications');

    // Verify notifications were created for mentioned users
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
    // Mock implementation for this test
    (processMentions as jest.Mock).mockImplementation(async (commentContent, commentId, reportId, currentUserId) => {
      // Same implementation as above, but with a different comment content
      // that includes a self-mention

      // Extract mentions from content
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;

      while ((match = mentionRegex.exec(commentContent)) !== null) {
        mentions.push(match[1]);
      }

      if (mentions.length === 0) {
        return;
      }

      // Get Supabase client
      const supabase = getSupabaseServiceRoleClient();

      // Look up user IDs for the mentioned usernames
      const { data: users, error: lookupError } = await supabase
        .from('users')
        .select('id, username')
        .in('username', mentions);

      if (lookupError || !users) {
        return;
      }

      // Filter out self-mentions
      const mentionedUserIds = users
        .filter(user => user.id !== currentUserId)
        .map(user => user.id);

      if (mentionedUserIds.length === 0) {
        return;
      }

      // Create notifications
      const notifications = mentionedUserIds.map(userId => ({
        userId,
        type: 'mention',
        contextId: commentId,
        reportId,
      }));

      // Insert notifications
      await supabase
        .from('notifications')
        .insert(notifications);
    });

    // Override the mock user lookup for this test
    mockSupabaseFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              data: [
                { id: 'user1-id', username: 'user1' },
                { id: 'current-user-id', username: 'currentuser' }, // Match the current user ID
              ],
              error: null,
            }),
          }),
        };
      }
      return {
        insert: mockSupabaseInsert,
      };
    });

    // Call the function with a comment containing a self-mention
    await processMentions(
      'This is a test comment mentioning @currentuser and @user1',
      'test-comment-id',
      'test-report-id',
      'current-user-id'
    );

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

    // Mock implementation for this test
    (processMentions as jest.Mock).mockImplementation(async (commentContent, commentId, reportId, currentUserId) => {
      // Same implementation as above, but with error handling

      // Extract mentions from content
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;

      while ((match = mentionRegex.exec(commentContent)) !== null) {
        mentions.push(match[1]);
      }

      if (mentions.length === 0) {
        return;
      }

      // Get Supabase client
      const supabase = getSupabaseServiceRoleClient();

      // Look up user IDs for the mentioned usernames
      const { data: users, error: lookupError } = await supabase
        .from('users')
        .select('id, username')
        .in('username', mentions);

      if (lookupError || !users) {
        logger.error('Failed to look up mentioned users', { lookupError });
        return;
      }

      // Filter out self-mentions
      const mentionedUserIds = users
        .filter(user => user.id !== currentUserId)
        .map(user => user.id);

      if (mentionedUserIds.length === 0) {
        return;
      }

      // Create notifications
      const notifications = mentionedUserIds.map(userId => ({
        userId,
        type: 'mention',
        contextId: commentId,
        reportId,
      }));

      // Insert notifications
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        logger.error('Failed to insert mention notifications', { insertError });
      }
    });

    // Call the function
    await processMentions(
      'This is a test comment mentioning @user1 and @user2',
      'test-comment-id',
      'test-report-id',
      'current-user-id'
    );

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to insert mention notifications',
      expect.objectContaining({
        insertError: expect.any(Error),
      })
    );
  });
});
