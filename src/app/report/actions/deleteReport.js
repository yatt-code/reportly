'use server';

import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger'; // Assuming logger exists
import { revalidatePath } from 'next/cache'; // To update UI after delete

/**
 * Server Action to delete a report by its ID.
 *
 * @param {string} reportId - The ID of the report to delete.
 * @returns {Promise<{success: boolean, error?: string}>} - Result object.
 */
export async function deleteReport(reportId) {
  const functionName = 'deleteReport';
  logger.log(`[${functionName}] Starting execution.`, { reportId });

  // Basic validation
  if (!reportId) {
    logger.error(`[${functionName}] Validation failed: Missing reportId.`);
    return { success: false, error: 'Report ID is required.' };
  }

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    logger.log(`[${functionName}] Attempting to delete report (ID: ${reportId})...`);
    const deletedReport = await Report.findByIdAndDelete(reportId);

    if (!deletedReport) {
      // If the report was already deleted, arguably this isn't an error from the user's perspective.
      // However, logging it as a warning or error internally might be useful.
      logger.warn(`[${functionName}] Report deletion attempt failed: Report not found (ID: ${reportId}). Might have been already deleted.`);
      // Returning success: false might be confusing if the goal (report is gone) is achieved.
      // Let's return success: true but maybe indicate it wasn't found. Or stick to error for simplicity.
      return { success: false, error: 'Report not found for deletion.' };
    }

    logger.log(`[${functionName}] Report deleted successfully (ID: ${reportId}).`);

    // Revalidate relevant paths where the report might have been listed
    logger.log(`[${functionName}] Revalidating paths after deleting report (ID: ${reportId})...`);
    // Revalidate the dashboard or any list view
    revalidatePath('/dashboard');
    // Revalidating the specific report path might not be necessary as it's gone,
    // but doesn't hurt if Next.js handles it gracefully.
    revalidatePath(`/report/${reportId}`);
    logger.log(`[${functionName}] Path revalidation complete.`);

    logger.log(`[${functionName}] Finished execution successfully.`);
    return { success: true }; // No data to return on successful delete

  } catch (error) {
    logger.error(`[${functionName}] Error deleting report (ID: ${reportId}).`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    if (error.name === 'CastError') {
        return { success: false, error: 'Invalid Report ID format.' };
    }
    return { success: false, error: 'Failed to delete report due to a server error.' };
  }
}

// Exporting default for consistency
export default deleteReport;