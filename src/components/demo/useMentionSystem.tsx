'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface MentionUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
}

// Mock demo users for @mentions
export const DEMO_USERS: MentionUser[] = [
  {
    id: 'demo-user-1',
    displayName: 'Demo User',
    username: 'demo.user',
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
  },
  {
    id: 'demo-user-2',
    displayName: 'Test Writer',
    username: 'test.writer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Test+Writer&background=4CAF50&color=fff',
  },
  {
    id: 'demo-user-3',
    displayName: 'Mock Collaborator',
    username: 'mock.collab',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mock+Collaborator&background=F44336&color=fff',
  },
  // Added users from canvas.md
  {
    id: 'demo-user-4',
    displayName: 'David',
    username: 'david',
    avatarUrl: 'https://ui-avatars.com/api/?name=David&background=9C27B0&color=fff',
  },
  {
    id: 'demo-user-5',
    displayName: 'Nora',
    username: 'nora',
    avatarUrl: 'https://ui-avatars.com/api/?name=Nora&background=FF9800&color=fff',
  },
  {
    id: 'demo-user-6',
    displayName: 'Han',
    username: 'han',
    avatarUrl: 'https://ui-avatars.com/api/?name=Han&background=795548&color=fff',
  },
];

/**
 * Custom hook for handling @mentions in text inputs
 */
export function useMentionSystem(initialContent = '') {
  const [content, setContent] = useState(initialContent);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle input changes and detect @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check if we should show the mention dropdown
    const lastAtIndex = newContent.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = newContent.substring(lastAtIndex + 1);
      // If there's a space after @, don't show the dropdown
      if (!textAfterAt.includes(' ') && (lastAtIndex === 0 || newContent[lastAtIndex - 1] === ' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);

        // Calculate position for the dropdown based on caret position
        if (inputRef.current) {
          const textarea = inputRef.current;
          const caretPosition = textarea.selectionStart;
          
          // Create a temporary element to measure text width
          const tempSpan = document.createElement('span');
          tempSpan.style.position = 'absolute';
          tempSpan.style.visibility = 'hidden';
          tempSpan.style.whiteSpace = 'pre-wrap';
          tempSpan.style.font = window.getComputedStyle(textarea).font;
          tempSpan.style.padding = window.getComputedStyle(textarea).padding;
          tempSpan.style.width = window.getComputedStyle(textarea).width;
          
          // Get text before caret
          const textBeforeCaret = newContent.substring(0, caretPosition);
          
          // Split by lines to find the current line
          const lines = textBeforeCaret.split('\n');
          const currentLine = lines[lines.length - 1];
          
          // Set content to measure
          tempSpan.textContent = currentLine;
          document.body.appendChild(tempSpan);
          
          // Get measurements
          const { width } = tempSpan.getBoundingClientRect();
          document.body.removeChild(tempSpan);
          
          // Calculate line height (approximate)
          const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
          
          // Get textarea position
          const { top, left } = textarea.getBoundingClientRect();
          
          // Calculate position
          const lineCount = lines.length - 1; // 0-based index
          const dropdownTop = top + (lineCount * lineHeight) + window.scrollY + 25; // Add some padding
          const dropdownLeft = left + Math.min(width, textarea.clientWidth - 150); // Ensure dropdown is visible
          
          setMentionPosition({
            top: dropdownTop,
            left: dropdownLeft,
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle selecting a user from the mention dropdown
  const handleSelectMention = (user: MentionUser) => {
    const lastAtIndex = content.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      // Replace the @query with the selected user
      const newContent = content.substring(0, lastAtIndex) + `@${user.username} `;
      setContent(newContent);
      
      // Focus the textarea and set cursor position after the inserted mention
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPosition = lastAtIndex + user.username.length + 2; // +2 for @ and space
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = newCursorPosition;
            inputRef.current.selectionEnd = newCursorPosition;
          }
        }, 0);
      }
    }
    setShowMentions(false);
  };

  // Close the mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    content,
    setContent,
    showMentions,
    setShowMentions,
    mentionQuery,
    mentionPosition,
    inputRef,
    handleInputChange,
    handleSelectMention,
  };
}

/**
 * Format mentions in comment content
 */
export function formatMentions(content: string) {
  // Regular expression to match @username patterns
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;
  
  // Split the content by mentions
  const parts = content.split(mentionRegex);
  
  if (parts.length <= 1) {
    return content; // No mentions found
  }
  
  // Build the result with highlighted mentions
  const result: React.ReactNode[] = [];
  let i = 0;
  
  // Iterate through the parts and rebuild the content with styled mentions
  for (let j = 0; j < parts.length; j++) {
    if (j % 2 === 0) {
      // Regular text
      if (parts[j]) {
        result.push(<span key={`text-${i++}`}>{parts[j]}</span>);
      }
    } else {
      // Mention
      result.push(
        <span 
          key={`mention-${i++}`}
          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1 rounded"
        >
          @{parts[j]}
        </span>
      );
    }
  }
  
  return result;
}
