'use client'; // This component uses hooks and state

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditor, Editor } from '@tiptap/react'; // Import useEditor and Editor type
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { createLowlight, common } from 'lowlight';
import MermaidExtension from '@/components/editor/extensions/mermaidExtension';
import { useFetchReport } from '@/hooks/useFetchReport';
import { useAutoSave } from '@/hooks/useAutoSave'; // Import useAutoSave
import TipTapEditor from '@/components/editor/TipTapEditor'; // The display component
import { saveReport } from '@/app/report/actions/saveReport';
import { generateSuggestions, Suggestion } from '@/app/report/actions/generateSuggestions'; // Use the server action
import logger from '@/lib/utils/logger';
import AiSuggestionPanel from '@/components/AiSuggestionPanel';
import { Loader2, AlertTriangle, ChevronLeft, Edit, Save, BrainCircuit, RefreshCw } from 'lucide-react'; // Added RefreshCw

// Initialize lowlight
const lowlight = createLowlight(common);

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
    // editorContent state might not be needed if we always get content from editor instance
    // const [editorContent, setEditorContent] = useState<string>('');
    const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]); // Renamed state
    const [visibleSuggestionIds, setVisibleSuggestionIds] = useState<Set<string>>(new Set()); // Track dismissed
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
    const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false); // Renamed state
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch the report data
    const { report, isLoading: isReportLoading, error: fetchError, refetch } = useFetchReport(reportId);

    // Removed initial suggestion fetch based on report load, now triggered by editor updates

    // --- Editor Setup ---
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
            Placeholder.configure({ placeholder: 'Start writing your report details...' }),
            CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
            Image.configure({ inline: false, allowBase64: true }),
            MermaidExtension,
        ],
        content: report?.content || '', // Use fetched report content or empty string
        editable: isEditable, // Controlled by state
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]`, // Added min-height
            },
        },
        // onUpdate handled via useEffect below to use autosave
    });

    // Handler for saving the report content (now receives content from autosave/manual trigger)
    const handleEditorSave = useCallback(async (content: string) => {
        if (!report || !editor) { // Check for editor instance too
            logger.error('[ReportPageContainer] Attempted to save without report data or editor instance.');
            setSaveError('Cannot save: Report data or editor not ready.');
            return; // Return void
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
                // No need to setEditorContent state if we read directly from editor
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
    }, [report, refetch, editor]); // Add editor dependency

    // --- AutoSave Hook Setup ---
    const { triggerSave, saveImmediately } = useAutoSave(
        () => { // Define the callback inline for useAutoSave
            if (editor) {
                 // Pass the current editor content to handleEditorSave
                 return handleEditorSave(editor.getHTML());
            }
            return Promise.resolve(); // Return promise if editor not ready
        },
        2000 // Autosave delay
    );

     // --- Editor Effects ---

    // --- AI Suggestion Fetching Logic ---
    const triggerSuggestionFetch = useCallback(async (currentContent: string) => {
        if (!currentContent || currentContent.trim().length < 20) { // Min length for suggestions
            setAiSuggestions([]);
            setVisibleSuggestionIds(new Set());
            setSuggestionsError(null);
            return;
        }

        setIsSuggestionsLoading(true);
        setSuggestionsError(null);
        logger.log('[ReportPageContainer] Fetching AI suggestions via action...');

        try {
            // Use the server action
            const result = await generateSuggestions(currentContent, { reportId }); // Pass context if needed
            if (result.success && result.suggestions) {
                setAiSuggestions(result.suggestions);
                setVisibleSuggestionIds(new Set(result.suggestions.map(s => s.id))); // Show all new suggestions
                logger.log('[ReportPageContainer] AI suggestions fetched.', { count: result.suggestions.length });
            } else {
                setSuggestionsError(result.error || 'Failed to fetch suggestions.');
                logger.error('[ReportPageContainer] Error fetching AI suggestions.', { error: result.error });
                setAiSuggestions([]);
                setVisibleSuggestionIds(new Set());
            }
        } catch (err) {
            const fetchError = err instanceof Error ? err : new Error(String(err));
            logger.error('[ReportPageContainer] Exception fetching AI suggestions.', fetchError);
            setSuggestionsError(fetchError.message);
            setAiSuggestions([]);
            setVisibleSuggestionIds(new Set());
        } finally {
            setIsSuggestionsLoading(false);
        }
    }, [reportId]); // Depends on reportId for context potentially

     // Effect to handle editor content updates (triggering autosave AND debounced suggestions)
     useEffect(() => {
         if (!editor) return;

         const handleUpdate = ({ editor: currentEditor }: { editor: Editor }) => {
             const currentContent = currentEditor.getHTML();
             // Trigger autosave
             triggerSave(currentContent);

             // Debounce suggestion fetching
             if (debounceTimeoutRef.current) {
                 clearTimeout(debounceTimeoutRef.current);
             }
             debounceTimeoutRef.current = setTimeout(() => {
                 if (isEditable) { // Only fetch suggestions if editable
                    triggerSuggestionFetch(currentContent);
                 }
             }, 3000); // 3-second debounce for suggestions
         };

         editor.on('update', handleUpdate);
         return () => {
             editor.off('update', handleUpdate);
             if (debounceTimeoutRef.current) { // Clear timeout on unmount
                 clearTimeout(debounceTimeoutRef.current);
             }
         };
     }, [editor, triggerSave, triggerSuggestionFetch, isEditable]); // Add dependencies

     // Effect for Ctrl+Enter Shortcut
     useEffect(() => {
         const handleKeyDown = (event: KeyboardEvent) => {
             if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                 if (editor && isEditable) { // Check editor and editable state
                     event.preventDefault();
                     logger.log('[ReportPageContainer] Ctrl+Enter detected, triggering immediate save.');
                     saveImmediately(editor.getHTML()); // Pass current content
                 }
             }
         };
         const editorViewDom = editor?.view.dom;
         if (editorViewDom) {
             editorViewDom.addEventListener('keydown', handleKeyDown as EventListener);
         }
         return () => {
             if (editorViewDom) {
                 editorViewDom.removeEventListener('keydown', handleKeyDown as EventListener);
             }
         };
     }, [editor, isEditable, saveImmediately]); // Add dependencies

     // Effect to update editor's editable state when isEditable changes
     useEffect(() => {
        if (editor && editor.isEditable !== isEditable) {
            editor.setEditable(isEditable);
        }
    }, [editor, isEditable]);

     // Effect to update editor content if the report data changes (e.g., after refetch)
     // This prevents stale content if the report is updated externally or via refetch
     useEffect(() => {
        if (editor && report && editor.getHTML() !== report.content) {
            // Use `setContent` carefully, only when necessary to avoid losing user's current typing state
            // Check if the editor is focused might help
            // if (!editor.isFocused) {
                editor.commands.setContent(report.content, false); // false = don't emit update event
                logger.log('[ReportPageContainer] Editor content updated from fetched report data.');
            // }
        }
     }, [report, editor]); // Run when report or editor instance changes


    // --- Suggestion Panel Handlers ---
    const handleAcceptSuggestion = useCallback((suggestionText: string) => {
        if (!editor) return;
        logger.log('[ReportPageContainer] Suggestion accepted:', { suggestionText });
        editor.chain().focus().insertContent(suggestionText).run();
        // Maybe dismiss the suggestion or refetch after accepting?
    }, [editor]);

    const handleDismissSuggestion = useCallback((id: string) => {
        setVisibleSuggestionIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        logger.log('[ReportPageContainer] Suggestion dismissed.', { id });
    }, []);

    const handleRegenerateSuggestions = useCallback(() => {
        if (editor) {
            triggerSuggestionFetch(editor.getHTML());
        }
    }, [editor, triggerSuggestionFetch]);
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
                        {/* Toggle AI Suggestions Button - Show if suggestions exist OR if loading/error */}
                        {(aiSuggestions.length > 0 || isSuggestionsLoading || suggestionsError) && (
                           <button
                               onClick={() => setShowSuggestionsPanel(!showSuggestionsPanel)}
                               className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 ${showSuggestionsPanel ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                               title={showSuggestionsPanel ? "Hide Suggestions" : "Show Suggestions"}
                           >
                               <BrainCircuit size={20} />
                           </button>
                        )}
                        {/* Manual Regenerate Button (Optional) */}
                        {/* <button onClick={handleRegenerateSuggestions} disabled={isSuggestionsLoading} title="Get Suggestions">
                            <RefreshCw size={16} className={isSuggestionsLoading ? 'animate-spin' : ''} />
                        </button> */}
                        {/* Edit/Save Button */}
                        {isEditable ? (
                            <button
                                onClick={() => editor && handleEditorSave(editor.getHTML())} // Get current content and save
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

               {/* TipTap Editor - Pass the editor instance */}
               <TipTapEditor editor={editor} />
            </div>

            {/* AI Suggestions Sidebar - Render AiSuggestionPanel with props */}
            {showSuggestionsPanel && (
                 <AiSuggestionPanel
                    // Filter suggestions based on visibility state
                    suggestions={aiSuggestions.filter(s => visibleSuggestionIds.has(s.id))}
                    isLoading={isSuggestionsLoading}
                    error={suggestionsError}
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onDismissSuggestion={handleDismissSuggestion}
                    onRegenerate={handleRegenerateSuggestions}
                 />
            )}
        </div>
    );
};

export default ReportPageContainer;