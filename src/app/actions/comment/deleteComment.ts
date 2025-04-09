'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import CommentModel, { IComment } from '@/models/Comment'; // Use the Mongoose model and interface
import { getCurrentUser } from '@/lib/auth';
import { hasRole } from '@/lib/rbac/utils'; // Use server-side role check
import { CommentIdSchema } from '@/lib/schemas/commentSchemas';
import logger from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache'; // To potentially update report page UI

// Define return type
type DeleteCommentResult =
    | { success: true }
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to delete a comment by its ID.
 * Verifies user authentication and ownership or admin role.
 *
 * @param commentId - The ID of the comment to delete.
 * @returns {Promise<DeleteCommentResult>} - Result object indicating success or failure.
 */
export async function deleteComment(commentId: string): Promise<DeleteCommentResult> {
    const functionName = 'deleteComment';
    logger.log(`[${functionName}] Starting execution.`, { commentId });

    // --- Authentication Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error(`[${functionName}] Unauthorized: No user session found.`);
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
    const isAdmin = hasRole(currentUser, 'admin'); // Check if user is admin
    logger.log(`[${functionName}] User authenticated.`, { userId: currentUserId, isAdmin });

    // --- Input Validation ---
    const validationResult = CommentIdSchema.safeParse({ commentId });
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid commentId format.`, { commentId, issues: validationResult.error.issues });
        return { success: false, error: 'Invalid Comment ID format.', issues: validationResult.error.issues };
    }
    const validatedCommentId = validationResult.data.commentId;

    try {
        logger.log(`[${functionName}] Connecting to database...`);
        await connectDB();
        logger.log(`[${functionName}] Database connected.`);

        // --- Find Comment & Authorization Check ---
        logger.log(`[${functionName}] Finding comment ${validatedCommentId} for deletion check...`);
        const commentToDelete = await CommentModel.findById(validatedCommentId); // Don't use lean() if we need the document instance later potentially

        if (!commentToDelete) {
            logger.warn(`[${functionName}] Comment not found (ID: ${validatedCommentId}).`);
            return { success: false, error: 'Comment not found.' };
        }

        // Check ownership OR admin role
        if (commentToDelete.userId !== currentUserId && !isAdmin) {
            logger.error(`[${functionName}] Authorization failed: User ${currentUserId} (not admin) attempted to delete comment ${validatedCommentId} owned by ${commentToDelete.userId}.`);
            return { success: false, error: 'Forbidden: You do not have permission to delete this comment.' };
        }
        logger.log(`[${functionName}] Authorization verified (User: ${currentUserId}, IsAdmin: ${isAdmin}). Proceeding with deletion...`);
        // --- End Auth Check ---

        // Perform deletion
        // Option A: Hard Delete
        const deleteResult = await CommentModel.deleteOne({ _id: validatedCommentId });

        // Option B: Soft Delete (Requires adding an 'isDeleted' field to the schema)
        // const deleteResult = await CommentModel.findByIdAndUpdate(validatedCommentId, { $set: { isDeleted: true, content: '[deleted]' } });

        if (deleteResult.deletedCount === 0) { // Adjust check if using soft delete
             logger.error(`[${functionName}] Deletion failed after authorization check (ID: ${validatedCommentId}).`);
             return { success: false, error: 'Deletion failed unexpectedly.' };
        }

        logger.log(`[${functionName}] Comment deleted successfully (ID: ${validatedCommentId}).`);

        // Revalidate the report page path
        // We need the reportId, which was on the comment object
        if (commentToDelete.reportId) {
            revalidatePath(`/report/${commentToDelete.reportId}`);
        } else {
             logger.warn(`[${functionName}] Could not revalidate path, reportId missing from deleted comment object.`);
        }


        return { success: true };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Error deleting comment.`, { commentId: validatedCommentId, error });
        if (error.message.startsWith('Forbidden:')) { // Catch specific auth errors if assertOwnership was used (not used here directly)
            return { success: false, error: error.message };
        }
        if (error.name === 'CastError') {
             return { success: false, error: 'Invalid Comment ID format during database operation.' };
        }
        return { success: false, error: 'Failed to delete comment due to a server error.' };
    }
}