'use server';

import logger from '@/lib/utils/logger';
// Although enhanceText exists, this mock action returns predefined suggestions directly for now.
// import { enhanceText } from '@/lib/ai/active/enhanceText';

/**
 * @typedef {object} Suggestion
 * @property {string} type - Type like 'tone', 'grammar', 'clarity'.
 * @property {string} title - A short title for the suggestion card.
 * @property {string} suggestion - The suggested text or improvement description.
 * @property {string} [originalText] - Optional: The text this suggestion relates to.
 * @property {number} [confidence] - Optional: Confidence score.
 */
export interface Suggestion {
    id: string; // Add unique ID
    type: 'tone' | 'grammar' | 'clarity' | 'conciseness' | 'style';
    title: string;
    suggestion: string;
    originalText?: string;
    confidence?: number;
}


/**
 * Server Action to generate AI suggestions for given text content.
 * MOCK IMPLEMENTATION: Returns hardcoded suggestions.
 *
 * @param {string} content - The editor content or selected text snippet.
 * @param {string} [context] - Optional context (e.g., reportId, userId).
 * @returns {Promise<{success: boolean, suggestions?: Suggestion[], error?: string}>}
 */
export async function generateSuggestions(content, context = {}) {
    const functionName = 'generateSuggestions (action)';
    logger.log(`[${functionName}] Starting execution.`, { contentLength: content?.length, context });

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
        logger.warn(`[${functionName}] Insufficient content provided.`);
        return { success: false, error: 'Insufficient content for suggestions.' };
    }

    // --- Mock Suggestion Generation ---
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

        const mockSuggestions: Suggestion[] = [
            {
                id: `sug-${Date.now()}-1`,
                type: 'tone',
                title: 'More Confident Tone',
                suggestion: 'Consider phrasing this more assertively, e.g., "This approach *will* yield results."',
                originalText: content.substring(0, 30) + '...', // Example context
                confidence: 0.88
            },
            {
                 id: `sug-${Date.now()}-2`,
                type: 'clarity',
                title: 'Improve Clarity',
                suggestion: 'Could the term "synergistic effect" be replaced with simpler language?',
                confidence: 0.75
            },
        ];

        if (content.includes('mistake')) {
             mockSuggestions.push({
                id: `sug-${Date.now()}-3`,
                type: 'grammar',
                title: 'Potential Typo',
                suggestion: 'Did you mean "mistake"?',
                originalText: 'mistake',
                confidence: 0.95
            });
        }

        logger.log(`[${functionName}] Mock suggestions generated.`, { count: mockSuggestions.length });
        return { success: true, suggestions: mockSuggestions };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Failed to generate mock suggestions.`, error);
        return { success: false, error: 'Failed to generate suggestions due to a server error.' };
    }
    // --- End Mock ---
}