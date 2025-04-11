'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report'; // Assuming Report model has appropriate types
// import User from '@/models/User'; // Keep if needed for validation later
// import Group from '@/models/Group'; // Keep if needed for validation later
import { generateSummary } from '@/lib/ai/passive/generateSummary';
import { categorizeReport } from '@/lib/ai/passive/categorizeReport';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server'; // Import server-side user fetcher
import { CreateReportSchema, UpdateReportSchema, ReportDocument } from '@/lib/schemas/reportSchemas';
import { assertOwnership } from '@/lib/utils/assertOwnership'; // Import the utility
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserReportCount, getUserReportStreak } from '@/lib/achievements/userStats';
import { getAchievementDetails, AchievementDetails } from '@/lib/achievements/getAchievementDetails';
import { addXp } from '@/lib/xp';

// Define a combined input type for the function parameter
// This accepts either a creation payload (without reportId) or an update payload (with reportId)
// Note: Zod doesn't directly support discriminated unions based on optional fields easily for function args.
// We'll validate based on the presence of reportId inside the function.
type SaveReportInput = z.infer<typeof CreateReportSchema> | z.infer<typeof UpdateReportSchema>;

// Define a more specific return type
type SaveReportResult =
    | { success: true; report: any; unlocked: AchievementDetails[]; xpGained?: number; levelUp?: boolean; newLevel?: number } // Include unlocked achievements and XP info
    | { success: false; error: string; issues?: z.ZodIssue[] };


/**
 * Server Action to save (create or update) a report.
 * Includes passive AI calls for summary and categorization.
 * Validates input using Zod schemas.
 *
 * @param reportData - The data for the report (creation or update payload).
 * @returns {Promise<SaveReportResult>} - Result object indicating success or failure.
 */
