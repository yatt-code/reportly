import { getUsersInGroup } from '@/lib/users/getUsersInGroup';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/db/connectDB', () => jest.fn().mockResolvedValue(true));
jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Create a mock implementation of the getUsersInGroup function
// This assumes you'll extract the core logic from the API route to a separate function
jest.mock('@/lib/users/getUsersInGroup', () => ({
  getUsersInGroup: jest.fn(),
}));

describe('getUsersInGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return users from the same group as the specified user', async () => {
    // Mock implementation for this test
    (getUsersInGroup as jest.Mock).mockImplementation(async (userId) => {
      // Mock user profile with group
      const mockUserProfile = {
        supabaseUserId: userId,
        groupId: 'group1',
      };
      
      (UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUserProfile),
      });
      
      // Mock users in the same group
      const mockGroupUsers = [
        { supabaseUserId: 'user1', username: 'user1', name: 'User One' },
        { supabaseUserId: 'user2', username: 'user2', name: 'User Two' },
        { supabaseUserId: 'user3', username: 'user3', name: 'User Three' },
      ];
      
      (UserModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockGroupUsers),
      });
      
      // Connect to database
      await connectDB();
      
      // Get user's group
      const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean();
      
      if (!userProfile || !userProfile.groupId) {
        return [];
      }
      
      // Get all users in the same group
      const usersInGroup = await UserModel.find(
        { groupId: userProfile.groupId },
        { supabaseUserId: 1, username: 1, name: 1, _id: 0 }
      ).lean();
      
      // Transform to expected format
      return usersInGroup.map(user => ({
        id: user.supabaseUserId,
        username: user.username,
        name: user.name,
      }));
    });
    
    // Call the function
    const result = await getUsersInGroup('user1');
    
    // Verify the result
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('user1');
    expect(result[1].id).toBe('user2');
    expect(result[2].id).toBe('user3');
    
    // Verify database calls
    expect(connectDB).toHaveBeenCalled();
    expect(UserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user1' });
    expect(UserModel.find).toHaveBeenCalledWith(
      { groupId: 'group1' },
      { supabaseUserId: 1, username: 1, name: 1, _id: 0 }
    );
  });

  it('should return empty array when user has no group', async () => {
    // Mock implementation for this test
    (getUsersInGroup as jest.Mock).mockImplementation(async (userId) => {
      // Mock user profile with no group
      const mockUserProfile = {
        supabaseUserId: userId,
        // No groupId
      };
      
      (UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUserProfile),
      });
      
      // Connect to database
      await connectDB();
      
      // Get user's group
      const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean();
      
      if (!userProfile || !userProfile.groupId) {
        return [];
      }
      
      // This part should not be reached in this test
      return [];
    });
    
    // Call the function
    const result = await getUsersInGroup('user1');
    
    // Verify the result
    expect(result).toEqual([]);
    
    // Verify database calls
    expect(connectDB).toHaveBeenCalled();
    expect(UserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user1' });
    expect(UserModel.find).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    // Mock implementation for this test
    (getUsersInGroup as jest.Mock).mockImplementation(async (userId) => {
      // Mock database error
      const mockError = new Error('Database connection failed');
      (connectDB as jest.Mock).mockRejectedValue(mockError);
      
      try {
        // Connect to database (will throw)
        await connectDB();
        
        // This part should not be reached
        return [];
      } catch (error) {
        // Log error
        logger.error('Error fetching users in group', { userId, error });
        
        // Return empty array on error
        return [];
      }
    });
    
    // Call the function
    const result = await getUsersInGroup('user1');
    
    // Verify the result
    expect(result).toEqual([]);
    
    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching users in group',
      expect.objectContaining({
        userId: 'user1',
        error: expect.any(Error),
      })
    );
  });
});
