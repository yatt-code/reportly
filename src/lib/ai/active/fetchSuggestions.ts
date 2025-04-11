import logger from '@/lib/utils/logger';
import { callAI } from '@/lib/ai/providers/aiClient';
import { selectModel } from '@/lib/ai/providers/modelSelector';

/**
 * @typedef {object} ReportSuggestion
 * @property {string} id - Unique ID for the suggestion.
 * @property {string} type - Type of suggestion (e.g., 'grammar', 'clarity', 'conciseness', 'nextSentence').
 * @property {string} suggestionText - The suggested improvement or text.
 * @property {number} confidence - Confidence score (0-1).
 * @property {object} [context] - Optional context (e.g., original text snippet).
 */
export interface ReportSuggestion {
    id: string;
    type: 'grammar' | 'clarity' | 'conciseness' | 'nextSentence' | 'style';
    suggestionText: string;
    confidence: number;
    context?: {
        originalText?: string;
        // Add location info if needed (e.g., paragraph index, character range)
    };
}

/**
 * Fetches AI-powered suggestions for a given report ID or content.
 *
 * @param {string} reportId - The ID of the report to get suggestions for.
 * @param {string} [content] - Optional: The current report content (might influence suggestions).
 * @returns {Promise<ReportSuggestion[]>} - A promise that resolves to an array of suggestion objects.
 */
export async function fetchSuggestions(reportId: string, content?: string): Promise<ReportSuggestion[]> {
    const functionName = 'fetchSuggestions';
    logger.log(`[${functionName}] Fetching suggestions for report ID: ${reportId}`, { hasContent: !!content });

    try {
        // If no content is provided, we can't generate suggestions
        if (!content || content.trim().length === 0) {
            logger.warn(`[${functionName}] No content provided for report ID: ${reportId}`);
            return [];
        }

        // Select the appropriate model for suggestions
        const model = process.env.AI_SUGGESTION_MODEL || selectModel({
            task: 'enhancement',
            quality: 'medium',
            maxTokens: 500,
            costSensitive: true
        });

        // Prepare the prompt
        const prompt = `Analyze the following report content and provide 3-5 specific suggestions for improvement. Focus on clarity, conciseness, grammar, and style.\n\nReport ID: ${reportId}\nContent: ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}`;

        // Call the AI with our unified interface
        const response = await callAI({
            prompt,
            systemPrompt: "You are a helpful writing assistant. Analyze the provided report content and suggest specific improvements. Return your response as a JSON array with objects containing 'id' (string), 'type' (one of: 'grammar', 'clarity', 'conciseness', 'style'), 'suggestionText' (string), 'confidence' (number between 0-1), and optional 'context' object with 'originalText' property. Be specific and actionable in your suggestions.",
            model,
            temperature: 0.4,
            maxTokens: 500
        });

        // Parse the response to extract suggestions
        let suggestions: ReportSuggestion[] = [];
        try {
            // Try to parse as JSON
            const parsedResponse = JSON.parse(response.content.trim());

            // Validate the structure
            if (Array.isArray(parsedResponse)) {
                // Process each suggestion and ensure it has the required properties
                suggestions = parsedResponse
                    .map((s: any, index: number) => ({
                        id: s.id || `sug-${reportId}-${index + 1}`,
                        type: s.type && ['grammar', 'clarity', 'conciseness', 'style', 'nextSentence'].includes(s.type)
                            ? s.type as ReportSuggestion['type']
                            : 'clarity',
                        suggestionText: s.suggestionText || s.suggestion || 'Improve this section',
                        confidence: typeof s.confidence === 'number' && s.confidence >= 0 && s.confidence <= 1
                            ? s.confidence
                            : 0.7,
                        context: s.context || undefined
                    }))
                    .filter((s: ReportSuggestion) => s.suggestionText.length > 0);
            }
        } catch (parseError) {
            // If parsing fails, create a fallback suggestion
            logger.warn(`[${functionName}] Failed to parse AI response as JSON. Using fallback.`, parseError);
            suggestions = [
                {
                    id: `sug-${reportId}-fallback`,
                    type: 'clarity',
                    suggestionText: `AI suggested: ${response.content.trim().substring(0, 100)}...`,
                    confidence: 0.5
                }
            ];
        }

        logger.log(`[${functionName}] AI suggestions generated successfully.`, { count: suggestions.length });
        return suggestions;

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Failed to generate AI suggestions.`, error);
        return [];
    }
}