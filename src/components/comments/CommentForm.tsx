'use client';

import React, { useState } from 'react';
import { postComment } from '@/app/actions/comment/postComment';
import type { CommentData } from '@/lib/schemas/commentSchemas'; // Import frontend type
import logger from '@/lib/utils/logger';
import toast from 'react-hot-toast';
import { Loader2, Send } from 'lucide-react';
import MentionInput from './MentionInput'; // Import the mention input component

interface CommentFormProps {
    reportId: string;
    parentId?: string | null; // Optional parent ID for replies
    onSuccess: (newComment: CommentData) => void; // Callback after successful post
    onCancel?: () => void; // Optional callback to cancel (e.g., hide reply form)
    placeholder?: string;
}

/**
 * Form for posting new comments or replies.
 */
const CommentForm: React.FC<CommentFormProps> = ({
    reportId,
    parentId = null,
    onSuccess,
    onCancel,
    placeholder = "Write a comment...",
}) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!content.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading(parentId ? 'Posting reply...' : 'Posting comment...');
        logger.log('[CommentForm] Posting comment...', { reportId, parentId, contentLength: content.length });

        try {
            const result = await postComment({
                reportId,
                content: content.trim(),
                parentId,
                // TODO: Add mention parsing/extraction logic here if needed
                // mentions: extractMentions(content),
            });

            if (result.success && result.comment) {
                logger.log('[CommentForm] Comment posted successfully.', { commentId: result.comment._id });
                toast.success(parentId ? 'Reply posted!' : 'Comment posted!', { id: toastId });
                // Call onSuccess callback with the new comment data (needs mapping if types differ)
                // Assuming server action returns data compatible with CommentData for now
                onSuccess(result.comment as CommentData);
                setContent(''); // Clear the form
                if (parentId && onCancel) {
                    onCancel(); // Close reply form after success
                }
            } else if (!result.success) { // Check failure case before accessing error
                throw new Error(result.error || 'Failed to post comment.');
            } else {
                // Should not happen if success is true but comment is missing
                throw new Error('Comment posted but no data returned.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[CommentForm] Error posting comment.', error);
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 mb-6">
            {/* Replace textarea with MentionInput */}
            <MentionInput
                value={content}
                onChange={setContent} // Pass the setter function directly
                placeholder={placeholder}
                rows={parentId ? 2 : 3}
                disabled={isLoading}
                className="w-full text-sm dark:bg-gray-700 dark:text-white disabled:opacity-70" // Pass base classes
            />
            <div className="flex justify-end items-center mt-2 gap-2">
                {parentId && onCancel && (
                     <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                    {isLoading ? (parentId ? 'Replying...' : 'Posting...') : (parentId ? 'Reply' : 'Post Comment')}
                </button>
            </div>
        </form>
    );
};

export default CommentForm;