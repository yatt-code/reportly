'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server'; // Import server-side user fetcher
import { ReportIdSchema, ReportDocument } from '@/lib/schemas/reportSchemas';
import { assertOwnership } from '@/lib/utils/assertOwnership'; // Import the utility
// import { saveReport } from './saveReport'; // Keep commented unless Option 2 is chosen

// Define a more specific return type
type DuplicateReportResult =
    | { success: true; newReport: any } // Consider defining a proper Report type
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to duplicate an existing report by its ID.
 * Creates a new report with content copied from the original,
 * potentially modifying the title and resetting AI fields.
 * @param reportId - The ID of the report to duplicate.
 * @returns {Promise<DuplicateReportResult>} - Result object indicating success or failure. The new report's ownership is assigned to the current authenticated user.
 */
// Remove newUserId parameter, get it from session instead
export async function duplicateReport(reportId: string): Promise<DuplicateReportResult> {
    const functionName = 'duplicateReport';
    logger.log(`[${functionName}] Starting execution.`, { reportId });

    // --- Input Validation ---
    const idValidationResult = ReportIdSchema.safeParse({ reportId });
    if (!idValidationResult.success) {
        logger.error(`[${functionName}] Invalid reportId format.`, { reportId, issues: idValidationResult.error.issues });
        return { success: false, error: 'Invalid Report ID format.', issues: idValidationResult.error.issues };
    }
    const validatedReportId = idValidationResult.data.reportId;

    // --- Authentication & Authorization Check ---
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

        logger.log(`[${functionName}] Finding original report (ID: ${validatedReportId})...`);
        // Find the original report and cast its type
        const originalReport = await Report.findById(validatedReportId).lean() as ReportDocument | null;

        if (!originalReport) {
            logger.error(`[${functionName}] Original report not found (ID: ${validatedReportId}).`);
            return { success: false, error: 'Original report not found.' };
        }

        // --- Ownership Check for Original Report ---
        // Use the assertOwnership utility
        assertOwnership(originalReport, currentUserId, 'duplicate');
        // If assertOwnership doesn't throw, we can proceed
        logger.log(`[${functionName}] Ownership of original report verified.`);
        // --- End Ownership Check ---

        logger.log(`[${functionName}] Creating duplicate report...`);

        // Create payload for the new report
        const newReportPayload = {
            // Copy relevant fields
            title: `Copy of ${originalReport.title}`, // Modify title
            content: originalReport.content,
            groupId: originalReport.groupId, // Keep the same group? Or assign based on new user? Needs clarification.
            // Assign the new user
            userId: currentUserId, // Assign to the currently authenticated user
            // Reset AI fields for the new copy
            ai_summary: '',
            ai_tags: [],
            aiMeta: {},
            // Timestamps will be set automatically by Mongoose
        };

        // Option 1: Simple save (doesn't trigger AI pipelines defined in saveReport)
        const newReport = new Report(newReportPayload);
        const savedDuplicate = await newReport.save();

        // Option 2: Use saveReport if duplication should trigger AI pipelines
        // This requires saveReport to handle 'create' based on payload without reportId
        // const saveResult = await saveReport({
        //     title: newReportPayload.title,
        //     content: newReportPayload.content,
        //     userId: newReportPayload.userId,
        //     groupId: newReportPayload.groupId,
        // });
        // if (!saveResult.success) {
        //     throw new Error(saveResult.error || 'Failed to save duplicate via saveReport');
        // }
        // const savedDuplicate = saveResult.report;

        logger.log(`[${functionName}] Duplicate report created successfully (New ID: ${savedDuplicate._id}).`);

        // Revalidate paths
        revalidatePath('/dashboard'); // Update dashboard list

        logger.log(`[${functionName}] Finished execution successfully.`);
        return { success: true, newReport: JSON.parse(JSON.stringify(savedDuplicate)) };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error duplicating report (Original ID: ${validatedReportId}).`, error);
        logger.log(`[${functionName}] Finished execution with error.`);
        // Handle specific errors like ownership failure from assertOwnership
        if (error.message.startsWith('Forbidden:')) {
            return { success: false, error: error.message };
        }
        if (error.name === 'ValidationError') {
            return { success: false, error: `Database validation failed for duplicate: ${error.message}` };
        }
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid ID format during database operation.' };
        }
        return { success: false, error: 'Failed to duplicate report due to a server error.' };
    }
}

// Note: Authorization check added - only owner can duplicate.
// Note: Clarify if the groupId should be copied or determined by the new user.