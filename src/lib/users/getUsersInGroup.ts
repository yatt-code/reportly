import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import logger from '@/lib/utils/logger';

/**
 * Get all users in the same group as the specified user
 * 
 * @param userId - The Supabase user ID
 * @returns Array of users in the same group
 */
export async function getUsersInGroup(userId: string) {
  try {
    // Connect to database
    await connectDB();
    
    // Get user's group
    const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean();
    
    if (!userProfile || !userProfile.groupId) {
      logger.warn('User has no group or profile not found', { userId });
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
  } catch (error) {
    logger.error('Error fetching users in group', { userId, error });
    return [];
  }
}
