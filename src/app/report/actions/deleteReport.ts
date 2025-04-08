'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { ReportIdSchema } from '@/lib/schemas/reportSchemas'; // Import Zod schema

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

    logger.log(`[${functionName}] Attempting to delete report (ID: ${validatedReportId})...`);
    const deletedReport = await Report.findByIdAndDelete(validatedReportId);

    if (!deletedReport) {
      // If the report was already deleted, arguably this isn't an error from the user's perspective.
      // However, logging it as a warning or error internally might be useful.
      logger.warn(`[${functionName}] Report deletion attempt failed: Report not found (ID: ${validatedReportId}). Might have been already deleted.`);
      // Returning success: false might be confusing if the goal (report is gone) is achieved.
      // Let's return success: true but maybe indicate it wasn't found. Or stick to error for simplicity.
      return { success: false, error: 'Report not found for deletion.' };
    }

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
    // CastError less likely with Zod, but keep as fallback
    if (error.name === 'CastError') {
        return { success: false, error: 'Invalid Report ID format during database operation.' };
    }
    return { success: false, error: 'Failed to delete report due to a server error.' };
  }
}

// Removed default export if not needed
// export default deleteReport;