import { addXp } from '@/lib/xp/addXp';
import { getSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserCommentCount, getUserReportCount } from '@/lib/achievements/userStats';

// Mock dependencies
jest.mock('@/lib/supabaseClient');
jest.mock('@/lib/achievements/checkAchievements');
jest.mock('@/lib/achievements/userStats');
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('addXp', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add XP for a new user and create stats record', async () => {
    // Mock Supabase client
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    (getSupabaseServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Mock achievement checks
    (checkAchievements as jest.Mock).mockResolvedValue(['test-achievement']);
    
    // Execute the function
    const result = await addXp('test-user-id', 'comment');
    
    // Verify the result
    expect(result).toEqual({
      newXp: 10, // 10 XP for a comment
      newLevel: 1, // Level 1 for a new user
      levelUp: false, // No level up for a new user
      unlockedAchievements: ['test-achievement'],
    });
    
    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('user_stats');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'test-user-id',
      xp: 10,
      level: 1,
    }));
  });

  it('should update XP for an existing user', async () => {
    // Mock Supabase client
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { xp: 90, level: 1 }, 
        error: null 
      }),
      update: jest.fn().mockResolvedValue({ error: null }),
    };
    (getSupabaseServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Mock achievement checks
    (checkAchievements as jest.Mock).mockResolvedValue([]);
    
    // Execute the function
    const result = await addXp('test-user-id', 'comment');
    
    // Verify the result
    expect(result).toEqual({
      newXp: 100, // 90 + 10 XP for a comment
      newLevel: 2, // Level up from 1 to 2
      levelUp: true, // Level up occurred
      unlockedAchievements: [],
    });
    
    // Verify Supabase calls
    expect(mockSupabase.from).toHaveBeenCalledWith('user_stats');
    expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
      xp: 100,
      level: 2,
    }));
  });

  it('should handle errors when fetching user stats', async () => {
    // Mock Supabase client with an error
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      }),
    };
    (getSupabaseServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Execute the function and expect it to throw
    await expect(addXp('test-user-id', 'comment')).rejects.toThrow('Failed to fetch user stats');
  });

  it('should handle errors when updating user stats', async () => {
    // Mock Supabase client with an update error
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { xp: 90, level: 1 }, 
        error: null 
      }),
      update: jest.fn().mockResolvedValue({ error: { message: 'Update error' } }),
    };
    (getSupabaseServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Execute the function and expect it to throw
    await expect(addXp('test-user-id', 'comment')).rejects.toThrow('Failed to update user stats');
  });
});
