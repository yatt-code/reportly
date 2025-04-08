import { useState, useCallback } from 'react';
import { suggestImprovements } from '@/lib/ai/active/aiAssistInEditor';
import type { AISuggestion } from '@/lib/ai/active/aiAssistInEditor'; // Import the type if defined, or define locally
import logger from '@/lib/utils/logger'; // Optional: for logging hook activity

// If AISuggestion type isn't exported from the JS file, define it here
// interface AISuggestion {
//   suggestion: string;
//   confidence: number;
// }

/**
 * @typedef {object} UseAiAssistReturn
 * @property {AISuggestion[]} suggestions - The list of AI suggestions.
 * @property {boolean} isLoading - Whether suggestions are currently being fetched.
 * @property {Error | null} error - Any error that occurred during fetching.
 * @property {(text: string) => Promise<void>} getSuggestions - Function to trigger fetching suggestions for the given text.
 */

/**
 * Custom React hook to manage fetching AI suggestions for text improvements.
 *
 * @returns {UseAiAssistReturn} An object containing suggestions, loading state, error state, and a function to fetch suggestions.
 *
 * @example
 * const { suggestions, isLoading, error, getSuggestions } = useAiAssist();
 *
 * // In an effect or event handler:
 * useEffect(() => {
 *   getSuggestions("Some text to get suggestions for.");
 * }, [getSuggestions]); // Add dependencies as needed
 *
 * if (isLoading) return <p>Loading suggestions...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 * // Render suggestions...
 */
export function useAiAssist() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches AI suggestions for the provided text.
   * Updates loading, error, and suggestions state accordingly.
   * @param {string} text - The text to get suggestions for.
   */
  const getSuggestions = useCallback(async (text: string) => {
    const hookName = 'useAiAssist.getSuggestions';
    logger.log(`[${hookName}] Attempting to fetch suggestions...`, { textLength: text?.length });
    setIsLoading(true);
    setError(null);
    setSuggestions([]); // Clear previous suggestions

    try {
      const result = await suggestImprovements(text);
      setSuggestions(result);
      logger.log(`[${hookName}] Suggestions fetched successfully.`, { count: result.length });
    } catch (err) {
      logger.error(`[${hookName}] Failed to fetch suggestions.`, err as Error);
      setError(err instanceof Error ? err : new Error('An unknown error occurred while fetching suggestions.'));
    } finally {
      setIsLoading(false);
      logger.log(`[${hookName}] Finished fetching attempt.`);
    }
  }, []); // useCallback ensures the function identity is stable unless dependencies change (none here)

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
  };
}