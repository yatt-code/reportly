import logger from '@/lib/utils/logger';
import { callAI } from '@/lib/ai/providers/aiClient';
import { selectModel } from '@/lib/ai/providers/modelSelector';

/**
 * @typedef {object} AISuggestion
 * @property {string} suggestion - The suggested text improvement.
 * @property {number} confidence - A mock confidence score (0-1).
 */

/**
 * Provides AI-powered suggestions for improving a given text block.
 * This is an "active" AI function, triggered by user interaction in the editor.
 * Uses a mock AI response for now.
 *
 * @param {string} text - The text block to analyze for improvements.
 * @returns {Promise<AISuggestion[]>} - A promise that resolves to an array of suggestion objects.
 * @throws {Error} - Throws an error if the AI call simulation fails.
 */
export async function suggestImprovements(text) {
  const functionName = 'suggestImprovements';
  logger.log(`[${functionName}] Starting execution.`, { textLength: text?.length });

  if (!text || typeof text !== 'string' || text.trim().length < 10) { // Require some minimum length
    logger.warn(`[${functionName}] Insufficient text length for suggestions.`);
    // Return empty array if text is too short or invalid
    return [];
  }

  try {
    logger.log(`[${functionName}] Making AI call for text suggestions...`);

    // Select the appropriate model for text enhancement
    const model = process.env.AI_ENHANCEMENT_MODEL || selectModel({
      task: 'enhancement',
      quality: 'medium',
      maxTokens: 200,
      costSensitive: true
    });

    // Prepare the prompt
    const prompt = `Analyze the following text and provide 2-3 specific suggestions for improvement. Focus on clarity, conciseness, and grammar.\n\nText: ${text}`;

    // Call the AI with our unified interface
    const response = await callAI({
      prompt: prompt,
      systemPrompt: "You are a helpful writing assistant. Analyze the provided text and suggest specific improvements. Return your response as a JSON array with objects containing 'suggestion' (string) and 'confidence' (number between 0-1) properties. Be specific and actionable in your suggestions.",
      model: model,
      temperature: 0.4,
      maxTokens: 200
    });

    // Parse the response to extract suggestions
    let suggestions = [];
    try {
      // Try to parse as JSON
      suggestions = JSON.parse(response.content.trim());

      // Validate the structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Ensure each suggestion has the required properties
      suggestions = suggestions.filter(s =>
        typeof s === 'object' &&
        typeof s.suggestion === 'string' &&
        typeof s.confidence === 'number' &&
        s.confidence >= 0 && s.confidence <= 1
      );
    } catch (parseError) {
      // If parsing fails, create a fallback suggestion
      logger.warn(`[${functionName}] Failed to parse AI response as JSON. Using fallback.`, parseError);
      suggestions = [
        {
          suggestion: `AI suggested: ${response.content.trim().substring(0, 100)}...`,
          confidence: 0.5
        }
      ];
    }

    logger.log(`[${functionName}] AI call successful. Generated ${suggestions.length} suggestions.`);
    logger.log(`[${functionName}] Finished execution successfully.`);
    return suggestions;

  } catch (error) {
    logger.error(`[${functionName}] AI call failed.`, error);
    logger.log(`[${functionName}] Finished execution with error.`);
    // Rethrow or handle as appropriate for the calling action
    throw new Error(`[${functionName}] AI suggestion generation failed: ${error.message}`);
  }
}