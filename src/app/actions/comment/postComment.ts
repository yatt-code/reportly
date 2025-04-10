'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/connectDB';
import CommentModel, { IComment } from '@/models/Comment'; // Import interface too
import ReportModel from '@/models/Report'; // Needed for access check
import { getCurrentUser } from '@/lib/auth';
import { PostCommentSchema, PostCommentInput } from '@/lib/schemas/commentSchemas';
import { ReportDocument } from '@/lib/schemas/reportSchemas';
import logger from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
// Supabase client is now used in processMentions
import { processMentions } from '@/lib/comments/processMentions';
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserCommentCount, getUserCommentStreak } from '@/lib/achievements/userStats';
import { getAchievementDetails, AchievementDetails } from '@/lib/achievements/getAchievementDetails';
import { addXp } from '@/lib/xp';

// Define return type
type PostCommentResult =
    | { success: true; comment: any; unlocked: AchievementDetails[]; xpGained?: number; levelUp?: boolean; newLevel?: number } // Include unlocked achievements and XP info
    | { success: false; error: string; issues?: z.ZodIssue[] };

// --- Mock User Lookup ---
// In a real app, query Supabase users table based on username, scoped by group if necessary
// Replace this with actual Supabase query logic
const mockResolveUsernamesToIds = async (usernames: string[], groupId?: string): Promise<string[]> => {
    logger.log('[mockResolveUsernamesToIds] Resolving usernames (mock)...', { usernames, groupId });
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay
    const mockDb: { [username: string]: string } = {
        'alice': 'user_id_alice',
        'bob': 'user_id_bob',
        'charlie': 'user_id_charlie',
        'admin': 'user_id_admin',
    };
    // Filter based on mock DB and potentially groupId (not implemented in mock)
    return usernames.map(uname => mockDb[uname]).filter(Boolean); // Return only found IDs
};
// --- End Mock User Lookup ---

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
            parentId: parentId || null,
            // mentions: mentions || [], // We will populate this based on parsing
            userId: currentUserId,
        });

        // --- Mention Parsing & Resolution ---
        // Extract mentions using regex to store in the comment model
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        const mentionedUsernames = new Set<string>();
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentionedUsernames.add(match[1]);
        }

        let mentionedUserIds: string[] = [];
        if (mentionedUsernames.size > 0) {
            logger.log(`[${functionName}] Found potential mentions:`, Array.from(mentionedUsernames));
            // For now, we'll still use the mock function to resolve usernames to IDs for the comment model
            // In a real implementation, this would use the same lookup as processMentions
            mentionedUserIds = await mockResolveUsernamesToIds(Array.from(mentionedUsernames), report?.groupId);
        }
        newComment.mentions = mentionedUserIds;
        // --- End Mention Parsing ---

        const savedComment: IComment = await newComment.save(); // Add type annotation
        const savedCommentId = (savedComment._id as any).toString(); // Cast _id to any before toString()
        logger.log(`[${functionName}] Comment created successfully.`, { commentId: savedCommentId, mentions: mentionedUserIds });

        // --- Process Mentions and Create Notifications ---
        // Use the extracted processMentions function to handle mention notifications
        await processMentions(content, savedCommentId, reportId, currentUserId);
        // --- End Notification Processing ---

        // Revalidate the report page path to show the new comment
        revalidatePath(`/report/${reportId}`);

        // Check for achievements and add XP
        let unlockedAchievements: AchievementDetails[] = [];
        let xpResult = { newXp: 0, newLevel: 1, levelUp: false, unlockedAchievements: [] as string[] };

        try {
            // Add XP for the comment action
            xpResult = await addXp(currentUserId, 'comment');
            logger.log(`[${functionName}] Added XP for comment:`, { xpResult });

            // Get the user's total comment count
            const totalComments = await getUserCommentCount(currentUserId);

            // Get the user's comment streak (days)
            const commentDaysStreak = await getUserCommentStreak(currentUserId);

            // Check for achievements based on comment activity
            // Note: addXp already checks for achievements, but we're keeping this for now
            // to ensure backward compatibility and to check for comment-specific achievements
            const newAchievementSlugs = await checkAchievements(currentUserId, "onComment", {
                totalComments,
                commentDaysStreak,
                reportId
            });

            // Combine achievement slugs from both sources
            const allAchievementSlugs = Array.from(new Set([...newAchievementSlugs, ...xpResult.unlockedAchievements]));

            if (allAchievementSlugs.length > 0) {
                logger.log(`[${functionName}] User unlocked ${allAchievementSlugs.length} new achievements:`, { allAchievementSlugs });

                // Get detailed information about the unlocked achievements
                unlockedAchievements = getAchievementDetails(allAchievementSlugs);
            }
        } catch (achievementError) {
            // Log the error but don't fail the comment posting process
            const error = achievementError instanceof Error ? achievementError : new Error(String(achievementError));
            logger.error(`[${functionName}] Error checking achievements or adding XP:`, error);
        }

        return {
            success: true,
            comment: JSON.parse(JSON.stringify(savedComment)),
            unlocked: unlockedAchievements,
            xpGained: xpResult.newXp,
            levelUp: xpResult.levelUp,
            newLevel: xpResult.newLevel
        };

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