export async function saveReport(reportData: SaveReportInput): Promise<SaveReportResult> {
  const reportId = 'reportId' in reportData ? reportData.reportId : undefined;
  const operation = reportId ? 'update' : 'create';
  logger.log(`Starting saveReport action (operation: ${operation})`, { reportId });

  // --- Input Validation ---
  const validationSchema = reportId ? UpdateReportSchema : CreateReportSchema;
  const validationResult = validationSchema.safeParse(reportData);

  if (!validationResult.success) {
    logger.error(`[saveReport] Input validation failed (operation: ${operation}).`, {
      issues: validationResult.error.issues,
    });
    return {
      success: false,
      error: 'Invalid input data.',
      issues: validationResult.error.issues,
    };
  }

  // Use validated data from now on
  const validatedData = validationResult.data;
  // Destructure needed fields AFTER validation
  // Don't destructure userId/groupId from client input for security
  const { title, content } = validatedData as any;

  try {
    logger.log('Connecting to database...');
    await connectDB();
    logger.log('Database connected.');

    // --- Authentication & Authorization Check ---
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        logger.error('[saveReport] Unauthorized: No user session found.');
        return { success: false, error: 'Authentication required.' };
    }
    const currentUserId = currentUser.id;
    logger.log('[saveReport] User authenticated.', { userId: currentUserId });

    let existingReport: ReportDocument | null = null;
    if (operation === 'update' && reportId) {
        existingReport = await Report.findById(reportId).lean() as ReportDocument | null;
        if (!existingReport) {
             logger.error(`[saveReport] Update failed: Report not found (ID: ${reportId}).`);
             return { success: false, error: 'Report not found.' };
        }
        // Use the assertOwnership utility
        assertOwnership(existingReport, currentUserId, 'update');
        // If assertOwnership doesn't throw, we can proceed
         logger.log('[saveReport] Ownership verified for update.', { reportId, userId: currentUserId });
    }
    // --- End Auth Check ---

    // Optional: Add validation to ensure userId and groupId exist and user belongs to group
    // const user = await User.findById(userId);
    // const group = await Group.findById(groupId);
    // if (!user || !group /* || !group.members.includes(userId) */) {
    //   return { success: false, error: 'Invalid user or group.' };
    // }

    // --- Passive AI Integration ---
    let aiSummary = '';
    let aiTags: string[] = []; // Explicitly type aiTags
    let summaryMeta = {};
    let categoryMeta = {};
    let summarySuccessful = false;

    // --- Passive AI Step 1: Generate Summary ---
    logger.log(`Attempting AI summary generation for report (ID: ${reportId || 'new'})...`);
    try {
      // Ensure content exists before calling AI (should be guaranteed by Zod if required)
      if (typeof validatedData.content === 'string') {
        const summaryResult = await generateSummary(validatedData.content);
      aiSummary = summaryResult.summary;
      summaryMeta = summaryResult.meta || {};
      summarySuccessful = true; // Mark summary as successful
        logger.log(`AI summary generated successfully for report (ID: ${reportId || 'new'}).`, { summary: aiSummary });
      } else if (operation === 'create') { // Content is required for create
          throw new Error("Content is missing after validation for create operation.");
      }
    } catch (aiError) {
      const error = aiError instanceof Error ? aiError : new Error(String(aiError));
      logger.error(`AI summary generation failed for report (ID: ${reportId || 'new'}).`, error);
      // Proceed without summary, error logged by generateSummary
    }

    // --- Passive AI Step 2: Categorize Report (only if summary step didn't hard fail conceptually, or succeeded) ---
    // We proceed even if summary failed, as categorization might still work based on content alone.
    // If generateSummary threw an error, summarySuccessful remains false, but we still try categorize.
    // A more robust pipeline might skip categorization if summary fails critically.
    logger.log(`Attempting AI categorization for report (ID: ${reportId || 'new'})...`);
    try {
      // Pass content and the generated summary (if available)
      // Ensure content exists before calling AI
      if (typeof validatedData.content === 'string') {
        const categoryResult = await categorizeReport(validatedData.content, aiSummary);
      aiTags = categoryResult.tags;
      categoryMeta = categoryResult.meta || {};
        logger.log(`AI categorization successful for report (ID: ${reportId || 'new'}).`, { tags: aiTags });
      } else if (operation === 'create') { // Content is required for create
          // This case might not be reachable if summary already threw, but good for safety
          throw new Error("Content is missing after validation for create operation.");
      }
    } catch (aiError) {
      const error = aiError instanceof Error ? aiError : new Error(String(aiError));
      logger.error(`AI categorization failed for report (ID: ${reportId || 'new'}).`, error);
      // Proceed without tags, error logged by categorizeReport
    }
    // --- End Passive AI Integration ---


    let savedReport;
    // Build the payload carefully based on operation type
    const reportPayload: any = { // Use 'any' temporarily, refine with proper type/interface
      // Fields common to both create and update (if present in validatedData)
      ...(validatedData.title && { title: validatedData.title }),
      ...(validatedData.content && { content: validatedData.content }),
      // AI fields are always added/updated
      ai_summary: aiSummary, // Save the generated summary
      ai_tags: aiTags, // Save the generated tags
      aiMeta: { // Combine metadata from both steps (or structure differently if needed)
        summary_modelUsed: (summaryMeta as any)?.modelUsed, // Use type assertion if meta structure isn't strictly typed
        summary_promptTokens: (summaryMeta as any)?.promptTokens,
        summary_completionTokens: (summaryMeta as any)?.completionTokens,
        summary_totalTokens: (summaryMeta as any)?.totalTokens,
        summary_cost: (summaryMeta as any)?.cost,
        category_modelUsed: (categoryMeta as any)?.modelUsed,
        category_promptTokens: (categoryMeta as any)?.promptTokens,
        category_completionTokens: (categoryMeta as any)?.completionTokens,
        category_totalTokens: (categoryMeta as any)?.totalTokens,
        category_cost: (categoryMeta as any)?.cost,
        processedAt: new Date(), // Mark when the overall AI processing finished
      },
      // Mongoose timestamps will handle createdAt/updatedAt automatically
    };

    if (operation === 'update' && reportId) {
        // Update: Only include fields present in validatedData (title, content) + AI fields
        // Exclude userId and groupId from $set payload for updates via this action
        // Ensure payload doesn't accidentally include userId/groupId for update
        const updatePayload = { ...reportPayload };
        delete updatePayload.userId;
        delete updatePayload.groupId;

        savedReport = await Report.findByIdAndUpdate(
            reportId, // reportId is validated
            { $set: updatePayload },
            { new: true, runValidators: true }
        );
        if (!savedReport) {
            logger.error(`Report update failed: Report not found (ID: ${reportId}).`);
            return { success: false, error: 'Report not found for update.' };
        }
        logger.log(`Report updated successfully (ID: ${savedReport._id}).`);
    } else if (operation === 'create') {
        // Create: Include userId and groupId from validatedData
        // Assign ownership using the authenticated user ID
        reportPayload.userId = currentUserId;
        // Assign groupId - IMPORTANT: How is groupId determined for a new report?
        // Option A: Passed from client (validated by CreateReportSchema) - Requires adding it back to destructuring/validation
        // Option B: Derived from user profile/context server-side
        // For now, assuming it was part of CreateReportSchema and validatedData
        if (!('groupId' in validatedData)) {
             logger.error('[saveReport] Missing groupId for create operation after validation.');
             return { success: false, error: 'Internal server error: Missing required group info for creation.' };
        }
        reportPayload.groupId = validatedData.groupId;

        const newReport = new Report(reportPayload); // No need to cast if payload is built correctly
        savedReport = await newReport.save();
        logger.log(`New report created successfully (ID: ${savedReport._id}).`);
    } else {
         // Should not happen if logic is correct
         logger.error('[saveReport] Invalid operation state.', { operation, reportId });
         return { success: false, error: 'Internal server error: Invalid operation.' };
    }

    // Revalidate relevant paths to update cached data
    // Example: Revalidate the specific report page and the dashboard
    if (savedReport) {
      logger.log(`Revalidating paths for report (ID: ${savedReport._id})...`);
      revalidatePath(`/report/${savedReport._id}`); // If you have dynamic report pages
      revalidatePath('/dashboard'); // Revalidate the dashboard page
      logger.log('Path revalidation complete.');

    }

    // Initialize unlocked achievements array and XP result
    let unlockedAchievements: AchievementDetails[] = [];
    let xpResult = { newXp: 0, newLevel: 1, levelUp: false, unlockedAchievements: [] as string[] };

    // Check for achievements and add XP if this was a create operation
    if (operation === 'create' && savedReport) {
      try {
        // Add XP for the report creation action
        xpResult = await addXp(currentUserId, 'report');
        logger.log(`[saveReport] Added XP for report creation:`, { xpResult });

        // Get the user's total report count
        const totalReports = await getUserReportCount(currentUserId);

        // Get the user's report streak (days)
        const reportDaysStreak = await getUserReportStreak(currentUserId);

        // Check for achievements based on report creation
        // Note: addXp already checks for achievements, but we're keeping this for now
        // to ensure backward compatibility and to check for report-specific achievements
        const newAchievementSlugs = await checkAchievements(currentUserId, "onReportCreate", {
          totalReports,
          reportDaysStreak,
          reportId: savedReport._id.toString()
        });

        // Combine achievement slugs from both sources
        const allAchievementSlugs = Array.from(new Set([...newAchievementSlugs, ...xpResult.unlockedAchievements]));

        if (allAchievementSlugs.length > 0) {
          logger.log(`[saveReport] User unlocked ${allAchievementSlugs.length} new achievements:`, { allAchievementSlugs });

          // Get detailed information about the unlocked achievements
          unlockedAchievements = getAchievementDetails(allAchievementSlugs);
        }
      } catch (achievementError) {
        // Log the error but don't fail the report creation process
        const error = achievementError instanceof Error ? achievementError : new Error(String(achievementError));
        logger.error(`[saveReport] Error checking achievements or adding XP:`, error);
      }
    }

    // Return only serializable data
    logger.log(`saveReport action completed successfully (operation: ${operation}, ID: ${savedReport?._id}).`);
    return {
      success: true,
      report: JSON.parse(JSON.stringify(savedReport)),
      unlocked: unlockedAchievements,
      xpGained: operation === 'create' ? xpResult.newXp : undefined,
      levelUp: operation === 'create' ? xpResult.levelUp : undefined,
      newLevel: operation === 'create' ? xpResult.newLevel : undefined
    };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[saveReport] Error during save operation (operation: ${operation}, reportId: ${reportId})`, error);
    // Handle specific errors like ownership failure from assertOwnership
    if (error.message.startsWith('Forbidden:')) {
        return { success: false, error: error.message };
    }
    if (error.name === 'ValidationError') {
        return { success: false, error: `Database validation failed: ${error.message}` };
    }
    return { success: false, error: 'Failed to save report due to a server error.' };
  }
}