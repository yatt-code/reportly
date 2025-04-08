'use server';

import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger'; // Assuming logger exists
import { revalidatePath } from 'next/cache'; // To update UI after update

/**
 * Server Action to update an existing report by its ID.
 * Note: This provides a generic update. For specific updates like adding comments,
 * dedicated actions might be better. This does NOT re-run AI pipelines.
 * Use saveReport for updates that should trigger AI.
 *
 * @param {string} reportId - The ID of the report to update.
 * @param {object} updatedFields - An object containing the fields to update.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>} - Result object.
 */
export async function updateReport(reportId, updatedFields) {
  const functionName = 'updateReport';
  logger.log(`[${functionName}] Starting execution.`, { reportId });

  // Basic validation
  if (!reportId) {
    logger.error(`[${functionName}] Validation failed: Missing reportId.`);
    return { success: false, error: 'Report ID is required.' };
  }
  if (!updatedFields || typeof updatedFields !== 'object' || Object.keys(updatedFields).length === 0) {
    logger.error(`[${functionName}] Validation failed: updatedFields is missing or empty.`, { updatedFields });
    return { success: false, error: 'Updated fields are required and must be a non-empty object.' };
  }

  // Optional: Add more specific validation based on Report schema fields allowed for update
  // e.g., prevent updating userId, groupId, ai_ fields directly here.

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    logger.log(`[${functionName}] Attempting to update report (ID: ${reportId})...`, { fields: Object.keys(updatedFields) });
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { $set: updatedFields }, // Use $set to update only specified fields
      { new: true, runValidators: true } // Return the updated document, run schema validators
    ).lean(); // Use lean for performance

    if (!updatedReport) {
      logger.error(`[${functionName}] Report update failed: Report not found (ID: ${reportId}).`);
      return { success: false, error: 'Report not found for update.' };
    }

    logger.log(`[${functionName}] Report updated successfully (ID: ${reportId}).`);

    // Revalidate relevant paths
    logger.log(`[${functionName}] Revalidating paths for report (ID: ${reportId})...`);
    revalidatePath(`/report/${reportId}`); // Specific report page
    revalidatePath('/dashboard'); // Dashboard potentially lists reports
    logger.log(`[${functionName}] Path revalidation complete.`);


    logger.log(`[${functionName}] Finished execution successfully.`);
    // Ensure data is serializable
    return { success: true, data: JSON.parse(JSON.stringify(updatedReport)) };

  } catch (error) {
    logger.error(`[${functionName}] Error updating report (ID: ${reportId}).`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    if (error.name === 'ValidationError') {
        return { success: false, error: `Validation failed: ${error.message}` };
    }
    if (error.name === 'CastError') {
        return { success: false, error: 'Invalid Report ID format.' };
    }
    return { success: false, error: 'Failed to update report due to a server error.' };
  }
}

// Exporting default for consistency
export default updateReport;