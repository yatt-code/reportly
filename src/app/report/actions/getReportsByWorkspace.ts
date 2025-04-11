'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server';
import { hasWorkspaceAccess } from '@/lib/rbac/workspaceAccess';

// Define Zod schema for input validation
const WorkspaceIdSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

// Define a more specific return type
type GetReportsByWorkspaceResult =
  | { success: true; data: any[] }
  | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to fetch all reports for a specific workspace.
 * Verifies user authentication and workspace access.
 * 
 * @param workspaceId - The ID of the workspace to fetch reports for
 * @returns {Promise<GetReportsByWorkspaceResult>} - Result object indicating success or failure.
 */
export async function getReportsByWorkspace(
  workspaceId: string
): Promise<GetReportsByWorkspaceResult> {
  const functionName = 'getReportsByWorkspace';
  logger.log(`[${functionName}] Starting execution.`, { workspaceId });

  // --- Input Validation ---
  const validationResult = WorkspaceIdSchema.safeParse({ workspaceId });
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    logger.error(`[${functionName}] Validation error:`, { errors: errorMessage });
    return { 
      success: false, 
      error: `Invalid input: ${errorMessage}`,
      issues: validationResult.error.errors
    };
  }
  const validatedWorkspaceId = validationResult.data.workspaceId;

  // --- Authentication Check ---
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    logger.error(`[${functionName}] Unauthorized: No user session found.`);
    return { success: false, error: 'Authentication required.' };
  }
  const currentUserId = currentUser.id;
  logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });

  try {
    logger.log(`[${functionName}] Connecting to database...`);
    await connectDB();
    logger.log(`[${functionName}] Database connected.`);

    // --- Workspace Access Verification ---
    const hasAccess = await hasWorkspaceAccess(currentUserId, validatedWorkspaceId);
    if (!hasAccess) {
      logger.error(`[${functionName}] Authorization failed: User ${currentUserId} cannot access workspace ${validatedWorkspaceId}.`);
      return { success: false, error: 'Forbidden: You do not have permission to access this workspace.' };
    }
    logger.log(`[${functionName}] Workspace access verified.`);

    logger.log(`[${functionName}] Fetching reports for workspace (ID: ${validatedWorkspaceId})...`);
    // Fetch reports filtered by the workspace ID
    const reports = await Report.find({ workspaceId: validatedWorkspaceId })
      .sort({ createdAt: -1 })
      .lean();

    logger.log(`[${functionName}] Found ${reports.length} reports for workspace (ID: ${validatedWorkspaceId}).`);

    logger.log(`[${functionName}] Finished execution successfully.`);
    // Ensure data is serializable
    return { success: true, data: JSON.parse(JSON.stringify(reports)) };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error fetching reports for workspace (ID: ${validatedWorkspaceId}).`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // CastError check might still be relevant if DB interaction fails unexpectedly
    if (error.name === 'CastError') {
      return { success: false, error: 'Database interaction failed with invalid ID format.' };
    }
    return { success: false, error: 'Failed to fetch workspace reports due to a server error.' };
  }
}
