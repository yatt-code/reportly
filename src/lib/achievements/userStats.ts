/**
 * User Statistics Utilities for Achievement System
 * 
 * This module provides functions to retrieve user activity statistics
 * needed for achievement condition evaluation.
 */

import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';

/**
 * Counts the total number of comments made by a user
 * 
 * @param userId - The ID of the user
 * @returns The total number of comments
 */
export async function getUserCommentCount(userId: string): Promise<number> {
  const functionName = 'getUserCommentCount';
  
  try {
    await connectDB();
    const count = await CommentModel.countDocuments({ userId });
    logger.log(`[${functionName}] User ${userId} has ${count} total comments`);
    return count;
  } catch (error) {
    logger.error(`[${functionName}] Error counting comments for user ${userId}`, error);
    throw new Error(`Failed to count user comments: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Counts the total number of reports created by a user
 * 
 * @param userId - The ID of the user
 * @returns The total number of reports
 */
export async function getUserReportCount(userId: string): Promise<number> {
  const functionName = 'getUserReportCount';
  
  try {
    await connectDB();
    const count = await Report.countDocuments({ userId });
    logger.log(`[${functionName}] User ${userId} has ${count} total reports`);
    return count;
  } catch (error) {
    logger.error(`[${functionName}] Error counting reports for user ${userId}`, error);
    throw new Error(`Failed to count user reports: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the number of consecutive days a user has commented
 * This is a placeholder implementation - in a real app, this would involve
 * more complex date-based queries to determine actual streaks
 * 
 * @param userId - The ID of the user
 * @returns The number of consecutive days with comments
 */
export async function getUserCommentStreak(userId: string): Promise<number> {
  // Placeholder implementation
  // In a real app, this would query comments grouped by date and calculate streaks
  return 1;
}

/**
 * Gets the number of consecutive days a user has created reports
 * This is a placeholder implementation - in a real app, this would involve
 * more complex date-based queries to determine actual streaks
 * 
 * @param userId - The ID of the user
 * @returns The number of consecutive days with reports
 */
export async function getUserReportStreak(userId: string): Promise<number> {
  // Placeholder implementation
  // In a real app, this would query reports grouped by date and calculate streaks
  return 1;
}
