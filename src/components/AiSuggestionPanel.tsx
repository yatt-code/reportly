'use client';

import React, { useState } from 'react'; // Removed useEffect
// Removed generateSuggestions import, as fetching is now handled by parent
import type { Suggestion } from '@/app/report/actions/generateSuggestions';
import logger from '@/lib/utils/logger';
import { Loader2, AlertTriangle, Check, X, RefreshCw, Lightbulb } from 'lucide-react';

interface AiSuggestionPanelProps {
    suggestions: Suggestion[]; // Suggestions are passed as props
    isLoading: boolean; // Loading state from parent
    error: string | null; // Error state from parent
    onAcceptSuggestion: (suggestionText: string) => void; // Callback for accepting
    onDismissSuggestion: (id: string) => void; // Callback for dismissing
    onRegenerate: () => void; // Callback to trigger regeneration in parent
    // Removed targetText prop
}

/**
 * A panel component to display AI-generated suggestions for text improvement.
 */
const AiSuggestionPanel: React.FC<AiSuggestionPanelProps> = ({
    suggestions,
    isLoading,
    error,
    onAcceptSuggestion,
    onDismissSuggestion,
    onRegenerate,
}) => {
    // Removed internal state for suggestions, isLoading, error
    // Removed internal fetch logic and useEffect

    // Dismissal is now handled by the parent via onDismissSuggestion callback
    // const [visibleSuggestionIds, setVisibleSuggestionIds] = useState<Set<string>>(new Set());
    // useEffect(() => {
    //     // Update visible IDs when suggestions prop changes
    //     setVisibleSuggestionIds(new Set(suggestions.map(s => s.id)));
    // }, [suggestions]);

    // const handleDismiss = (id: string) => {
    //     onDismissSuggestion(id); // Call parent's dismiss handler
    //     // Parent will update the suggestions list, which re-renders this component
    // };

    const handleAccept = (suggestionText: string) => {
        logger.log('[AiSuggestionPanel] Suggestion accepted.', { suggestionText });
        onAcceptSuggestion(suggestionText);
    };

    // No need to filter internally if parent passes only visible ones,
    // or if dismissal logic is handled differently (e.g., parent filters)
    // For now, assume parent passes the full list and we handle dismiss via callback
    // const visibleSuggestions = suggestions.filter(s => visibleSuggestionIds.has(s.id));
    const visibleSuggestions = suggestions; // Assume parent handles filtering/dismissal state

    return (
        <aside className="ai-suggestion-panel w-64 lg:w-80 flex-shrink-0 border-l border-gray-300 dark:border-gray-700 pl-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-3 border-b pb-2 sticky top-0 bg-white dark:bg-gray-900 py-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                   <Lightbulb size={20} className="text-yellow-500" /> AI Suggestions
                </h2>
                <button
                    onClick={onRegenerate} // Call parent's regenerate handler
                    disabled={isLoading}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Regenerate Suggestions"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
            )}

            {error && !isLoading && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> Error: {error}
                </div>
            )}

            {!isLoading && !error && visibleSuggestions.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                    {/* Simplified message based on props */}
                    {'No suggestions available.'}
                </div>
            )}

            {!isLoading && !error && visibleSuggestions.length > 0 && (
                <ul className="space-y-3">
                    {visibleSuggestions.map((sug) => (
                        <li key={sug.id} className="text-sm p-3 border rounded bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                            <strong className="capitalize text-blue-600 dark:text-blue-400 block mb-1">{sug.title || sug.type}</strong>
                            {sug.originalText && (
                                <p className="mb-1 text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2">
                                    Original: "{sug.originalText}"
                                </p>
                            )}
                            <p className="mb-2">{sug.suggestion}</p>
                            <div className="flex justify-end items-center gap-2 mt-2 border-t pt-2">
                                 <span className="text-xs text-gray-400 mr-auto">
                                    {sug.confidence && `Confidence: ${(sug.confidence * 100).toFixed(0)}%`}
                                 </span>
                                <button
                                    onClick={() => onDismissSuggestion(sug.id)} // Use parent's dismiss handler
                                    className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    title="Dismiss Suggestion"
                                >
                                    <X size={14} />
                                </button>
                                <button
                                    onClick={() => handleAccept(sug.suggestion)}
                                    className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                                    title="Accept Suggestion"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default AiSuggestionPanel;