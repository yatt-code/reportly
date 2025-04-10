import { User } from '@supabase/supabase-js';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';

/**
 * Checks if a user has access to a specific workspace
 * 
 * @param userId - The Supabase user ID
 * @param workspaceId - The workspace ID to check access for
 * @returns True if the user has access, false otherwise
 */
export async function hasWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const functionName = 'hasWorkspaceAccess';
  
  try {
    // Connect to the database
    await connectDB();
    
    // Get the user's profile
    const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean();
    if (!userProfile) {
      logger.warn(`[${functionName}] User profile not found`, { userId });
      return false;
    }
    
    // Check if the user has access to the workspace
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) {
      logger.warn(`[${functionName}] Workspace not found`, { workspaceId });
      return false;
    }
    
    // Check if the user is a member of the workspace
    return workspace.memberIds.includes(userProfile._id.toString());
  } catch (error) {
    logger.error(`[${functionName}] Error checking workspace access`, { userId, workspaceId, error });
    return false;
  }
}

/**
 * Enforces that a user has access to a specific workspace
 * Throws an error if the user does not have access
 * 
 * @param userId - The Supabase user ID
 * @param workspaceId - The workspace ID to check access for
 * @throws Error if the user does not have access
 */
export async function enforceWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<void> {
  const hasAccess = await hasWorkspaceAccess(userId, workspaceId);
  
  if (!hasAccess) {
    throw new Error('You do not have access to this workspace');
  }
}

/**
 * Checks if a user has a specific role in a workspace
 * 
 * @param userId - The Supabase user ID
 * @param workspaceId - The workspace ID to check role for
 * @param role - The role to check for
 * @returns True if the user has the role, false otherwise
 */
export async function hasWorkspaceRole(
  userId: string,
  workspaceId: string,
  role: string
): Promise<boolean> {
  // First check if the user has access to the workspace
  const hasAccess = await hasWorkspaceAccess(userId, workspaceId);
  if (!hasAccess) {
    return false;
  }
  
  // TODO: Implement role-based checks when workspace roles are added
  // For now, just check if the user has access to the workspace
  return true;
}

/**
 * Enforces that a user has a specific role in a workspace
 * Throws an error if the user does not have the role
 * 
 * @param userId - The Supabase user ID
 * @param workspaceId - The workspace ID to check role for
 * @param role - The role to check for
 * @throws Error if the user does not have the role
 */
export async function enforceWorkspaceRole(
  userId: string,
  workspaceId: string,
  role: string
): Promise<void> {
  const hasRole = await hasWorkspaceRole(userId, workspaceId, role);
  
  if (!hasRole) {
    throw new Error(`You do not have the required role (${role}) in this workspace`);
  }
}
