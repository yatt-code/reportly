import logger from '@/lib/utils/logger';
import { callAI } from '@/lib/ai/providers/aiClient';
import { selectModel } from '@/lib/ai/providers/modelSelector';

/**
 * Categorizes the given content using an AI model, assigning relevant tags.
 * This is a passive AI function, typically triggered automatically after summarization.
 *
 * @param {string} content - The text content to categorize.
 * @param {string} [summary] - Optional: The previously generated summary might help categorization.
 * @returns {Promise<{tags: string[], meta: object}>} - An object containing the generated tags and metadata.
 * @throws {Error} - Throws an error if the AI call fails.
 */
export async function categorizeReport(content, summary) {
  const functionName = 'categorizeReport';
  logger.log(`[${functionName}] Starting execution.`, { hasSummary: !!summary });
  // logger.log(`[${functionName}] Input content length: ${content?.length || 0}, Summary length: ${summary?.length || 0}`);

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    logger.error(`[${functionName}] Invalid input content provided.`);
    // Return empty tags. Error is logged.
    return { tags: [], meta: { modelUsed: 'N/A', error: 'Invalid input content' } };
  }

  try {
    logger.log(`[${functionName}] Attempting AI call...`);

    // Select the appropriate model for categorization
    const model = process.env.AI_CATEGORY_MODEL || selectModel({
      task: 'categorization',
      quality: 'medium',
      maxTokens: 50,
      costSensitive: true
    });

    // Prepare the prompt
    const prompt = `Analyze the following report content (and its summary if provided) and assign 1-3 relevant category tags from this list: [bug, feature, update, internal, documentation, meeting, research].\n\nSummary: ${summary || 'N/A'}\n\nContent: ${content}`;

    // Call the AI with our unified interface
    const response = await callAI({
      prompt: prompt,
      systemPrompt: "You are a helpful assistant that categorizes report content. Return only the category tags as a comma-separated list, with no additional text.",
      model: model,
      temperature: 0.3,
      maxTokens: 50
    });

    // Parse the response to extract tags
    const rawTags = response.content.trim();
    const tags = rawTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    const meta = response.meta;

    logger.log(`[${functionName}] AI call successful.`, { tags, modelUsed: meta.modelUsed });
    logger.log(`[${functionName}] Finished execution successfully.`);
    return { tags, meta };

  } catch (error) {
    logger.error(`[${functionName}] AI call failed.`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // Rethrow the error to be caught by the calling Server Action (saveReport)
    throw new Error(`[${functionName}] AI call failed: ${error.message}`);
  }
  // --- End Placeholder AI Call ---
}