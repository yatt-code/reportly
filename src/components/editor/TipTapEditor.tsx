'use client'; // This component uses hooks, so it needs to be a Client Component

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { createLowlight, common } from 'lowlight'; // Correct way to import lowlight
import MermaidExtension from './extensions/mermaidExtension'; // Custom Mermaid node
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAiAssist } from '@/hooks/useAiAssist'; // AI hook (stubbed usage for now)
import logger from '@/lib/utils/logger';

// Initialize lowlight with common languages
const lowlight = createLowlight(common);

// --- Lowlight Syntax Highlighting Setup ---
// Register languages you need. Importing 'common' includes many popular ones.
// Example: Registering specific languages if 'common' is too large
// import css from 'highlight.js/lib/languages/css';
// import js from 'highlight.js/lib/languages/javascript';
// import ts from 'highlight.js/lib/languages/typescript';
// import html from 'highlight.js/lib/languages/xml'; // HTML is under XML
// lowlight.registerLanguage('html', html);
// lowlight.registerLanguage('css', css);
// lowlight.registerLanguage('js', js);
// lowlight.registerLanguage('ts', ts);
// -----------------------------------------

/**
 * Props for the TipTapEditor component.
 */
interface TipTapEditorProps {
    /** Initial content for the editor (HTML string). */
    defaultValue?: string;
    /** Whether the editor is editable or read-only. Defaults to true. */
    editable?: boolean;
    /** Callback function triggered on autosave or manual save. Receives editor content as HTML. */
    onSave?: (content: string) => Promise<void> | void;
    /** Placeholder text to show when the editor is empty. */
    placeholder?: string;
    // /** Optional: AI suggestions to display (future enhancement). */
    // suggestions?: string[]; // Currently unused in this MVP
}

/**
 * A rich text editor component based on TipTap for writing reports.
 * Features include Markdown formatting, code blocks, Mermaid diagrams,
 * image pasting, autosave, and Ctrl+Enter save shortcut.
 */
const TipTapEditor: React.FC<TipTapEditorProps> = ({
    defaultValue = '',
    editable = true,
    onSave,
    placeholder = 'Start writing your report...',
    // suggestions = [], // Currently unused
}) => {
    // --- State and Hooks ---
    const { suggestions: aiSuggestions, isLoading: aiLoading, error: aiError, getSuggestions } = useAiAssist(); // AI Hook

    // Define editor state first
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({ placeholder }),
            CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
            Image.configure({ inline: false, allowBase64: true }),
            MermaidExtension,
        ],
        content: defaultValue,
        editable: editable,
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none`,
            },
        },
        // onUpdate and onBlur will be added via useEffect to access the latest callbacks
    });

    // Define save handlers *after* editor is initialized
    const handleSave = useCallback(async (editorInstance: Editor) => { // editorInstance will always be defined here
        if (!onSave) return;
        const htmlContent = editorInstance.getHTML();
        logger.log('[TipTapEditor] Saving content...');
        try {
            await onSave(htmlContent);
        } catch (error) {
            logger.error('[TipTapEditor] Error during onSave callback:', error instanceof Error ? error : new Error(String(error)));
        }
    }, [onSave]); // Depends only on onSave prop

    const { triggerSave, saveImmediately } = useAutoSave(
        () => { // Define the callback inline for useAutoSave
            if (editor) {
                 return handleSave(editor);
            }
            return Promise.resolve(); // Return promise if editor not ready
        },
        2000 // Autosave delay
    );

    // --- Effects for Editor Updates ---

    // Effect to handle editor content updates (triggering autosave)
    useEffect(() => {
        if (!editor) return;

        const handleUpdate = ({ editor: currentEditor }: { editor: Editor }) => {
            if (onSave) {
                triggerSave(currentEditor.getHTML()); // Pass content to triggerSave
            }
            // AI Suggestion Trigger Logic can go here if needed
        };

        editor.on('update', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, onSave, triggerSave]); // Add triggerSave dependency


    // Effect for Ctrl+Enter Shortcut

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                if (editor && editable && onSave) { // Check editor exists here
                    event.preventDefault();
                    logger.log('[TipTapEditor] Ctrl+Enter detected, triggering immediate save.');
                    // Pass the current content directly to saveImmediately
                    saveImmediately(editor.getHTML());
                }
            }
        };

        // Get the editor element safely
        const editorViewDom = editor?.view.dom;
        if (editorViewDom) {
            editorViewDom.addEventListener('keydown', handleKeyDown as EventListener);
        }

        return () => {
            if (editorViewDom) {
                editorViewDom.removeEventListener('keydown', handleKeyDown as EventListener);
            }
        };
    }, [editor, editable, onSave, saveImmediately]); // Add editor to dependencies


    // --- Effect to update editable state ---
     useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    // --- Effect to update content if defaultValue changes externally ---
    // Be cautious with this, might cause issues if user is typing
    // useEffect(() => {
    //     if (editor && defaultValue !== editor.getHTML()) {
    //         // editor.commands.setContent(defaultValue, false); // `false` prevents firing update event
    //     }
    // }, [defaultValue, editor]);


    // --- AI Suggestion Display (Placeholder) ---
    // This is where you might render suggestions, e.g., in a sidebar or inline
    // useEffect(() => {
    //     if (aiSuggestions.length > 0) {
    //         console.log("AI Suggestions:", aiSuggestions);
    //         // Implement display logic
    //     }
    // }, [aiSuggestions]);
    // if (aiLoading) { /* Show loading indicator */ }
    // if (aiError) { /* Show error message */ }
    // -----------------------------------------


    if (!editor) {
        return null; // Or a loading state
    }

    return (
        <div className="report-editor border border-gray-300 dark:border-gray-700 rounded-md">
            {/* Optional Toolbar */}
            {/* <EditorToolbar editor={editor} /> */}
            <EditorContent editor={editor} />
            {/* Placeholder for AI Suggestions UI */}
            {/* {aiSuggestions.length > 0 && <div className="ai-suggestions">...</div>} */}
        </div>
    );
};

export default TipTapEditor;

// TODO: Create EditorToolbar component if needed
// TODO: Implement proper image upload instead of Base64
// TODO: Refine AI suggestion triggering and display
// TODO: Add specific CSS for editor elements, including dark mode adjustments beyond prose classes