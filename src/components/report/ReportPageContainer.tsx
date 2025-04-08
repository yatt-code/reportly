'use client'; // This component uses hooks and state

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use App Router's navigation
import Link from 'next/link';
import { useFetchReport } from '@/hooks/useFetchReport';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { saveReport } from '@/app/report/actions/saveReport'; // Server action for saving
import { fetchSuggestions, ReportSuggestion } from '@/lib/ai/active/fetchSuggestions'; // Mock suggestions
import logger from '@/lib/utils/logger';
import { Loader2, AlertTriangle, ChevronLeft, Edit, Save, BrainCircuit } from 'lucide-react'; // Icons

interface ReportPageContainerProps {
    reportId: string;
    initialEditable?: boolean; // Allow initial mode override
}

/**
 * Container component for displaying and editing a single report.
 * Handles data fetching, edit mode toggling, saving, and AI suggestion display.
 */
const ReportPageContainer: React.FC<ReportPageContainerProps> = ({
    reportId,
    initialEditable = false,
}) => {
    const router = useRouter();
    const [isEditable, setIsEditable] = useState(initialEditable);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState<string>(''); // Store current editor content for saving
    const [suggestions, setSuggestions] = useState<ReportSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false); // Toggle for suggestion sidebar

    // Fetch the report data
    const { report, isLoading: isReportLoading, error: fetchError, refetch } = useFetchReport(reportId);

    // Fetch AI suggestions when report data is available
    useEffect(() => {
        if (report) {
            const getAISuggestions = async () => {
                try {
                    const fetchedSuggestions = await fetchSuggestions(report._id, report.content);
                    setSuggestions(fetchedSuggestions);
                } catch (err) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    logger.error('[ReportPageContainer] Failed to fetch AI suggestions', error);
                    // Handle suggestion fetch error if needed
                }
            };
            getAISuggestions();
            setEditorContent(report.content); // Initialize editor content
        }
    }, [report]); // Re-fetch suggestions if the report data changes (e.g., after refetch)

    // Handler for saving the report content
    const handleEditorSave = useCallback(async (content: string) => {
        if (!report) {
            logger.error('[ReportPageContainer] Attempted to save without report data.');
            setSaveError('Cannot save: Report data not loaded.');
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        logger.log('[ReportPageContainer] Calling saveReport server action...', { reportId: report._id });

        try {
            // Construct payload for saveReport action
            // Ensure userId and groupId are available from the fetched 'report' object
            const result = await saveReport({
                reportId: report._id,
                title: report.title, // Assuming title isn't editable in the TipTapEditor itself for now
                content: content,
                userId: report.userId, // Make sure these fields exist on your fetched report data
                groupId: report.groupId,
            });

            if (result.success) {
                logger.log('[ReportPageContainer] Report saved successfully.', { reportId: report._id });
                setEditorContent(content); // Update local content state
                setIsEditable(false); // Exit edit mode after successful save
                // Optionally show a success message/toast
                refetch(); // Refetch report data to show potentially updated AI fields (summary/tags)
            } else {
                logger.error('[ReportPageContainer] Failed to save report via server action.', { error: result.error });
                setSaveError(result.error || 'An unknown error occurred while saving.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[ReportPageContainer] Exception during saveReport call.', error);
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    }, [report, refetch]); // Dependencies: report data and refetch function

    // Update editor content state whenever the editor's internal state changes
    // This is needed if we want to pass the *latest* content to saveImmediately on Ctrl+Enter
    // Note: TipTap's onUpdate might be better for this, but requires careful handling
    // For simplicity, we rely on the onSave callback from TipTapEditor triggered by useAutoSave

    // --- UI Rendering ---

    if (isReportLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading Report...</span>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Report</h2>
                <p className="mb-4">{fetchError.message}</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    if (!report) {
        // This state could occur if fetch completes but finds no report (e.g., 404)
         return (
            <div className="flex flex-col justify-center items-center h-screen text-gray-600">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
                <p className="mb-4">The requested report could not be found.</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 flex gap-4">
            {/* Main Content Area */}
            <div className="flex-grow">
                {/* Breadcrumbs/Navigation */}
                <div className="mb-4 text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="mx-2">&gt;</span>
                    <span>Report: {report.title}</span>
                </div>

                {/* Header with Title and Actions */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{report.title}</h1>
                    <div className="flex items-center gap-2">
                         {/* Toggle AI Suggestions Button */}
                         {suggestions.length > 0 && (
                            <button
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                title={showSuggestions ? "Hide Suggestions" : "Show Suggestions"}
                            >
                                <BrainCircuit size={20} />
                            </button>
                         )}
                        {/* Edit/Save Button */}
                        {isEditable ? (
                            <button
                                onClick={() => handleEditorSave(editorContent)} // Trigger save manually
                                disabled={isSaving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditable(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Save Error Display */}
                {saveError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>Save Failed:</strong> {saveError}
                    </div>
                )}

                {/* TipTap Editor */}
                <TipTapEditor
                    key={report._id} // Force re-mount if report changes drastically? Maybe not needed.
                    defaultValue={report.content}
                    editable={isEditable}
                    onSave={handleEditorSave} // Pass the save handler for autosave/Ctrl+Enter
                    placeholder="Start writing your report details..."
                />
            </div>

            {/* AI Suggestions Sidebar */}
            {showSuggestions && suggestions.length > 0 && (
                 <aside className="w-64 lg:w-80 flex-shrink-0 border-l border-gray-300 dark:border-gray-700 pl-4">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">AI Suggestions</h2>
                    <ul className="space-y-3">
                        {suggestions.map((sug) => (
                            <li key={sug.id} className="text-sm p-2 border rounded bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <strong className="capitalize text-blue-600 dark:text-blue-400">{sug.type}:</strong>
                                <p className="mt-1">{sug.suggestionText}</p>
                                {sug.context?.originalText && (
                                    <p className="mt-1 text-xs text-gray-500 italic">Context: "{sug.context.originalText}"</p>
                                )}
                                <p className="mt-1 text-xs text-gray-400">Confidence: {(sug.confidence * 100).toFixed(0)}%</p>
                            </li>
                        ))}
                    </ul>
                </aside>
            )}
        </div>
    );
};

export default ReportPageContainer;