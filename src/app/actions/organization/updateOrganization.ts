'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth.server';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Organization } from '@/models/Organization';
import logger from '@/lib/utils/logger';

// Define Zod schema for input validation
const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long'),
});

// Define return type
type UpdateOrganizationResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action to update the current user's organization
 * 
 * @param name - The new name for the organization
 * @returns {Promise<UpdateOrganizationResult>} - Result object indicating success or failure
 */
export async function updateOrganization(
  name: string
): Promise<UpdateOrganizationResult> {
  const functionName = 'updateOrganization';
  logger.log(`[${functionName}] Starting execution.`, { name });

  try {
    // Validate input
    const validationResult = UpdateOrganizationSchema.safeParse({ name });
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
    const userProfile = await User.findOne({ supabaseUserId: userId }).lean();
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Check if the user has an organization
    if (!userProfile.organizationId) {
      logger.error(`[${functionName}] User has no organization.`, { userId });
      return { success: false, error: 'User has no organization.' };
    }

    // Get the organization
    const organization = await Organization.findById(userProfile.organizationId);
    if (!organization) {
      logger.error(`[${functionName}] Organization not found.`, { organizationId: userProfile.organizationId });
      return { success: false, error: 'Organization not found.' };
    }

    // Check if the user is the owner of the organization
    if (organization.ownerId !== userProfile._id.toString()) {
      logger.error(`[${functionName}] User is not the owner of the organization.`, { 
        userId, 
        organizationId: organization._id 
      });
      return { success: false, error: 'Only the organization owner can update the organization.' };
    }

    // Update the organization
    organization.name = validatedData.name;
    await organization.save();

    logger.log(`[${functionName}] Successfully updated organization.`, { organizationId: organization._id });
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error updating organization:`, error);
    return { success: false, error: 'Failed to update organization due to a server error.' };
  }
}
