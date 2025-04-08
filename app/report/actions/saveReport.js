'use server';

import connectDB from '@/lib/db/connectDB';
import Report from '@/models/Report';
import User from '@/models/User'; // To potentially validate user existence/permissions
import Group from '@/models/Group'; // To potentially validate group existence
import { generateSummary } from '@/lib/ai/passive/generateSummary'; // Passive AI call 1
import { categorizeReport } from '@/lib/ai/passive/categorizeReport'; // Passive AI call 2
import logger from '@/lib/utils/logger'; // Import logger
import { revalidatePath } from 'next/cache'; // To update UI after save

/**
 * Server Action to save (create or update) a report.
 * Includes a passive AI call to generate a summary.
 *
 * @param {object} reportData - The data for the report.
 * @param {string} [reportData.reportId] - Optional: ID of the report to update. If null, creates a new report.
 * @param {string} reportData.title - The title of the report.
 * @param {string} reportData.content - The Markdown content of the report.
 * @param {string} reportData.userId - The ID of the user creating/updating the report.
 * @param {string} reportData.groupId - The ID of the group the report belongs to.
 * @returns {Promise<{success: boolean, report?: object, error?: string}>} - Result object.
 */
export async function saveReport(reportData) {
  const { reportId, title, content, userId, groupId } = reportData;
  const operation = reportId ? 'update' : 'create';
  logger.log(`Starting saveReport action (operation: ${operation})`, { reportId, userId, groupId });

  // Basic validation
  if (!title || !content || !userId || !groupId) {
    logger.error('saveReport validation failed: Missing required fields.', reportData);
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    logger.log('Connecting to database...');
    await connectDB();
    logger.log('Database connected.');

    // Optional: Add validation to ensure userId and groupId exist and user belongs to group
    // const user = await User.findById(userId);
    // const group = await Group.findById(groupId);
    // if (!user || !group /* || !group.members.includes(userId) */) {
    //   return { success: false, error: 'Invalid user or group.' };
    // }

    // --- Passive AI Integration ---
    let aiSummary = '';
    let aiTags = [];
    let summaryMeta = {};
    let categoryMeta = {};
    let summarySuccessful = false;

    // --- Passive AI Step 1: Generate Summary ---
    logger.log(`Attempting AI summary generation for report (ID: ${reportId || 'new'})...`);
    try {
      const summaryResult = await generateSummary(content);
      aiSummary = summaryResult.summary;
      summaryMeta = summaryResult.meta || {};
      summarySuccessful = true; // Mark summary as successful
      logger.log(`AI summary generated successfully for report (ID: ${reportId || 'new'}).`, { summary: aiSummary });
    } catch (aiError) {
      logger.error(`AI summary generation failed for report (ID: ${reportId || 'new'}).`, aiError);
      // Proceed without summary, error logged by generateSummary
    }

    // --- Passive AI Step 2: Categorize Report (only if summary step didn't hard fail conceptually, or succeeded) ---
    // We proceed even if summary failed, as categorization might still work based on content alone.
    // If generateSummary threw an error, summarySuccessful remains false, but we still try categorize.
    // A more robust pipeline might skip categorization if summary fails critically.
    logger.log(`Attempting AI categorization for report (ID: ${reportId || 'new'})...`);
    try {
      // Pass content and the generated summary (if available)
      const categoryResult = await categorizeReport(content, aiSummary);
      aiTags = categoryResult.tags;
      categoryMeta = categoryResult.meta || {};
      logger.log(`AI categorization successful for report (ID: ${reportId || 'new'}).`, { tags: aiTags });
    } catch (aiError) {
      logger.error(`AI categorization failed for report (ID: ${reportId || 'new'}).`, aiError);
      // Proceed without tags, error logged by categorizeReport
    }
    // --- End Passive AI Integration ---


    let savedReport;
    const reportPayload = {
      title,
      content,
      userId,
      groupId,
      ai_summary: aiSummary, // Save the generated summary
      ai_tags: aiTags, // Save the generated tags
      aiMeta: { // Combine metadata from both steps (or structure differently if needed)
        summary_modelUsed: summaryMeta.modelUsed,
        summary_promptTokens: summaryMeta.promptTokens,
        summary_completionTokens: summaryMeta.completionTokens,
        summary_totalTokens: summaryMeta.totalTokens,
        summary_cost: summaryMeta.cost,
        category_modelUsed: categoryMeta.modelUsed,
        category_promptTokens: categoryMeta.promptTokens,
        category_completionTokens: categoryMeta.completionTokens,
        category_totalTokens: categoryMeta.totalTokens,
        category_cost: categoryMeta.cost,
        processedAt: new Date(), // Mark when the overall AI processing finished
      },
      // Mongoose timestamps will handle createdAt/updatedAt automatically
    };

    if (reportId) {
      // Update existing report
      savedReport = await Report.findByIdAndUpdate(
        reportId,
        { $set: reportPayload },
        { new: true, runValidators: true } // Return the updated document and run schema validators
      );
      if (!savedReport) {
        logger.error(`Report update failed: Report not found (ID: ${reportId}).`);
        return { success: false, error: 'Report not found for update.' };
      }
      logger.log(`Report updated successfully (ID: ${savedReport._id}).`);
    } else {
      // Create new report
      const newReport = new Report(reportPayload);
      savedReport = await newReport.save();
      logger.log(`New report created successfully (ID: ${savedReport._id}).`);
    }

    // Revalidate relevant paths to update cached data
    // Example: Revalidate the specific report page and the dashboard
    if (savedReport) {
      logger.log(`Revalidating paths for report (ID: ${savedReport._id})...`);
      revalidatePath(`/report/${savedReport._id}`); // If you have dynamic report pages
      revalidatePath('/dashboard'); // Revalidate the dashboard page
      logger.log('Path revalidation complete.');
    }

    // Return only serializable data
    logger.log(`saveReport action completed successfully (operation: ${operation}, ID: ${savedReport._id}).`);
    return { success: true, report: JSON.parse(JSON.stringify(savedReport)) };

  } catch (error) {
    logger.error(`Error during saveReport action (operation: ${operation}, reportId: ${reportId})`, error);
    // More specific error handling based on error type (e.g., validation error)
    if (error.name === 'ValidationError') {
        return { success: false, error: `Validation failed: ${error.message}` };
    }
    return { success: false, error: 'Failed to save report due to a server error.' };
  }
}