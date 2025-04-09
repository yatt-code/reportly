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
import { generateSuggestions, Suggestion } from '@/app/report/actions/generateSuggestions';
import type { ReportDocument } from '@/lib/schemas/reportSchemas'; // Import ReportDocument type
import logger from '@/lib/utils/logger';
import AiSuggestionPanel from '@/components/AiSuggestionPanel';
import CommentSection from '@/components/comments/CommentSection'; // Import CommentSection
import { Loader2, AlertTriangle, ChevronLeft, Edit, Save, BrainCircuit, RefreshCw } from 'lucide-react';

// Initialize lowlight
const lowlight = createLowlight(common);

interface ReportPageContainerProps {
    reportId: string; // Keep reportId for context in actions
    initialEditable?: boolean;
    initialData: ReportDocument | null; // Accept pre-fetched report data (can be null if not found initially)
}

/**
 * Container component for displaying and editing a single report.
 * Handles data fetching, edit mode toggling, saving, and AI suggestion display.
 */
const ReportPageContainer: React.FC<ReportPageContainerProps> = ({
    reportId, // Keep reportId
    initialEditable = false,
    initialData, // Receive initial data
}) => {
    // Use initialData directly instead of fetching
    // Use initialData directly, renaming to avoid conflict if needed, or just use initialData
    // const report = initialData; // Remove this redeclaration
    const router = useRouter();
    const [isEditable, setIsEditable] = useState(initialEditable);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    // editorContent state might not be needed if we always get content from editor instance
    // const [editorContent, setEditorContent] = useState<string>('');
    const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
    const [visibleSuggestionIds, setVisibleSuggestionIds] = useState<Set<string>>(new Set());
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
    const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Removed useFetchReport hook call and related state (isLoading, fetchError, refetch)

    // --- Editor Setup ---
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
            Placeholder.configure({ placeholder: 'Start writing your report details...' }),
            CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
            Image.configure({ inline: false, allowBase64: true }),
            MermaidExtension,
        ],
        content: initialData?.content || '', // Use optional chaining
        editable: isEditable,
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]`, // Added min-height
            },
        },
        // onUpdate handled via useEffect below to use autosave
    });

    // Handler for saving the report content (now receives content from autosave/manual trigger)
    const handleEditorSave = useCallback(async (content: string) => {
        // Use initialData for IDs, title etc. Check editor instance.
        if (!initialData || !editor) {
            logger.error('[ReportPageContainer] Attempted to save without initial data or editor instance.');
            setSaveError('Cannot save: Report data or editor not ready.');
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        logger.log('[ReportPageContainer] Calling saveReport server action...', { reportId: initialData?._id }); // Use optional chaining

        try {
            // Construct payload for saveReport action
            // Ensure userId and groupId are available from the fetched 'report' object
            // Use initialData for non-content fields
            const result = await saveReport({
                reportId: initialData._id, // Use optional chaining
                title: initialData.title,
                content: content,
                // userId/groupId handled server-side
            });

            if (result.success) {
                logger.log('[ReportPageContainer] Report saved successfully.', { reportId: initialData?._id }); // Use optional chaining
                // No need to setEditorContent state if we read directly from editor
                setIsEditable(false); // Exit edit mode after successful save
                // Optionally show a success message/toast
                // TODO: Consider revalidating the page path if updated AI fields need to be shown immediately
                // import { revalidatePath } from 'next/cache'; // Would need to be called from server action or route handler
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
    }, [initialData, editor]); // Depend on initialData and editor

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

     // Removed effect to update editor content from 'report' state,
     // as content is now initialized via useEditor's `content` prop using `initialData`.
     // If server-side props change, Next.js should handle re-rendering.


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

    // Loading/Error/Not Found states are handled by the parent page component.
    // If we reach here, initialData should be valid.
    if (!initialData) {
         // Fallback just in case, though parent should prevent this
         logger.error("[ReportPageContainer] Rendered without initialData.");
         return <div className="p-4 text-red-500">Error: Report data is missing.</div>;
    }
    // Use initialData directly in JSX where 'report' was used

    return (
        <div className="container mx-auto px-4 py-8 flex gap-4">
            {/* Main Content Area */}
            <div className="flex-grow">
                {/* Breadcrumbs/Navigation */}
                <div className="mb-4 text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="mx-2">&gt;</span>
                    <span>Report: {initialData.title}</span>
                </div>

                {/* Header with Title and Actions */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{initialData.title}</h1>
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
               {/* TipTap Editor */}
               <TipTapEditor editor={editor} />

               {/* Comment Section */}
               {/* Pass the reportId to fetch comments */}
               <CommentSection reportId={initialData._id} />
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