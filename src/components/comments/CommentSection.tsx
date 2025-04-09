'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCommentsByReport } from '@/app/actions/comment/getCommentsByReport';
import type { CommentData } from '@/lib/schemas/commentSchemas';
import logger from '@/lib/utils/logger';
import CommentForm from './CommentForm';
import CommentThread from './CommentThread';
import { Loader2, AlertTriangle, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
    reportId: string;
}

/**
 * Main component for displaying and interacting with comments for a specific report.
 * Fetches comments, handles optimistic updates for posts/deletes, and renders the thread.
 */
const CommentSection: React.FC<CommentSectionProps> = ({ reportId }) => {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch comments when the component mounts or reportId changes
    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        logger.log('[CommentSection] Fetching comments...', { reportId });
        try {
            const result = await getCommentsByReport(reportId);
            if (result.success) {
                // TODO: Fetch user details (name, avatar) for each comment's userId
                // and merge them into the comment objects before setting state.
                // For now, we use the raw comment data.
                setComments(result.comments as CommentData[]);
                logger.log('[CommentSection] Comments fetched successfully.', { count: result.comments.length });
            } else {
                throw new Error(result.error || 'Failed to fetch comments.');
            }
        } catch (err) {
            const fetchError = err instanceof Error ? err : new Error(String(err));
            logger.error('[CommentSection] Error fetching comments.', { reportId, error: fetchError });
            setError(fetchError.message);
            setComments([]); // Clear comments on error
        } finally {
            setIsLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Handler for successful new comment/reply post (optimistic update)
    const handlePostSuccess = useCallback((newComment: CommentData) => {
        // TODO: Merge user details into newComment if possible client-side
        setComments(prevComments => [...prevComments, newComment]);
        // Optionally scroll to the new comment
    }, []);

    // Handler for successful comment deletion (optimistic update)
    const handleDeleteSuccess = useCallback((deletedCommentId: string) => {
        // Remove the comment and any potential replies (simple removal for now)
        // A more robust solution might mark as deleted or handle nested deletion server-side
        setComments(prevComments => prevComments.filter(c => c._id !== deletedCommentId && c.parentId !== deletedCommentId));
        // Note: This simple filter doesn't remove deeper nested replies if parent is deleted.
    }, []);


    return (
        <div className="comment-section mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare size={22} /> Comments ({comments.length})
            </h2>

            {/* Top-level Comment Form */}
            <CommentForm
                reportId={reportId}
                onSuccess={handlePostSuccess}
                placeholder="Add a comment..."
            />

            {/* Display Area */}
            <div className="mt-6 space-y-4">
                {isLoading && (
                    <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        <span className="ml-2 text-gray-500">Loading comments...</span>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm flex items-center gap-2">
                        <AlertTriangle size={16} /> Error loading comments: {error}
                    </div>
                )}
                {!isLoading && !error && comments.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No comments yet. Be the first to comment!
                    </p>
                )}
                {!isLoading && !error && comments.length > 0 && (
                    <CommentThread
                        comments={comments}
                        onDelete={handleDeleteSuccess}
                        onReplySuccess={handlePostSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default CommentSection;