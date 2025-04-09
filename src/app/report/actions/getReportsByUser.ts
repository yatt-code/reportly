'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth'; // Import server-side user fetcher
// Remove UserIdSchema import as we get ID from session
// import { UserIdSchema } from '@/lib/schemas/reportSchemas';

// Define a more specific return type
// Consider defining a proper Report type based on your model
type GetReportsByUserResult =
    | { success: true; data: any[] }
    | { success: false; error: string }; // Removed issues as input validation is removed

/**
 * Server Action to fetch all reports for the currently authenticated user.
 * Optionally supports pagination or further filtering in the future.
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

        logger.log(`[${functionName}] Fetching reports for user (ID: ${currentUserId})...`);
        // Fetch reports filtered by the authenticated userId
        const reports = await Report.find({ userId: currentUserId })
            .sort({ createdAt: -1 })
            .lean();

        logger.log(`[${functionName}] Found ${reports.length} reports for user (ID: ${currentUserId}).`);

        logger.log(`[${functionName}] Finished execution successfully.`);
        // Ensure data is serializable
        return { success: true, data: JSON.parse(JSON.stringify(reports)) };

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