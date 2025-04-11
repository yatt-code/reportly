'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server'; // Import server-side user fetcher
import { ReportIdSchema, ReportDocument } from '@/lib/schemas/reportSchemas';
import { assertOwnership } from '@/lib/utils/assertOwnership'; // Import the utility

// Define a more specific return type
type GetReportByIdResult =
    | { success: true; data: ReportDocument | null } // Return null if not found, ReportDocument if found & owned
    | { success: false; error: string; issues?: z.ZodIssue[]; forbidden?: boolean };

/**
 * Server Action to fetch a single report by its ID, ensuring user ownership.
 *
 * @param reportId - The ID of the report to fetch.
 * @returns {Promise<GetReportByIdResult>} - Result object containing the report or an error.
 */
export async function getReportById(reportId: string): Promise<GetReportByIdResult> {
    const functionName = 'getReportById';
    logger.log(`[${functionName}] Starting execution.`, { reportId });

    // --- Input Validation ---
    const validationResult = ReportIdSchema.safeParse({ reportId });
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid reportId format.`, {
            reportId,
            issues: validationResult.error.issues,
        });
        return { success: false, error: 'Invalid Report ID format.', issues: validationResult.error.issues };
    }
    const validatedReportId = validationResult.data.reportId;

    // --- Authentication & Authorization Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        // Return forbidden specifically for auth failure
        return { success: false, error: 'Authentication required.', forbidden: true };
    }
    const currentUserId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        logger.log(`[${functionName}] Fetching report (ID: ${validatedReportId})...`);
        const report = await Report.findById(validatedReportId).lean() as ReportDocument | null;

        if (!report) {
            logger.warn(`[${functionName}] Report not found (ID: ${validatedReportId}).`);
            return { success: true, data: null }; // Report doesn't exist, return null data
        }

        // --- Ownership Check ---
        // Use the assertOwnership utility
        assertOwnership(report, currentUserId, 'view');
        // If assertOwnership doesn't throw, we can proceed
        // --- End Ownership Check ---

        logger.log(`[${functionName}] Report found and ownership verified (ID: ${validatedReportId}).`);
        logger.log(`[${functionName}] Finished execution successfully.`);
        // Ensure data is serializable (lean helps)
        return { success: true, data: JSON.parse(JSON.stringify(report)) };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching report (ID: ${validatedReportId}).`, error);
        logger.log(`[${functionName}] Finished execution with error.`);
        // Handle specific errors like ownership failure from assertOwnership
        if (error.message.startsWith('Forbidden:')) {
            return { success: false, error: error.message, forbidden: true }; // Keep forbidden flag
        }
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid Report ID format during database operation.' };
        }
        return { success: false, error: 'Failed to fetch report due to a server error.' };
    }
}