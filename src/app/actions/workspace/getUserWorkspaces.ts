'use server';

import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';

// Define the shape of a workspace object
interface WorkspaceInfo {
  id: string;
  name: string;
  organizationId: string;
  type: 'team' | 'department' | 'project';
}

// Define return type
type GetUserWorkspacesResult =
  | { success: true; workspaces: WorkspaceInfo[] }
  | { success: false; error: string };

/**
 * Server Action to get a user's workspaces
 * 
 * @returns {Promise<GetUserWorkspacesResult>} - Result object with workspaces array or an error
 */
export async function getUserWorkspaces(): Promise<GetUserWorkspacesResult> {
  const functionName = 'getUserWorkspaces';
  logger.log(`[${functionName}] Starting execution.`);

  try {
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
    const userProfile = await User.findOne({ supabaseUserId: userId }).lean();
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Get the user's workspaces
    const workspaceIds = userProfile.workspaceIds || [];
    if (workspaceIds.length === 0) {
      logger.log(`[${functionName}] User has no workspaces.`, { userId });
      return { success: true, workspaces: [] };
    }

    // Fetch the workspaces
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).lean();
    
    // Map to the expected format
    const workspaceInfos: WorkspaceInfo[] = workspaces.map(ws => ({
      id: ws._id.toString(),
      name: ws.name,
      organizationId: ws.organizationId,
      type: ws.type as 'team' | 'department' | 'project',
    }));

    logger.log(`[${functionName}] Successfully fetched ${workspaceInfos.length} workspaces.`);
    return { success: true, workspaces: workspaceInfos };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error getting user workspaces:`, error);
    return { success: false, error: 'Failed to get user workspaces due to a server error.' };
  }
}
