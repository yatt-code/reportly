'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCommentsByReport } from '@/app/actions/comment/getCommentsByReport';
import type { CommentData } from '@/lib/schemas/commentSchemas';
import { useDemo } from '@/contexts/DemoContext'; // Import useDemo
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
    const demoContext = useDemo(); // Get demo context

    // Fetch comments when the component mounts or reportId changes
    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (demoContext.isDemoMode) {
            logger.log('[CommentSection] Fetching comments from DemoContext...', { reportId });
            try {
                // Simulate async fetch for demo mode if needed, though getDemoComments is sync
                // await new Promise(resolve => setTimeout(resolve, 300)); 
                const demoComments = demoContext.getDemoComments(reportId);
                // Ensure demo comments align with CommentData structure, especially user details
                // The DemoComment interface in DemoContext already has userDisplayName and userAvatarUrl
                setComments(demoComments as unknown as CommentData[]); // Cast if necessary, ensure alignment
                logger.log('[CommentSection] Demo comments fetched successfully.', { count: demoComments.length });
            } catch (err) {
                const fetchError = err instanceof Error ? err : new Error(String(err));
                logger.error('[CommentSection] Error fetching demo comments.', { reportId, error: fetchError });
                setError(fetchError.message);
                setComments([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            logger.log('[CommentSection] Fetching comments from server...', { reportId });
            try {
                const result = await getCommentsByReport(reportId);
                if (result.success) {
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
        }
    }, [reportId, demoContext]); // Add demoContext to dependencies

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
        // This optimistic update should work fine for both demo and live mode initially.
        // In demo mode, after demoContext.deleteDemoComment is called (presumably in CommentThread),
        // fetchComments() could be re-triggered to ensure sync with DemoContext state.
        // Or, if demoContext state updates trigger a re-render of this component through props/context changes,
        // that would also work. For now, optimistic removal is fine.
        logger.log('[CommentSection] Optimistically deleting comment.', { deletedCommentId });
        setComments(prevComments => prevComments.filter(c => c._id !== deletedCommentId && c.parentId !== deletedCommentId));
        // To ensure consistency after demo deletion, one might call fetchComments() here,
        // but it depends on how CommentThread handles demo deletion.
        // if (demoContext.isDemoMode) {
        // fetchComments(); // Re-fetch to ensure sync with demo context after deletion
        // }
    }, []); // Removed demoContext from here as direct fetch isn't essential for optimistic UI


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