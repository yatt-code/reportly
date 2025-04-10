'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';

// Define Zod schema for input validation
const WorkspaceIdSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

// Define return type
type SetActiveWorkspaceResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action to set a user's active workspace
 * 
 * @param workspaceId - The ID of the workspace to set as active
 * @returns {Promise<SetActiveWorkspaceResult>} - Result object indicating success or failure
 */
export async function setActiveWorkspace(
  workspaceId: string
): Promise<SetActiveWorkspaceResult> {
  const functionName = 'setActiveWorkspace';
  logger.log(`[${functionName}] Starting execution.`, { workspaceId });

  try {
    // Validate input
    const validationResult = WorkspaceIdSchema.safeParse({ workspaceId });
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      logger.error(`[${functionName}] Validation error:`, { errors: errorMessage });
      return { success: false, error: `Invalid input: ${errorMessage}` };
    }

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

    // Verify that the workspace exists and the user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      logger.error(`[${functionName}] Workspace not found.`, { workspaceId });
      return { success: false, error: 'Workspace not found.' };
    }

    if (!workspace.memberIds.includes(userProfile._id.toString())) {
      logger.error(`[${functionName}] User is not a member of the workspace.`, { userId, workspaceId });
      return { success: false, error: 'You are not a member of this workspace.' };
    }

    // Update the user's active workspace
    userProfile.activeWorkspaceId = workspaceId;
    await userProfile.save();

    logger.log(`[${functionName}] Successfully set active workspace.`, { userId, workspaceId });
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error setting active workspace:`, error);
    return { success: false, error: 'Failed to set active workspace due to a server error.' };
  }
}
