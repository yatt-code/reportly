'use client'; // This component uses hooks, so it needs to be a Client Component

import React from 'react';
import { EditorContent, Editor } from '@tiptap/react';
// Removed imports for hooks and extensions as they will be managed by the parent
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
// import Image from '@tiptap/extension-image';
// import { createLowlight, common } from 'lowlight';
// import MermaidExtension from './extensions/mermaidExtension';
// import { useAutoSave } from '@/hooks/useAutoSave';
// import { useAiAssist } from '@/hooks/useAiAssist';
// import logger from '@/lib/utils/logger';

// Lowlight initialization will happen in the parent component where useEditor is called

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
    /** The TipTap editor instance created by the parent component. */
    editor: Editor | null;
    // Removed other props like defaultValue, editable, onSave, placeholder
    // as they are now configured directly in useEditor in the parent.
}

/**
 * A rich text editor component based on TipTap for writing reports.
 * Features include Markdown formatting, code blocks, Mermaid diagrams,
 * image pasting, autosave, and Ctrl+Enter save shortcut.
 */
const TipTapEditor: React.FC<TipTapEditorProps> = ({ editor }) => {
    // Removed internal hooks and effects (useEditor, useAutoSave, useEffects for keydown, editable, etc.)
    // These are now managed by the parent component (ReportPageContainer)

    if (!editor) {
        return (
            <div className="p-4 text-center text-gray-500">Initializing Editor...</div>
        ); // Or some other loading/placeholder state
    }

    return (
        <div className="report-editor border border-gray-300 dark:border-gray-700 rounded-md">
            {/* Optional Toolbar */}
            {/* Toolbar could also be passed the editor instance if needed */}
            {/* <EditorToolbar editor={editor} /> */}
            <EditorContent editor={editor} />
            {/* AI Suggestions display logic is handled by the parent */}
        </div>
    );
};

export default TipTapEditor;

// Removed TODOs related to internal logic now moved to parent