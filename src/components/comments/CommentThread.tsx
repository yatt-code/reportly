import React from 'react';
import type { CommentData } from '@/lib/schemas/commentSchemas';
import CommentItem from './CommentItem';

interface CommentThreadProps {
    comments: CommentData[]; // Flat list of all comments for the report
    parentId?: string | null; // ID of the parent to render children for (null for top-level)
    depth?: number; // Current nesting depth
    onDelete: (commentId: string) => void; // Pass down delete handler
    onReplySuccess: (newReply: CommentData) => void; // Pass down reply handler
}

/**
 * Recursively renders a thread of comments based on parentId relationships.
 */
const CommentThread: React.FC<CommentThreadProps> = ({
    comments,
    parentId = null,
    depth = 0,
    onDelete,
    onReplySuccess
}) => {
    // Filter comments that are direct children of the current parentId
    const childComments = comments.filter(comment => comment.parentId === parentId);

    if (childComments.length === 0) {
        return null; // No children to render at this level
    }

    return (
        <div className={`comment-thread ${depth > 0 ? 'ml-0' : ''}`}> {/* Adjust margin/padding based on depth if needed */}
            {childComments.map(comment => (
                <div key={comment._id}>
                    <CommentItem
                        comment={comment}
                        depth={depth}
                        onDelete={onDelete}
                        onReplySuccess={onReplySuccess}
                    />
                    {/* Recursively render replies to this comment */}
                    <CommentThread
                        comments={comments} // Pass the full list down
                        parentId={comment._id} // Render children of the current comment
                        depth={depth + 1} // Increment depth
                        onDelete={onDelete}
                        onReplySuccess={onReplySuccess}
                    />
                </div>
            ))}
        </div>
    );
};

export default CommentThread;