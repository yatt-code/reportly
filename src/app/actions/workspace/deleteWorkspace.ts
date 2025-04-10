'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import Report from '@/models/Report';
import CommentModel from '@/models/Comment';
import logger from '@/lib/utils/logger';
import { enforceWorkspaceAccess } from '@/lib/rbac/workspaceAccess';

// Define Zod schema for input validation
const WorkspaceIdSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

// Define return type
type DeleteWorkspaceResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action to delete a workspace
 * 
 * @param workspaceId - The ID of the workspace to delete
 * @returns {Promise<DeleteWorkspaceResult>} - Result object indicating success or failure
 */
export async function deleteWorkspace(
  workspaceId: string
): Promise<DeleteWorkspaceResult> {
  const functionName = 'deleteWorkspace';
  logger.log(`[${functionName}] Starting execution.`, { workspaceId });

  try {
    // Validate input
    const validationResult = WorkspaceIdSchema.safeParse({ workspaceId });
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      logger.error(`[${functionName}] Validation error:`, { errors: errorMessage });
      return { success: false, error: `Invalid input: ${errorMessage}` };
    }
    const validatedWorkspaceId = validationResult.data.workspaceId;

    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      logger.error(`[${functionName}] Unauthorized: No user session found.`);
      return { success: false, error: 'Authentication required.' };
    }
    const userId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId });

    // Connect to the database
    await connectDB();

    // Get the user's profile from MongoDB
    const userProfile = await User.findOne({ supabaseUserId: userId });
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Verify that the user has access to the workspace
    await enforceWorkspaceAccess(userId, validatedWorkspaceId);
    logger.log(`[${functionName}] Workspace access verified.`, { userId, workspaceId: validatedWorkspaceId });

    // Get the workspace
    const workspace = await Workspace.findById(validatedWorkspaceId);
    if (!workspace) {
      logger.error(`[${functionName}] Workspace not found.`, { workspaceId: validatedWorkspaceId });
      return { success: false, error: 'Workspace not found.' };
    }

    // Check if this is the user's active workspace
    if (userProfile.activeWorkspaceId === validatedWorkspaceId) {
      logger.error(`[${functionName}] Cannot delete active workspace.`, { workspaceId: validatedWorkspaceId });
      return { success: false, error: 'Cannot delete your active workspace. Please switch to another workspace first.' };
    }

    // Check if this is the user's only workspace
    if (userProfile.workspaceIds.length === 1 && userProfile.workspaceIds[0] === validatedWorkspaceId) {
      logger.error(`[${functionName}] Cannot delete the only workspace.`, { workspaceId: validatedWorkspaceId });
      return { success: false, error: 'Cannot delete your only workspace. Please create another workspace first.' };
    }

    // Delete all reports in the workspace
    const deleteReportsResult = await Report.deleteMany({ workspaceId: validatedWorkspaceId });
    logger.log(`[${functionName}] Deleted ${deleteReportsResult.deletedCount} reports.`);

    // Delete all comments in the workspace
    const deleteCommentsResult = await CommentModel.deleteMany({ workspaceId: validatedWorkspaceId });
    logger.log(`[${functionName}] Deleted ${deleteCommentsResult.deletedCount} comments.`);

    // Remove the workspace from all users' workspaceIds
    const updateUsersResult = await User.updateMany(
      { workspaceIds: validatedWorkspaceId },
      { $pull: { workspaceIds: validatedWorkspaceId } }
    );
    logger.log(`[${functionName}] Updated ${updateUsersResult.modifiedCount} users.`);

    // Delete the workspace
    await Workspace.findByIdAndDelete(validatedWorkspaceId);
    logger.log(`[${functionName}] Workspace deleted.`, { workspaceId: validatedWorkspaceId });

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error deleting workspace:`, error);
    return { success: false, error: 'Failed to delete workspace due to a server error.' };
  }
}
