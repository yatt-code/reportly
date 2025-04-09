'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import CommentModel from '@/models/Comment'; // Use the Mongoose model
import ReportModel from '@/models/Report'; // Needed for access check
import { getCurrentUser } from '@/lib/auth';
import { PostCommentSchema, PostCommentInput } from '@/lib/schemas/commentSchemas';
import { ReportDocument } from '@/lib/schemas/reportSchemas'; // Import Report type
import logger from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache'; // To potentially update report page UI

// Define return type
type PostCommentResult =
    | { success: true; comment: any } // Consider defining a proper Comment type based on model/interface
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to post a new comment or reply to a report.
 * Verifies user authentication and report access.
 *
 * @param input - The comment data matching PostCommentInput schema.
 * @returns {Promise<PostCommentResult>} - Result object with the new comment or an error.
 */
export async function postComment(input: PostCommentInput): Promise<PostCommentResult> {
    const functionName = 'postComment';
    logger.log(`[${functionName}] Starting execution.`);

    // --- Authentication Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId });

    // --- Input Validation ---
    const validationResult = PostCommentSchema.safeParse(input);
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid input data.`, { issues: validationResult.error.issues });
        return { success: false, error: 'Invalid comment data.', issues: validationResult.error.issues };
    }
    const { reportId, content, parentId, mentions } = validationResult.data;

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        // --- Report Access Verification ---
        // Check if the report exists and if the user has access (e.g., owner or group member)
        // This logic might need refinement based on group membership rules
        logger.log(`[${functionName}] Verifying access to report ${reportId}...`);
        const report = await ReportModel.findById(reportId).lean() as ReportDocument | null;
        if (!report) {
            logger.error(`[${functionName}] Report not found (ID: ${reportId}).`);
            return { success: false, error: 'Report not found.' };
        }
        // Basic check: Allow comment if user owns the report.
        // TODO: Implement group membership check:
        // 1. Fetch the current user's group memberships (e.g., from User model or Supabase metadata).
        // 2. Check if the report's groupId is included in the user's groups.
        // const userBelongsToGroup = checkGroupMembership(currentUser, report.groupId); // Example helper
        const isOwner = report.userId === currentUserId;
        // const canAccess = isOwner || userBelongsToGroup; // Combine checks
        const canAccess = isOwner; // Keep owner-only check for now

        if (!canAccess) {
             logger.error(`[${functionName}] Authorization failed: User ${currentUserId} cannot comment on report ${reportId}. User is not owner (and group check not implemented).`);
             return { success: false, error: 'Forbidden: You do not have permission to comment on this report.' };
        }
        logger.log(`[${functionName}] Report access verified.`);
        // --- End Access Verification ---

        // --- Parent Comment Check (if replying) ---
        if (parentId) {
            const parentComment = await CommentModel.findById(parentId);
            if (!parentComment || parentComment.reportId !== reportId) {
                 logger.error(`[${functionName}] Invalid parentId (${parentId}) provided for reply on report ${reportId}.`);
                 return { success: false, error: 'Invalid parent comment specified.' };
            }
             logger.log(`[${functionName}] Parent comment ${parentId} verified.`);
        }
        // --- End Parent Check ---


        logger.log(`[${functionName}] Creating comment...`);
        const newComment = new CommentModel({
            reportId,
            content,
            parentId: parentId || null, // Ensure null if undefined
            mentions: mentions || [], // Ensure empty array if undefined
            userId: currentUserId, // Assign authenticated user ID
        });

        const savedComment = await newComment.save();
        logger.log(`[${functionName}] Comment created successfully.`, { commentId: savedComment._id });

        // Revalidate the report page path to show the new comment
        revalidatePath(`/report/${reportId}`);

        return { success: true, comment: JSON.parse(JSON.stringify(savedComment)) };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error posting comment.`, error);
        // Handle specific DB errors if needed
        if (error.name === 'ValidationError') {
            return { success: false, error: `Database validation failed: ${error.message}` };
        }
        return { success: false, error: 'Failed to post comment due to a server error.' };
    }
}