'use client';

import React, { useState } from 'react';
import type { CommentData } from '@/lib/schemas/commentSchemas';
import { useUser } from '@/lib/useUser'; // To check ownership/admin
import { useHasRole } from '@/lib/rbac'; // Use barrel file import
import { deleteComment } from '@/app/actions/comment/deleteComment';
import logger from '@/lib/utils/logger';
import toast from 'react-hot-toast';
import { UserCircle, MessageSquare, Trash2, CornerDownRight, Loader2 } from 'lucide-react'; // Icons
import CommentForm from './CommentForm'; // For replying

interface CommentItemProps {
    comment: CommentData;
    depth: number; // For indentation
    onDelete: (commentId: string) => void; // Callback to notify parent of deletion
    onReplySuccess: (newReply: CommentData) => void; // Callback after successful reply
}

// Helper to format dates (e.g., "2 hours ago", "on Jan 5")
const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.max(0, Math.floor(seconds)) + "s ago";
};


/**
 * Displays a single comment item, including author info, content, timestamp,
 * and actions like Reply and Delete.
 */
const CommentItem: React.FC<CommentItemProps> = ({ comment, depth, onDelete, onReplySuccess }) => {
    const { user: currentUser } = useUser();
    const isAdmin = useHasRole('admin');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isOwner = currentUser?.id === comment.userId;
    const canDelete = isOwner || isAdmin;

    const handleDelete = async () => {
        setIsDeleting(true);
        const toastId = toast.loading('Deleting comment...');
        logger.log('[CommentItem] Deleting comment...', { commentId: comment._id });
        try {
            const result = await deleteComment(comment._id);
            if (result.success) {
                toast.success('Comment deleted.', { id: toastId });
                logger.log('[CommentItem] Comment deleted successfully.', { commentId: comment._id });
                onDelete(comment._id); // Notify parent
            } else {
                throw new Error(result.error || 'Failed to delete comment.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[CommentItem] Error deleting comment.', { commentId: comment._id, error });
            toast.error(`Error: ${error.message}`, { id: toastId });
            setIsDeleting(false); // Only reset on error
        }
        // No finally block needed if onDelete removes the component
    };

    const handleReplySuccess = (newReply: CommentData) => {
        setShowReplyForm(false); // Hide form after successful reply
        onReplySuccess(newReply); // Bubble up to parent
    };

    // Basic indentation based on depth
    const indentationStyle = { marginLeft: `${depth * 1.5}rem` }; // Adjust multiplier as needed

    return (
        <div className={`comment-item py-3 ${depth > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`} style={indentationStyle} role="comment" aria-labelledby={`comment-author-${comment._id}`}>
            <div className="flex items-start space-x-3">
                {/* Avatar Placeholder */}
                <div className="flex-shrink-0">
                    {comment.user?.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt={comment.user.name || 'User'} className="h-8 w-8 rounded-full" />
                    ) : (
                        <UserCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Author and Timestamp */}
                    <div className="text-sm flex items-center space-x-2">
                        <span id={`comment-author-${comment._id}`} className="font-semibold text-gray-900 dark:text-white">
                            {comment.user?.name || `User ${comment.userId.substring(0, 6)}`}
                        </span>
                        {/* Use semantic <time> element */}
                        <time dateTime={comment.createdAt} className="text-gray-500 dark:text-gray-400 text-xs" title={new Date(comment.createdAt).toLocaleString()}>
                            &bull; {timeAgo(comment.createdAt)}
                        </time>
                    </div>

                    {/* Comment Content */}
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                        {/* TODO: Add markdown rendering or sanitization if needed */}
                        {comment.content}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2 flex items-center space-x-3 text-xs">
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Reply to comment"
                            aria-label="Reply to comment"
                        >
                            <CornerDownRight size={14} /> Reply
                        </button>

                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                                title="Delete Comment"
                                aria-label="Delete comment"
                            >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>

                     {/* Reply Form */}
                     {showReplyForm && (
                        <CommentForm
                            reportId={comment.reportId}
                            parentId={comment._id}
                            onSuccess={handleReplySuccess}
                            onCancel={() => setShowReplyForm(false)}
                            placeholder={`Replying to ${comment.user?.name || 'user'}...`}
                        />
                     )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;