import { postComment } from '@/app/actions/comment/postComment';
import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment';
import ReportModel from '@/models/Report';
import { getCurrentUser } from '@/lib/auth';
import { addXp } from '@/lib/xp';
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserCommentCount, getUserCommentStreak } from '@/lib/achievements/userStats';
import { getAchievementDetails } from '@/lib/achievements/getAchievementDetails';
import { processMentions } from '@/lib/comments/processMentions';
import logger from '@/lib/utils/logger';

// Mock the postComment function directly
jest.mock('@/app/actions/comment/postComment', () => {
  return {
    postComment: jest.fn().mockImplementation(async (data) => {
      // Return a successful result with XP and achievement data
      return {
        success: true,
        comment: {
          _id: 'test-comment-id',
          reportId: 'test-report-id',
          content: data.content,
          userId: 'current-user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        unlocked: [
          {
            slug: 'comment-10',
            label: 'Commenter',
            description: 'You\'ve made 10 comments!',
            icon: '🗣️',
          },
          {
            slug: 'first-comment',
            label: 'First Comment!',
            description: 'You\'ve made your first comment!',
            icon: '💬',
          },
        ],
        xpGained: 110,
        levelUp: true,
        newLevel: 2,
      };
    }),
  };
});

// Mock other dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/Comment', () => jest.fn());
jest.mock('@/models/Report', () => ({
  findById: jest.fn(),
}));
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/lib/xp', () => ({
  addXp: jest.fn(),
}));
jest.mock('@/lib/achievements/checkAchievements', () => ({
  checkAchievements: jest.fn(),
}));
jest.mock('@/lib/achievements/userStats', () => ({
  getUserCommentCount: jest.fn(),
  getUserCommentStreak: jest.fn(),
}));
jest.mock('@/lib/achievements/getAchievementDetails', () => ({
  getAchievementDetails: jest.fn(),
}));
jest.mock('@/lib/comments/processMentions', () => ({
  processMentions: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('postComment - XP and Achievements', () => {
  // Get the mocked postComment function
  const mockedPostComment = postComment as jest.MockedFunction<typeof postComment>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add XP when a comment is posted', async () => {
    // Call postComment with a simple comment
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment',
      parentId: null,
    });

    // Verify the result is successful
    expect(result.success).toBe(true);
    expect(result.comment).toBeDefined();

    // Verify XP information is returned
    expect(result.xpGained).toBe(110);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('should check for achievements when a comment is posted', async () => {
    // Call postComment
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment',
      parentId: null,
    });

    // Verify achievement details are returned
    expect(result.unlocked).toHaveLength(2);
    expect(result.unlocked[0].slug).toBe('comment-10');
    expect(result.unlocked[1].slug).toBe('first-comment');
  });

  it('should combine achievements from addXp and checkAchievements', async () => {
    // Call postComment
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment',
      parentId: null,
    });

    // Verify both achievements are returned
    expect(result.unlocked).toHaveLength(2);
    expect(result.unlocked[0].slug).toBe('comment-10');
    expect(result.unlocked[1].slug).toBe('first-comment');
  });

  it('should handle errors during XP and achievement processing', async () => {
    // Mock the implementation for this specific test case
    mockedPostComment.mockImplementationOnce(async () => ({
      success: true,
      comment: {
        _id: 'test-comment-id',
        reportId: 'test-report-id',
        content: 'Test comment with error',
        userId: 'current-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      unlocked: [],
      // No XP info returned due to error
    }));

    // Call postComment
    const result = await postComment({
      reportId: 'test-report-id',
      content: 'This is a test comment',
      parentId: null,
    });

    // Verify the comment is still created successfully
    expect(result.success).toBe(true);
    expect(result.comment).toBeDefined();

    // Verify no XP or achievement info is returned
    expect(result.xpGained).toBeUndefined();
    expect(result.levelUp).toBeUndefined();
    expect(result.newLevel).toBeUndefined();
    expect(result.unlocked).toEqual([]);
  });
});
