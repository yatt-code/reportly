'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server';
import { assertOwnership } from '@/lib/utils/assertOwnership';
import type { ReportDocument } from '@/lib/schemas/reportSchemas'; // For type hinting

// Define a more specific return type
type DeleteReportResult =
    | { success: true }
    | { success: false; error: string };

/**
 * Server Action to delete a report by its ID.
 * Validates input using Zod schemas.
 *
 * @param reportId - The ID of the report to delete.
 * @returns {Promise<DeleteReportResult>} - Result object indicating success or failure.
 */
export async function deleteReport(reportId: string): Promise<DeleteReportResult> {
    const functionName = 'deleteReport';
    logger.log(`[${functionName}] Attempting to delete report with ID: ${reportId}`);

    // Basic input validation
    if (!reportId || typeof reportId !== 'string') {
        logger.warn(`[${functionName}] Invalid input: reportId is missing or not a string.`);
        return { success: false, error: 'Invalid report ID provided.' };
    }

    try {
        // --- Authentication Check ---
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            logger.error(`[${functionName}] Unauthorized: No user session found.`);
            return { success: false, error: 'Authentication required.' };
        }
        const currentUserId = currentUser.id;
        logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });

        // --- Database Connection ---
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        // --- Fetch Report ---
        const report = await Report.findById(reportId).lean() as ReportDocument | null;
        if (!report) {
            logger.warn(`[${functionName}] Report not found (ID: ${reportId}).`);
            return { success: false, error: 'Report not found.' };
        }
        logger.log(`[${functionName}] Found report to delete (ID: ${reportId}).`);

        // --- Authorization (Ownership Check) ---
        // assertOwnership will throw an error if the check fails (e.g., user is not owner).
        assertOwnership(report, currentUserId, 'delete');
        logger.log(`[${functionName}] Ownership verified for report (ID: ${reportId}, UserID: ${currentUserId}).`);

        // --- Delete Report ---
        await Report.findByIdAndDelete(reportId);
        logger.log(`[${functionName}] Report successfully deleted from database (ID: ${reportId}).`);

        // --- Revalidate Paths ---
        revalidatePath('/dashboard');
        revalidatePath(`/report/${reportId}`); // Revalidating the specific report path
        logger.log(`[${functionName}] Paths revalidated: /dashboard, /report/${reportId}`);

        logger.log(`[${functionName}] Finished execution successfully.`);
        return { success: true };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error during report deletion (ID: ${reportId})`, error);

        if (error.message.startsWith('Forbidden:')) { // Specific error from assertOwnership
            return { success: false, error: error.message };
        }
        if (error.name === 'CastError') { // Mongoose CastError if reportId format is invalid for DB lookup
            logger.warn(`[${functionName}] Invalid report ID format during database operation (ID: ${reportId}).`, error);
            return { success: false, error: 'Invalid report ID format.' };
        }
        return { success: false, error: 'Failed to delete report due to a server error.' };
    }
}