'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment'; // Use the Mongoose model
import ReportModel from '@/models/Report'; // Needed for access check
import { getCurrentUser } from '@/lib/auth';
import { ReportIdSchema } from '@/lib/schemas/commentSchemas'; // Use schema from comment schemas
import { ReportDocument } from '@/lib/schemas/reportSchemas'; // Import Report type
import logger from '@/lib/utils/logger';

// Define return type
type GetCommentsResult =
    | { success: true; comments: any[] } // Consider defining a proper Comment type
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to fetch all comments for a specific report.
 * Verifies user authentication and report access.
 * Returns comments sorted by creation date (ascending).
 *
 * @param reportId - The ID of the report whose comments are to be fetched.
 * @returns {Promise<GetCommentsResult>} - Result object with the comments array or an error.
 */
export async function getCommentsByReport(reportId: string): Promise<GetCommentsResult> {
    const functionName = 'getCommentsByReport';
    logger.log(`[${functionName}] Starting execution.`, { reportId });

    // --- Authentication Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });

    // --- Input Validation ---
    const validationResult = ReportIdSchema.safeParse({ reportId });
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid reportId format.`, { reportId, issues: validationResult.error.issues });
        return { success: false, error: 'Invalid Report ID format.', issues: validationResult.error.issues };
    }
    const validatedReportId = validationResult.data.reportId;

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        // --- Report Access Verification ---
        // Check if the report exists and if the user has access
        logger.log(`[${functionName}] Verifying access to report ${validatedReportId}...`);
        const report = await ReportModel.findById(validatedReportId).lean() as ReportDocument | null;
        if (!report) {
            logger.error(`[${functionName}] Report not found (ID: ${validatedReportId}).`);
            return { success: false, error: 'Report not found.' };
        }
        // Basic check: Allow access if user owns the report.
        // TODO: Implement group membership check:
        // 1. Fetch user's groups.
        // 2. Check if report.groupId is in user's groups.
        // const userBelongsToGroup = checkGroupMembership(currentUser, report.groupId); // Example helper
        const isOwner = report.userId === currentUserId;
        // const canAccess = isOwner || userBelongsToGroup;
        const canAccess = isOwner; // Keep owner-only check for now

        if (!canAccess) {
             logger.error(`[${functionName}] Authorization failed: User ${currentUserId} cannot access comments for report ${validatedReportId}. User is not owner (and group check not implemented).`);
             return { success: false, error: 'Forbidden: You do not have permission to view comments for this report.' };
        }
        logger.log(`[${functionName}] Report access verified.`);
        // --- End Access Verification ---

        logger.log(`[${functionName}] Fetching comments for report ${validatedReportId}...`);
        const comments = await CommentModel.find({ reportId: validatedReportId })
            .sort({ createdAt: 1 }) // Sort by oldest first for threading
            .lean(); // Use lean for performance

        logger.log(`[${functionName}] Found ${comments.length} comments.`);
        logger.log(`[${functionName}] Finished execution successfully.`);

        return { success: true, comments: JSON.parse(JSON.stringify(comments)) };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error fetching comments.`, { reportId: validatedReportId, error });
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid Report ID format during database operation.' };
        }
        return { success: false, error: 'Failed to fetch comments due to a server error.' };
    }
}