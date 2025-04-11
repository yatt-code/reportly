'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth.server';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Organization } from '@/models/Organization';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';

// Define Zod schema for input validation
const CreateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long'),
});

// Define return type
type CreateOrganizationResult =
  | { success: true; organizationId: string }
  | { success: false; error: string };

/**
 * Server Action to create a new organization for the current user
 * 
 * @param name - The name of the organization
 * @returns {Promise<CreateOrganizationResult>} - Result object indicating success or failure
 */
export async function createOrganization(
  name: string
): Promise<CreateOrganizationResult> {
  const functionName = 'createOrganization';
  logger.log(`[${functionName}] Starting execution.`, { name });

  try {
    // Validate input
    const validationResult = CreateOrganizationSchema.safeParse({ name });
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

    // Check if the user already has an organization
    if (userProfile.organizationId) {
      logger.error(`[${functionName}] User already has an organization.`, { 
        userId, 
        organizationId: userProfile.organizationId 
      });
      return { success: false, error: 'User already has an organization.' };
    }

    // Create the organization
    const organization = new Organization({
      name: validatedData.name,
      ownerId: userProfile._id.toString(),
    });
    await organization.save();
    logger.log(`[${functionName}] Organization created.`, { organizationId: organization._id });

    // Create a default workspace
    const workspace = new Workspace({
      name: 'My Workspace',
      organizationId: organization._id.toString(),
      type: 'team',
      memberIds: [userProfile._id.toString()],
    });
    await workspace.save();
    logger.log(`[${functionName}] Default workspace created.`, { workspaceId: workspace._id });

    // Update the user with the organization and workspace
    userProfile.organizationId = organization._id.toString();
    userProfile.workspaceIds = [workspace._id.toString()];
    userProfile.activeWorkspaceId = workspace._id.toString();
    await userProfile.save();
    logger.log(`[${functionName}] User updated with organization and workspace.`, { userId });

    return { success: true, organizationId: organization._id.toString() };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error creating organization:`, error);
    return { success: false, error: 'Failed to create organization due to a server error.' };
  }
}
