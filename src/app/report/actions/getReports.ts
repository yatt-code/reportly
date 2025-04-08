'use server';

import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
import logger from '@/lib/utils/logger';

// Define a more specific return type
// Consider defining a proper Report type based on your model
type GetReportsResult =
    | { success: true; data: any[] }
    | { success: false; error: string };

/**
 * Server Action to fetch all reports.
 * WARNING: In a real application, fetching ALL reports is usually not recommended.
 * Implement pagination and filtering based on user context (e.g., userId, groupId).
 * This is kept simple for now as per the initial implementation.
 *
 * @returns {Promise<GetReportsResult>} - Result object indicating success or failure.
 */
export async function getReports(): Promise<GetReportsResult> {
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

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error fetching reports.`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    return { success: false, error: 'Failed to fetch reports due to a server error.' };
  }
}

// Removed default export if not needed
// export default getReports;