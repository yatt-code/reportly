'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
import logger from '@/lib/utils/logger';
import { ReportIdSchema, GenericUpdateReportSchema, GenericUpdateReportInput } from '@/lib/schemas/reportSchemas'; // Import Zod schemas

// Define a more specific return type
type UpdateReportResult =
    | { success: true; data: any } // Consider defining a proper Report type
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to update specific fields of an existing report by its ID.
 * This action does NOT trigger AI pipelines (use saveReport for that).
 * Validates input using Zod schemas.
 *
 * @param reportId - The ID of the report to update.
 * @param updatedFields - An object containing the fields to update (must match GenericUpdateReportSchema).
 * @returns {Promise<UpdateReportResult>} - Result object indicating success or failure.
 */
export async function updateReport(
    reportId: string,
    updatedFields: GenericUpdateReportInput
): Promise<UpdateReportResult> {
  const functionName = 'updateReport';
  logger.log(`[${functionName}] Starting execution.`, { reportId });

  // --- Input Validation ---
  // 1. Validate reportId separately
  const idValidationResult = ReportIdSchema.safeParse({ reportId });
  if (!idValidationResult.success) {
    logger.error(`[${functionName}] Invalid reportId format.`, {
        reportId,
        issues: idValidationResult.error.issues,
    });
    return { success: false, error: 'Invalid Report ID format.', issues: idValidationResult.error.issues };
  }
  const validatedReportId = idValidationResult.data.reportId; // Use validated ID

  // 2. Validate the fields to be updated
  const fieldsValidationResult = GenericUpdateReportSchema.safeParse(updatedFields);
  if (!fieldsValidationResult.success) {
     logger.error(`[${functionName}] Invalid updatedFields provided.`, {
        reportId: validatedReportId,
        issues: fieldsValidationResult.error.issues,
     });
     return { success: false, error: 'Invalid update data.', issues: fieldsValidationResult.error.issues };
  }
  const validatedFields = fieldsValidationResult.data;

  // Ensure there's something to update
  if (Object.keys(validatedFields).length === 0) {
     logger.warn(`[${functionName}] No valid fields provided for update.`, { reportId: validatedReportId });
     return { success: false, error: 'No valid fields provided for update.' };
  }

  // Optional: Add more specific validation based on Report schema fields allowed for update
  // e.g., prevent updating userId, groupId, ai_ fields directly here.

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    logger.log(`[${functionName}] Attempting to update report (ID: ${validatedReportId})...`, { fields: Object.keys(validatedFields) });
    const updatedReport = await Report.findByIdAndUpdate(
      validatedReportId,
      { $set: validatedFields }, // Use validated fields
      { new: true, runValidators: true }
    ).lean();

    if (!updatedReport) {
      logger.error(`[${functionName}] Report update failed: Report not found (ID: ${validatedReportId}).`);
      return { success: false, error: 'Report not found for update.' };
    }

    logger.log(`[${functionName}] Report updated successfully (ID: ${validatedReportId}).`);

    // Revalidate relevant paths
    logger.log(`[${functionName}] Revalidating paths for report (ID: ${validatedReportId})...`);
    revalidatePath(`/report/${validatedReportId}`);
    revalidatePath('/dashboard');
    logger.log(`[${functionName}] Path revalidation complete.`);


    logger.log(`[${functionName}] Finished execution successfully.`);
    // Ensure data is serializable
    return { success: true, data: JSON.parse(JSON.stringify(updatedReport)) };

  } catch (err) {
    // Ensure error is an Error instance before accessing properties
    const error = err instanceof Error ? err : new Error(String(err));
    // Use validatedReportId in the log message
    logger.error(`[${functionName}] Error updating report (ID: ${validatedReportId}).`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // Check error properties safely
    if (error.name === 'ValidationError') {
        return { success: false, error: `Database validation failed: ${error.message}` };
    }
    // CastError might be less likely with Zod ObjectId validation, but keep as fallback
    if (error.name === 'CastError') {
        return { success: false, error: 'Invalid Report ID format during database operation.' };
    }
    return { success: false, error: 'Failed to update report due to a server error.' };
  }
}

// Removed default export if not needed, keep named export
// export default updateReport;