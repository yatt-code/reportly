'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { ReportIdSchema, ReportDocument } from '@/lib/schemas/reportSchemas'; // Import Zod schema AND ReportDocument type
// import { saveReport } from './saveReport'; // Keep commented unless Option 2 is chosen

// Define a more specific return type
type DuplicateReportResult =
    | { success: true; newReport: any } // Consider defining a proper Report type
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to duplicate an existing report by its ID.
 * Creates a new report with content copied from the original,
 * potentially modifying the title and resetting AI fields.
 *
 * @param reportId - The ID of the report to duplicate.
 * @param newUserId - The ID of the user creating the duplicate (should come from session).
 * @returns {Promise<DuplicateReportResult>} - Result object indicating success or failure.
 */
export async function duplicateReport(reportId: string, newUserId: string): Promise<DuplicateReportResult> {
    const functionName = 'duplicateReport';
    logger.log(`[${functionName}] Starting execution.`, { reportId, newUserId });

    // --- Input Validation ---
    const idValidationResult = ReportIdSchema.safeParse({ reportId });
    // Basic validation for newUserId (use ObjectIdSchema if it's a Mongo ID)
    const userIdValidationResult = z.string().min(1).safeParse(newUserId); // Adjust if needed

    if (!idValidationResult.success || !userIdValidationResult.success) {
        const issues = [
            ...(idValidationResult.success ? [] : idValidationResult.error.issues),
            ...(userIdValidationResult.success ? [] : userIdValidationResult.error.issues),
        ];
        logger.error(`[${functionName}] Invalid input format.`, { reportId, newUserId, issues });
        return { success: false, error: 'Invalid Report ID or User ID format.', issues };
    }
    const validatedReportId = idValidationResult.data.reportId;
    const validatedUserId = userIdValidationResult.data;

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

        logger.log(`[${functionName}] Creating duplicate report...`);

        // Create payload for the new report
        const newReportPayload = {
            // Copy relevant fields
            title: `Copy of ${originalReport.title}`, // Modify title
            content: originalReport.content,
            groupId: originalReport.groupId, // Keep the same group? Or assign based on new user? Needs clarification.
            // Assign the new user
            userId: validatedUserId,
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
        logger.error(`[${functionName}] Error duplicating report (ID: ${validatedReportId}).`, error);
        logger.log(`[${functionName}] Finished execution with error.`);
        if (error.name === 'ValidationError') {
            return { success: false, error: `Database validation failed for duplicate: ${error.message}` };
        }
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid ID format during database operation.' };
        }
        return { success: false, error: 'Failed to duplicate report due to a server error.' };
    }
}

// Note: Consider authorization logic - who is allowed to duplicate which reports?
// Note: Clarify if the groupId should be copied or determined by the new user.