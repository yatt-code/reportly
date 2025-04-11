'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth.server';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';
import { enforceWorkspaceAccess } from '@/lib/rbac/workspaceAccess';

// Define Zod schema for input validation
const UpdateWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  name: z.string().min(1, 'Workspace name is required').max(100, 'Workspace name is too long'),
  type: z.enum(['team', 'department', 'project']).optional(),
});

// Define return type
type UpdateWorkspaceResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action to update a workspace
 * 
 * @param workspaceId - The ID of the workspace to update
 * @param name - The new name of the workspace
 * @param type - The new type of the workspace (optional)
 * @returns {Promise<UpdateWorkspaceResult>} - Result object indicating success or failure
 */
export async function updateWorkspace(
  workspaceId: string,
  name: string,
  type?: 'team' | 'department' | 'project'
): Promise<UpdateWorkspaceResult> {
  const functionName = 'updateWorkspace';
  logger.log(`[${functionName}] Starting execution.`, { workspaceId, name, type });

  try {
    // Validate input
    const validationResult = UpdateWorkspaceSchema.safeParse({ workspaceId, name, type });
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      logger.error(`[${functionName}] Validation error:`, { errors: errorMessage });
      return { success: false, error: `Invalid input: ${errorMessage}` };
    }
    const validatedData = validationResult.data;

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

    // Verify that the user has access to the workspace
    await enforceWorkspaceAccess(userId, workspaceId);
    logger.log(`[${functionName}] Workspace access verified.`, { userId, workspaceId });

    // Get the workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      logger.error(`[${functionName}] Workspace not found.`, { workspaceId });
      return { success: false, error: 'Workspace not found.' };
    }

    // Update the workspace
    workspace.name = validatedData.name;
    if (validatedData.type) {
      workspace.type = validatedData.type;
    }
    await workspace.save();
    logger.log(`[${functionName}] Workspace updated.`, { workspaceId });

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error updating workspace:`, error);
    return { success: false, error: 'Failed to update workspace due to a server error.' };
  }
}
