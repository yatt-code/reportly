'use server';

import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Organization } from '@/models/Organization';
import logger from '@/lib/utils/logger';

// Define return type
type GetOrganizationResult =
  | { success: true; data: any }
  | { success: false; error: string };

/**
 * Server Action to get the current user's organization
 * 
 * @returns {Promise<GetOrganizationResult>} - Result object with organization data or an error
 */
export async function getOrganization(): Promise<GetOrganizationResult> {
  const functionName = 'getOrganization';
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

    // Check if the user has an organization
    if (!userProfile.organizationId) {
      logger.error(`[${functionName}] User has no organization.`, { userId });
      return { success: false, error: 'User has no organization.' };
    }

    // Get the organization
    const organization = await Organization.findById(userProfile.organizationId).lean();
    if (!organization) {
      logger.error(`[${functionName}] Organization not found.`, { organizationId: userProfile.organizationId });
      return { success: false, error: 'Organization not found.' };
    }

    // Get the member count
    const memberCount = await User.countDocuments({ organizationId: organization._id.toString() });

    // Return the organization data
    const organizationData = {
      id: organization._id.toString(),
      name: organization.name,
      ownerId: organization.ownerId,
      memberCount,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };

    logger.log(`[${functionName}] Successfully fetched organization.`, { organizationId: organization._id });
    return { success: true, data: organizationData };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error getting organization:`, error);
    return { success: false, error: 'Failed to get organization due to a server error.' };
  }
}
