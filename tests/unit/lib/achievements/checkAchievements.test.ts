import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { Achievement } from '@/models/Achievement';
import connectDB from '@/lib/db/connectDB';
import * as achievementRules from '@/lib/achievements/achievementRules';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/models/Achievement');
jest.mock('@/lib/db/connectDB');
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('checkAchievements', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Achievement.find method
    (Achievement.find as jest.Mock).mockResolvedValue([
      { slug: 'existing-achievement' }
    ]);
    
    // Mock the Achievement constructor and save method
    (Achievement as unknown as jest.Mock).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true)
    }));
    
    // Mock the getRulesByTrigger function
    jest.spyOn(achievementRules, 'getRulesByTrigger').mockReturnValue([
      {
        slug: 'test-achievement-1',
        trigger: 'onComment',
        condition: (ctx) => ctx.totalComments >= 5,
        label: 'Test Achievement 1',
        description: 'Test description 1',
        icon: '🧪'
      },
      {
        slug: 'test-achievement-2',
        trigger: 'onComment',
        condition: (ctx) => ctx.totalComments >= 10,
        label: 'Test Achievement 2',
        description: 'Test description 2',
        icon: '🧪'
      },
      {
        slug: 'existing-achievement',
        trigger: 'onComment',
        condition: (ctx) => true, // Always true, but should be skipped
        label: 'Existing Achievement',
        description: 'Already unlocked',
        icon: '✅'
      }
    ]);
  });

  it('should connect to the database', async () => {
    await checkAchievements('user123', 'onComment', { totalComments: 5 });
    expect(connectDB).toHaveBeenCalled();
  });

  it('should retrieve existing user achievements', async () => {
    await checkAchievements('user123', 'onComment', { totalComments: 5 });
    expect(Achievement.find).toHaveBeenCalledWith({ userId: 'user123' });
  });

  it('should filter rules by trigger', async () => {
    await checkAchievements('user123', 'onComment', { totalComments: 5 });
    expect(achievementRules.getRulesByTrigger).toHaveBeenCalledWith('onComment');
  });

  it('should skip already unlocked achievements', async () => {
    const result = await checkAchievements('user123', 'onComment', { totalComments: 15 });
    expect(result).not.toContain('existing-achievement');
  });

  it('should unlock achievements with met conditions', async () => {
    const result = await checkAchievements('user123', 'onComment', { totalComments: 15 });
    expect(result).toContain('test-achievement-1');
    expect(result).toContain('test-achievement-2');
    expect(result.length).toBe(2);
  });

  it('should not unlock achievements with unmet conditions', async () => {
    const result = await checkAchievements('user123', 'onComment', { totalComments: 7 });
    expect(result).toContain('test-achievement-1');
    expect(result).not.toContain('test-achievement-2');
    expect(result.length).toBe(1);
  });

  it('should return an empty array when no rules match the trigger', async () => {
    (achievementRules.getRulesByTrigger as jest.Mock).mockReturnValueOnce([]);
    const result = await checkAchievements('user123', 'onComment', { totalComments: 5 });
    expect(result).toEqual([]);
  });

  it('should handle errors during condition evaluation', async () => {
    (achievementRules.getRulesByTrigger as jest.Mock).mockReturnValueOnce([
      {
        slug: 'error-achievement',
        trigger: 'onComment',
        condition: () => { throw new Error('Test error'); },
        label: 'Error Achievement',
        description: 'Throws an error',
        icon: '❌'
      },
      {
        slug: 'valid-achievement',
        trigger: 'onComment',
        condition: () => true,
        label: 'Valid Achievement',
        description: 'Works correctly',
        icon: '✅'
      }
    ]);
    
    const result = await checkAchievements('user123', 'onComment', {});
    expect(logger.error).toHaveBeenCalled();
    expect(result).toContain('valid-achievement');
    expect(result).not.toContain('error-achievement');
  });

  it('should handle database errors', async () => {
    const dbError = new Error('Database connection failed');
    (connectDB as jest.Mock).mockRejectedValueOnce(dbError);
    
    await expect(checkAchievements('user123', 'onComment', {}))
      .rejects.toThrow('Failed to check achievements');
    
    expect(logger.error).toHaveBeenCalled();
  });
});
