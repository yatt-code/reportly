'use client';

import React, { useState } from 'react';
import { Reply, Trash2, Loader2 } from 'lucide-react';
import DemoCommentForm from './DemoCommentForm';
import { formatMentions } from './useMentionSystem.tsx';

// Define the shape of a demo comment
interface DemoComment {
  _id: string;
  reportId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userDisplayName: string;
  userAvatarUrl?: string;
}

interface DemoCommentListProps {
  comments: DemoComment[];
  reportId: string;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

/**
 * Component to display a list of comments with reply functionality.
 */
const DemoCommentList: React.FC<DemoCommentListProps> = ({
  comments,
  reportId,
  onAddComment,
  onDeleteComment,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter top-level comments (no parentId)
  const topLevelComments = comments.filter(comment => !comment.parentId);

  // Get replies for a specific comment
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parentId === commentId);
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // We're now using the formatMentions function from useMentionSystem

  // Handle reply submission
  const handleReplySubmit = async (content: string, parentId?: string) => {
    await onAddComment(content, parentId);
    setReplyingTo(null);
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await onDeleteComment(commentId);
    } finally {
      setDeletingId(null);
    }
  };

  // Render a single comment
  const renderComment = (comment: DemoComment, isReply = false) => {
    const replies = getReplies(comment._id);

    return (
      <div key={comment._id} className={`${isReply ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {comment.userAvatarUrl ? (
                <img
                  src={comment.userAvatarUrl}
                  alt={comment.userDisplayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {comment.userDisplayName.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium">{comment.userDisplayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteComment(comment._id)}
              disabled={deletingId === comment._id}
              className="text-red-500 hover:text-red-700 p-1"
            >
              {deletingId === comment._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="mt-2 text-gray-700 dark:text-gray-300">
            {formatMentions(comment.content)}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
              className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline"
            >
              <Reply className="w-4 h-4" />
              {replyingTo === comment._id ? 'Cancel' : 'Reply'}
            </button>
          </div>

          {/* Reply form */}
          {replyingTo === comment._id && (
            <div className="mt-3">
              <DemoCommentForm
                reportId={reportId}
                parentId={comment._id}
                onSubmit={handleReplySubmit}
                placeholder={`Reply to ${comment.userDisplayName}...`}
              />
            </div>
          )}
        </div>

        {/* Render replies */}
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {topLevelComments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
      ) : (
        <div>
          {topLevelComments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default DemoCommentList;
