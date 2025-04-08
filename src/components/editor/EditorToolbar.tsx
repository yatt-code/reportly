import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code2 // Using Lucide icons as an example
} from 'lucide-react'; // Example using lucide-react icons

// You might need to install lucide-react: npm install lucide-react

interface EditorToolbarProps {
    editor: Editor | null;
}

/**
 * A basic toolbar component for the TipTap editor.
 * Provides buttons for common formatting actions.
 */
const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    // Helper to create button props
    const getButtonProps = (action: () => void, isActive: boolean) => ({
        onClick: (e: React.MouseEvent) => {
            e.preventDefault(); // Prevent editor losing focus
            action();
        },
        'data-active': isActive,
        className: `p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-300 dark:bg-gray-600' : ''}`,
        type: 'button' as 'button', // Ensure type is button
    });

    return (
        <div className="editor-toolbar flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleBold().run(),
                    editor.isActive('bold')
                )}
                aria-label="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleItalic().run(),
                    editor.isActive('italic')
                )}
                 aria-label="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleStrike().run(),
                    editor.isActive('strike')
                )}
                 aria-label="Strikethrough"
            >
                <Strikethrough size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleCode().run(),
                    editor.isActive('code')
                )}
                 aria-label="Inline Code"
            >
                <Code size={18} />
            </button>
            <div className="border-l border-gray-400 dark:border-gray-600 h-6 mx-1"></div> {/* Separator */}
            <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                    editor.isActive('heading', { level: 1 })
                )}
                 aria-label="Heading 1"
            >
                <Heading1 size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                    editor.isActive('heading', { level: 2 })
                )}
                 aria-label="Heading 2"
            >
                <Heading2 size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                    editor.isActive('heading', { level: 3 })
                )}
                 aria-label="Heading 3"
            >
                <Heading3 size={18} />
            </button>
             <div className="border-l border-gray-400 dark:border-gray-600 h-6 mx-1"></div> {/* Separator */}
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleBulletList().run(),
                    editor.isActive('bulletList')
                )}
                 aria-label="Bullet List"
            >
                <List size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleOrderedList().run(),
                    editor.isActive('orderedList')
                )}
                 aria-label="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleBlockquote().run(),
                    editor.isActive('blockquote')
                )}
                 aria-label="Blockquote"
            >
                <Quote size={18} />
            </button>
             <button
                {...getButtonProps(
                    () => editor.chain().focus().toggleCodeBlock().run(),
                    editor.isActive('codeBlock')
                )}
                 aria-label="Code Block"
            >
                <Code2 size={18} />
            </button>
            {/* Add more buttons as needed (e.g., undo, redo, image insert) */}
        </div>
    );
};

export default EditorToolbar;