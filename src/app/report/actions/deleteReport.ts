'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth'; // Import server-side user fetcher
import { ReportIdSchema } from '@/lib/schemas/reportSchemas';
// Removed assertOwnership import
import { enforceRole } from '@/lib/rbac/utils'; // Import enforceRole utility

// Define a more specific return type
type DeleteReportResult =
    | { success: true }
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to delete a report by its ID.
 * Validates input using Zod schemas.
 *
 * @param reportId - The ID of the report to delete.
 * @returns {Promise<DeleteReportResult>} - Result object indicating success or failure.
 */
export async function deleteReport(reportId: string): Promise<DeleteReportResult> {
  const functionName = 'deleteReport';
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
  const validatedReportId = validationResult.data.reportId; // Use validated ID

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    // --- Authentication & Authorization Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
// Enforce that only admins can perform this delete action
enforceRole('admin', currentUser, 'delete report');
// If enforceRole doesn't throw, the user is an admin.

// We still need to check if the report exists before attempting deletion
logger.log(`[${functionName}] Finding report before deletion (ID: ${validatedReportId})...`);
const reportExists = await Report.exists({ _id: validatedReportId });

if (!reportExists) {
    logger.warn(`[${functionName}] Report not found for deletion (ID: ${validatedReportId}).`);
    return { success: false, error: 'Report not found.' };
}
logger.log(`[${functionName}] Admin role verified. Proceeding with deletion...`);
// --- End Auth/Role Check ---
    // --- End Auth Check ---

    // Now perform the deletion
    const deleteResult = await Report.deleteOne({ _id: validatedReportId }); // Use deleteOne for better result info

    // Check if deletion was successful (deletedCount should be 1)
    if (deleteResult.deletedCount === 0) {
         // This case should ideally not be reached if findById found it, but good for safety
         logger.error(`[${functionName}] Deletion failed after ownership check (ID: ${validatedReportId}). Report might have been deleted between checks.`);
         return { success: false, error: 'Deletion failed unexpectedly.' };
    }

    // Deletion successful
    logger.log(`[${functionName}] Report deleted successfully (ID: ${validatedReportId}).`);

    // Revalidate relevant paths where the report might have been listed
    logger.log(`[${functionName}] Revalidating paths after deleting report (ID: ${validatedReportId})...`);
    // Revalidate the dashboard or any list view
    revalidatePath('/dashboard');
    // Revalidating the specific report path might not be necessary as it's gone,
    // but doesn't hurt if Next.js handles it gracefully.
    revalidatePath(`/report/${validatedReportId}`);
    logger.log(`[${functionName}] Path revalidation complete.`);

    logger.log(`[${functionName}] Finished execution successfully.`);
    return { success: true }; // No data to return on successful delete

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error deleting report (ID: ${validatedReportId}).`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // Handle specific errors like role failure from enforceRole
    if (error.message.startsWith('Forbidden:') || error.message.startsWith('Authentication required.')) {
        return { success: false, error: error.message };
    }
    if (error.name === 'CastError') {
        return { success: false, error: 'Invalid Report ID format during database operation.' };
    }
    return { success: false, error: 'Failed to delete report due to a server error.' };
  }
}

// Removed default export if not needed
// export default deleteReport;