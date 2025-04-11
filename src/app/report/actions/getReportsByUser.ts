'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import User from '@/models/User';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server';
import { getReportsByWorkspace } from './getReportsByWorkspace';
import type { UserDocument } from '@/lib/schemas/reportSchemas'; // Import UserDocument type

// Define a more specific return type
// Consider defining a proper Report type based on your model
type GetReportsByUserResult =
    | { success: true; data: any[] }
    | { success: false; error: string }; // Removed issues as input validation is removed

/**
 * Server Action to fetch all reports for the currently authenticated user in their active workspace.
 * If no active workspace is set, it fetches reports from the user's first workspace.
 *
 * @returns {Promise<GetReportsByUserResult>} - Result object indicating success or failure.
 */
export async function getReportsByUser(): Promise<GetReportsByUserResult> {
    const functionName = 'getReportsByUser';
    logger.log(`[${functionName}] Starting execution.`);

    // --- Authentication Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });
    // --- End Auth Check ---

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        // Get the user's profile to find their active workspace
        // Cast the result to UserDocument
        const userProfile = await User.findOne({ supabaseUserId: currentUserId }).lean() as UserDocument | null;
        if (!userProfile) {
            logger.error(`[${functionName}] User profile not found.`, { userId: currentUserId });
            return { success: false, error: 'User profile not found.' };
        }

        // Get the active workspace ID or use the first workspace if no active workspace is set
        const activeWorkspaceId = userProfile.activeWorkspaceId ||
            (userProfile.workspaceIds && userProfile.workspaceIds.length > 0 ?
                userProfile.workspaceIds[0] : null);

        // If no workspace is available, return an empty array
        if (!activeWorkspaceId) {
            logger.warn(`[${functionName}] No active workspace found for user.`, { userId: currentUserId });
            return { success: true, data: [] };
        }

        logger.log(`[${functionName}] Using active workspace (ID: ${activeWorkspaceId})...`);

        // Use the getReportsByWorkspace action to fetch reports for the active workspace
        const result = await getReportsByWorkspace(activeWorkspaceId);

        if (!result.success) {
            logger.error(`[${functionName}] Error fetching reports from workspace.`, {
                workspaceId: activeWorkspaceId,
                error: result.error
            });
            return { success: false, error: result.error };
        }

        logger.log(`[${functionName}] Found ${result.data.length} reports in workspace (ID: ${activeWorkspaceId}).`);
        logger.log(`[${functionName}] Finished execution successfully.`);

        return { success: true, data: result.data };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching reports for user (ID: ${currentUserId}).`, error);
        logger.log(`[${functionName}] Finished execution with error.`);
        // CastError check might still be relevant if DB interaction fails unexpectedly
        if (error.name === 'CastError') {
             return { success: false, error: 'Database interaction failed with invalid ID format.' };
        }
        return { success: false, error: 'Failed to fetch user reports due to a server error.' };
    }
}

// Note: This action now correctly uses the authenticated user ID from the session.