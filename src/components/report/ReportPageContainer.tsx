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
import { deleteReport } from '@/app/report/actions/deleteReport'; // Import deleteReport
import { useDemo } from '@/contexts/DemoContext'; // Import useDemo
import toast from 'react-hot-toast'; // Import toast
import { generateSuggestions, Suggestion } from '@/app/report/actions/generateSuggestions';
import type { ReportDocument } from '@/lib/schemas/reportSchemas'; // Import ReportDocument type
import logger from '@/lib/utils/logger';
import AiSuggestionPanel from '@/components/AiSuggestionPanel';
import CommentSection from '@/components/comments/CommentSection'; // Import CommentSection
import { Loader2, AlertTriangle, ChevronLeft, Edit, Save, BrainCircuit, RefreshCw, Trash2 } from 'lucide-react'; // Added Trash2

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
    const demoContext = useDemo(); // Get demo context
    const [isEditable, setIsEditable] = useState(initialEditable);
    const [editableTitle, setEditableTitle] = useState(initialData?.title || ''); // Initialize with initialData.title
    const [editableTags, setEditableTags] = useState<string[]>(initialData?.tags || []);
    const [editableStatus, setEditableStatus] = useState<'draft' | 'published' | 'archived'>(initialData?.status || 'draft');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // State for delete operation
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
                title: editableTitle, // Use editableTitle from state
                content: content,
                tags: editableTags,
                status: editableStatus,
                // userId/groupId handled server-side
            });

            if (result.success) {
                logger.log('[ReportPageContainer] Report saved successfully.', { reportId: initialData?._id }); // Use optional chaining
                if (result.report) { // Use result.report which is the updated document
                    setEditableTitle(result.report.title);
                    setEditableTags(result.report.tags || []);
                    setEditableStatus(result.report.status || 'draft');
                }
                setIsEditable(false); // Exit edit mode after successful save
                toast.success('Report saved!');
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
    }, [initialData, editor, editableTitle, editableTags, editableStatus, router]); // Add dependencies

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

    // --- Delete Report Handler ---
    const handleDeleteReport = async () => {
        if (!initialData?._id) {
            toast.error("Report ID is missing, cannot delete.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            if (demoContext.isDemoMode) {
                logger.log('[ReportPageContainer] Deleting report in demo mode...', { reportId: initialData._id });
                demoContext.deleteDemoReport(initialData._id);
                toast.success('Demo report deleted successfully!');
                router.push('/dashboard');
            } else {
                setIsDeleting(true);
                const toastId = toast.loading('Deleting report...');
                logger.log('[ReportPageContainer] Deleting report (live mode)...', { reportId: initialData._id });
                try {
                    const result = await deleteReport(initialData._id);
                    if (result.success) {
                        toast.success('Report deleted successfully!', { id: toastId });
                        logger.log('[ReportPageContainer] Report deleted successfully.', { reportId: initialData._id });
                        router.push('/dashboard');
                        // No need to call revalidate, server action handles it
                    } else {
                        throw new Error(result.error || 'Failed to delete report.');
                    }
                } catch (err) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    logger.error('[ReportPageContainer] Error deleting report.', { reportId: initialData._id, error });
                    toast.error(`Error: ${error.message}`, { id: toastId });
                } finally {
                    setIsDeleting(false);
                }
            }
        }
    };


    return (
        <div className="container mx-auto px-4 py-8 flex gap-4">
            {/* Main Content Area */}
            <div className="flex-grow">
                {/* Breadcrumbs/Navigation */}
                <div className="mb-4 text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                    <span className="mx-2">&gt;</span>
                    <span>Report: {editableTitle}</span> 
                </div>

                {/* Metadata Display (Tags and Status) - Show when not in edit mode */}
                {!isEditable && (
                    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="font-semibold">Status: </span>
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                {editableStatus.charAt(0).toUpperCase() + editableStatus.slice(1)}
                            </span>
                        </div>
                        {editableTags.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Tags:</span>
                                {editableTags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Header with Title and Actions */}
                <div className="flex justify-between items-center mb-4">
                    {isEditable ? (
                        <div className="flex-grow mr-4">
                            <input
                                type="text"
                                value={editableTitle}
                                onChange={(e) => setEditableTitle(e.target.value)}
                                className="text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none dark:bg-gray-900 dark:text-white dark:border-gray-700 w-full mb-2"
                                placeholder="Report Title"
                            />
                            {/* Editable Tags and Status */}
                            <div className="flex gap-4 mt-2">
                                <div>
                                    <label htmlFor="report-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        id="report-tags"
                                        value={editableTags.join(', ')}
                                        onChange={(e) => setEditableTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="report-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select
                                        id="report-status"
                                        value={editableStatus}
                                        onChange={(e) => setEditableStatus(e.target.value as 'draft' | 'published' | 'archived')}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold">{editableTitle}</h1>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0"> 
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
                                onClick={() => editor && handleEditorSave(editor.getHTML())}
                                disabled={isSaving || isDeleting}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditable(true)}
                                    disabled={isDeleting || isSaving}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDeleteReport}
                                    disabled={isDeleting || isSaving}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    title="Delete Report"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </>
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