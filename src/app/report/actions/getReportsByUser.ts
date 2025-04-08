'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
import logger from '@/lib/utils/logger';
import { UserIdSchema } from '@/lib/schemas/reportSchemas'; // Import Zod schema

// Define a more specific return type
// Consider defining a proper Report type based on your model
type GetReportsByUserResult =
    | { success: true; data: any[] }
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to fetch all reports for a specific user.
 * Optionally supports pagination or further filtering in the future.
 *
 * @param userId - The ID of the user whose reports are to be fetched.
 * @returns {Promise<GetReportsByUserResult>} - Result object indicating success or failure.
 */
export async function getReportsByUser(userId: string): Promise<GetReportsByUserResult> {
    const functionName = 'getReportsByUser';
    logger.log(`[${functionName}] Starting execution.`, { userId });

    // --- Input Validation ---
    const validationResult = UserIdSchema.safeParse({ userId });
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid userId format.`, {
            userId,
            issues: validationResult.error.issues,
        });
        return { success: false, error: 'Invalid User ID format.', issues: validationResult.error.issues };
    }
    const validatedUserId = validationResult.data.userId; // Use validated ID

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        logger.log(`[${functionName}] Fetching reports for user (ID: ${validatedUserId})...`);
        // Fetch reports filtered by userId, sorted by creation date descending
        const reports = await Report.find({ userId: validatedUserId })
            .sort({ createdAt: -1 })
            .lean(); // Use lean for performance

        logger.log(`[${functionName}] Found ${reports.length} reports for user (ID: ${validatedUserId}).`);

        logger.log(`[${functionName}] Finished execution successfully.`);
        // Ensure data is serializable
        return { success: true, data: JSON.parse(JSON.stringify(reports)) };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching reports for user (ID: ${validatedUserId}).`, error);
        logger.log(`[${functionName}] Finished execution with error.`);
        // CastError less likely with Zod, but check just in case
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid User ID format during database operation.' };
        }
        return { success: false, error: 'Failed to fetch user reports due to a server error.' };
    }
}

// Note: In a real application, the userId should ideally come from the authenticated session
// on the server-side, not passed directly from the client, to prevent users from fetching
// other users' reports. This implementation assumes the caller handles authorization.