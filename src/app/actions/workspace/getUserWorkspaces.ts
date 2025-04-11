'use server';

import { getCurrentUser } from '@/lib/auth.server';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User'; // Import User model
import { Workspace as WorkspaceModel } from '@/models/Workspace'; // Use named import and alias
import logger from '@/lib/utils/logger';
import type { UserDocument, WorkspaceDocument } from '@/lib/schemas/reportSchemas'; // Import types

// Define the shape of a workspace object returned to the client
// Ensure this matches the actual data needed and available
interface WorkspaceInfo {
  id: string;
  name: string;
  // Add other fields as needed, ensure they exist in WorkspaceDocument/WorkspaceModel
  // organizationId: string;
  // type: 'team' | 'department' | 'project';
}

// Define return type
type GetUserWorkspacesResult =
  | { success: true; workspaces: WorkspaceInfo[] }
  | { success: false; error: string };

/**
 * Server Action to get a user's associated workspaces.
 *
 * @returns {Promise<GetUserWorkspacesResult>} - Result object with workspaces array or an error.
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
    const userId = currentUser.id; // This is the Supabase ID
    logger.log(`[${functionName}] User authenticated.`, { userId });

    // Connect to the database
    await connectDB();

    // Get the user's profile from MongoDB using Supabase ID
    const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean() as UserDocument | null;
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found in DB.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Get the user's workspace IDs
    const workspaceIds = userProfile.workspaceIds || [];
    if (workspaceIds.length === 0) {
      logger.log(`[${functionName}] User has no workspaces.`, { userId });
      return { success: true, workspaces: [] };
    }

    // Fetch the actual workspace documents based on the IDs
    // Fetch the workspaces without strict casting after lean()
    const workspaces = await WorkspaceModel.find({
        '_id': { $in: workspaceIds }
    }).lean(); // Result is plain JS objects, potentially with ObjectId for _id

    logger.log(`[${functionName}] Found ${workspaces.length} workspaces for user.`);

    // Map to the desired output format (WorkspaceInfo)
    // Map to the desired output format (WorkspaceInfo), safely accessing properties
    const workspaceInfos: WorkspaceInfo[] = workspaces.map((ws: any) => {
        // Safely access properties and convert _id
        const id = ws?._id?.toString() || ''; // Handle potential ObjectId or missing _id
        const name = ws?.name || 'Untitled Workspace'; // Provide fallback
        // Add other fields required by WorkspaceInfo, ensure they exist on ws
        // const organizationId = ws?.organizationId || '';
        // const type = ws?.type || 'team';

        // Return object matching WorkspaceInfo structure
        // Ensure all required fields for WorkspaceInfo are included here
        return {
            id,
            name,
            // organizationId, // Uncomment and ensure mapping if needed
            // type: type as 'team' | 'department' | 'project', // Uncomment and ensure mapping if needed
        };
    }).filter(ws => ws.id); // Filter out any entries where ID couldn't be determined

    logger.log(`[${functionName}] Successfully fetched ${workspaceInfos.length} workspaces.`);
    return { success: true, workspaces: workspaceInfos };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error getting user workspaces:`, error);
    return { success: false, error: 'Failed to get user workspaces due to a server error.' };
  }
}
