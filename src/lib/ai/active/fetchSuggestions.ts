import logger from '@/lib/utils/logger';

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
 * MOCK IMPLEMENTATION: Returns static placeholder suggestions.
 *
 * @param {string} reportId - The ID of the report to get suggestions for.
 * @param {string} [content] - Optional: The current report content (might influence suggestions).
 * @returns {Promise<ReportSuggestion[]>} - A promise that resolves to an array of suggestion objects.
 */
export async function fetchSuggestions(reportId: string, content?: string): Promise<ReportSuggestion[]> {
    const functionName = 'fetchSuggestions';
    logger.log(`[${functionName}] Fetching suggestions for report ID: ${reportId}`, { hasContent: !!content });

    // --- Mock AI Call ---
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        // Generate mock suggestions
        const mockSuggestions: ReportSuggestion[] = [
            {
                id: `sug-${reportId}-1`,
                type: 'clarity',
                suggestionText: "Consider rephrasing the section about 'project deployment' for better clarity.",
                confidence: 0.85,
            },
            {
                id: `sug-${reportId}-2`,
                type: 'conciseness',
                suggestionText: "The paragraph starting 'Regarding the user feedback...' could be more concise.",
                confidence: 0.78,
            },
            {
                id: `sug-${reportId}-3`,
                type: 'grammar',
                suggestionText: "Check grammar near '...the data was processed succesfully...'",
                confidence: 0.92,
                context: { originalText: 'succesfully' }
            },
        ];

        // Add more suggestions based on content length or randomly
        if (content && content.length > 500) {
             mockSuggestions.push({
                id: `sug-${reportId}-4`,
                type: 'style',
                suggestionText: "Ensure consistent tone throughout the report.",
                confidence: 0.65,
            });
        }

        logger.log(`[${functionName}] Mock suggestions generated successfully.`, { count: mockSuggestions.length });
        return mockSuggestions;

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Failed to generate mock suggestions.`, error);
        // In a real scenario, you might return an empty array or throw
        return [];
    }
    // --- End Mock AI Call ---
}