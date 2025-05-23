'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, Loader2 } from 'lucide-react';
import DemoMentionDropdown from './DemoMentionDropdown';
import { useMentionSystem, DEMO_USERS } from './useMentionSystem.tsx';

interface DemoCommentFormProps {
  reportId: string;
  parentId?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
}

/**
 * A form for adding comments in demo mode.
 */
const DemoCommentForm: React.FC<DemoCommentFormProps> = ({
  reportId,
  parentId,
  onSubmit,
  placeholder = 'Add a comment...',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use the shared mention system
  const {
    content,
    setContent,
    showMentions,
    mentionQuery,
    mentionPosition,
    inputRef,
    handleInputChange,
    handleSelectMention
  } = useMentionSystem('');

  // Handle client-side rendering for the portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, parentId);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 relative">
      <div className="flex items-start gap-2">
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={3}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {/* Mention dropdown */}
      {showMentions && isMounted && createPortal(
        <DemoMentionDropdown
          users={DEMO_USERS}
          query={mentionQuery}
          onSelect={handleSelectMention}
          position={mentionPosition}
        />,
        document.body
      )}
    </form>
  );
};

export default DemoCommentForm;
