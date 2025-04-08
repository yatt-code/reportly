'use server';

import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger'; // Assuming logger exists

/**
 * Server Action to fetch all reports.
 * Optionally supports basic pagination or filtering in the future.
 *
 * @returns {Promise<{success: boolean, data?: object[], error?: string}>} - Result object.
 */
export async function getReports() {
  const functionName = 'getReports';
  logger.log(`[${functionName}] Starting execution.`);

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    logger.log(`[${functionName}] Fetching reports from database...`);
    // Fetch reports, potentially sort by creation date descending
    // Add .lean() for performance if you only need plain JS objects
    const reports = await Report.find({}).sort({ createdAt: -1 }).lean();
    logger.log(`[${functionName}] Found ${reports.length} reports.`);

    logger.log(`[${functionName}] Finished execution successfully.`);
    // Ensure data is serializable (lean() helps, but double-check complex fields if added later)
    return { success: true, data: JSON.parse(JSON.stringify(reports)) };

  } catch (error) {
    logger.error(`[${functionName}] Error fetching reports.`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    return { success: false, error: 'Failed to fetch reports due to a server error.' };
  }
}

// Exporting default for consistency, though named export is also common for server actions
export default getReports;