import logger from '@/lib/utils/logger';
import { callAI } from '@/lib/ai/providers/aiClient';
import { selectModel } from '@/lib/ai/providers/modelSelector';

/**
 * Generates a short summary for the given content using an AI model.
 * This is a passive AI function, typically triggered automatically (e.g., on save).
 *
 * @param {string} content - The text content to summarize.
 * @returns {Promise<{summary: string, meta: object}>} - An object containing the generated summary and metadata.
 * @throws {Error} - Throws an error if the AI call fails.
 */
export async function generateSummary(content) {
  const functionName = 'generateSummary';
  logger.log(`[${functionName}] Starting execution.`);

  // Add basic input logging for debugging (be careful with sensitive data in real apps)
  // logger.log(`[${functionName}] Input content length: ${content?.length || 0}`);

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    logger.error(`[${functionName}] Invalid input content provided.`);
    // Return a default structure even if content is invalid.
    // The error is logged, and the calling function can decide how to handle the empty result.
    return { summary: '', meta: { modelUsed: 'N/A', error: 'Invalid input content' } };
  }

  try {
    logger.log(`[${functionName}] Attempting AI call...`);

    // Select the appropriate model for summarization
    const model = process.env.AI_SUMMARY_MODEL || selectModel({
      task: 'summarization',
      quality: 'medium',
      maxTokens: 100,
      costSensitive: true
    });

    // Call the AI with our unified interface
    const response = await callAI({
      prompt: `Generate a concise 1-2 sentence summary for the following report content:\n\n${content}`,
      systemPrompt: "You are a helpful assistant that generates concise, accurate summaries of report content. Your summaries should capture the main points in 1-2 sentences.",
      model: model,
      temperature: 0.5,
      maxTokens: 100
    });

    const summary = response.content.trim();
    const meta = response.meta;

    logger.log(`[${functionName}] AI call successful.`, { summaryLength: summary.length, modelUsed: meta.modelUsed });
    logger.log(`[${functionName}] Finished execution successfully.`);
    return { summary, meta };

  } catch (error) {
    logger.error(`[${functionName}] AI call failed.`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // Rethrow the error to be caught by the calling Server Action (saveReport)
    throw new Error(`[${functionName}] AI call failed: ${error.message}`);
  }
  // --- End Placeholder AI Call ---
}