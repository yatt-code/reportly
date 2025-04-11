'use server';

import { getCurrentUser } from '@/lib/auth.server';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User'; // Use default import for User model
import { Organization as OrganizationModel } from '@/models/Organization'; // Use named import for Organization model
import logger from '@/lib/utils/logger';
import type { UserDocument, OrganizationDocument } from '@/lib/schemas/reportSchemas'; // Import types

// Define return type (consider creating a specific OrgInfo type)
type GetOrganizationResult =
  | { success: true; data: any } // Replace 'any' with a specific OrgInfo type later
  | { success: false; error: string };

/**
 * Server Action to get the current user's organization details.
 * Assumes a user belongs to only one organization via userProfile.organizationId.
 *
 * @returns {Promise<GetOrganizationResult>} - Result object with organization data or an error.
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
    const userId = currentUser.id; // Supabase ID
    logger.log(`[${functionName}] User authenticated.`, { userId });

    // Connect to the database
    await connectDB();

    // Get the user's profile from MongoDB using Supabase ID
    const userProfile = await UserModel.findOne({ supabaseUserId: userId }).lean() as UserDocument | null;
    if (!userProfile) {
      logger.error(`[${functionName}] User profile not found in DB.`, { userId });
      return { success: false, error: 'User profile not found.' };
    }

    // Check if the user has an organizationId
    const orgId = userProfile.organizationId; // Use the field from UserDocument
    if (!orgId) {
      logger.warn(`[${functionName}] User has no organization assigned.`, { userId });
      // Decide return value: error or success with null/empty data?
      // Returning error for now, as the action implies fetching *the* organization.
      return { success: false, error: 'User is not associated with an organization.' };
    }

    // Get the organization details
    const organization = await OrganizationModel.findById(orgId).lean() as OrganizationDocument | null;
    if (!organization) {
      logger.error(`[${functionName}] Organization not found in DB.`, { organizationId: orgId, userId });
      // This might indicate data inconsistency if userProfile had an ID but org doesn't exist
      return { success: false, error: 'Organization associated with user not found.' };
    }

    // Get the member count (querying Users collection based on organizationId)
    // Ensure the field name matches the User model ('organizationId' vs 'orgId' etc.)
    const memberCount = await UserModel.countDocuments({ organizationId: orgId });

    // Return the organization data
    const organizationData = {
      id: organization._id?.toString() || '', // Safely access and convert _id
      name: organization.name,
      ownerId: organization.ownerId,
      memberCount,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      // Add other fields from OrganizationDocument as needed
    };

    logger.log(`[${functionName}] Successfully fetched organization.`, { organizationId: organizationData.id });
    return { success: true, data: organizationData };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error getting organization:`, error);
    return { success: false, error: 'Failed to get organization due to a server error.' };
  }
}
