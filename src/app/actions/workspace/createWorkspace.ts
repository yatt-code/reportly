'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import { Organization } from '@/models/Organization';
import logger from '@/lib/utils/logger';

// Define Zod schema for input validation
const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Workspace name is too long'),
  type: z.enum(['team', 'department', 'project']).default('team'),
});

// Define return type
type CreateWorkspaceResult =
  | { success: true; workspaceId: string }
  | { success: false; error: string };

/**
 * Server Action to create a new workspace
 * 
 * @param name - The name of the workspace
 * @param type - The type of the workspace (team, department, project)
 * @returns {Promise<CreateWorkspaceResult>} - Result object indicating success or failure
 */
export async function createWorkspace(
  name: string,
  type: 'team' | 'department' | 'project' = 'team'
): Promise<CreateWorkspaceResult> {
  const functionName = 'createWorkspace';
  logger.log(`[${functionName}] Starting execution.`, { name, type });

  try {
    // Validate input
    const validationResult = CreateWorkspaceSchema.safeParse({ name, type });
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

    // Get the user's profile from MongoDB
    const userProfile = await User.findOne({ supabaseUserId: userId });
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Get the user's organization
    if (!userProfile.organizationId) {
      logger.error(`[${functionName}] User has no organization.`, { userId });
      return { success: false, error: 'User has no organization. Please create an organization first.' };
    }

    // Verify that the organization exists
    const organization = await Organization.findById(userProfile.organizationId);
    if (!organization) {
      logger.error(`[${functionName}] Organization not found.`, { organizationId: userProfile.organizationId });
      return { success: false, error: 'Organization not found.' };
    }

    // Create the new workspace
    const workspace = new Workspace({
      name: validatedData.name,
      organizationId: userProfile.organizationId,
      type: validatedData.type,
      memberIds: [userProfile._id.toString()],
    });
    await workspace.save();
    logger.log(`[${functionName}] Workspace created.`, { workspaceId: workspace._id });

    // Add the workspace to the user's workspaces
    userProfile.workspaceIds = [...(userProfile.workspaceIds || []), workspace._id.toString()];
    
    // If this is the user's first workspace, set it as active
    if (!userProfile.activeWorkspaceId) {
      userProfile.activeWorkspaceId = workspace._id.toString();
    }
    
    await userProfile.save();
    logger.log(`[${functionName}] User updated with new workspace.`, { userId });

    return { success: true, workspaceId: workspace._id.toString() };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error creating workspace:`, error);
    return { success: false, error: 'Failed to create workspace due to a server error.' };
  }
}
