'use client';

import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

interface ReportMetaEditorProps {
  tags: string[];
  sentimentTags: string[];
  status: 'draft' | 'published' | 'archived';
  onUpdate: (updates: {
    tags?: string[];
    sentimentTags?: string[];
    status?: 'draft' | 'published' | 'archived';
  }) => void;
}

/**
 * Component for editing report metadata like tags and status.
 */
const ReportMetaEditor: React.FC<ReportMetaEditorProps> = ({
  tags = [],
  sentimentTags = [],
  status = 'draft',
  onUpdate,
}) => {
  const [newTag, setNewTag] = useState('');
  const [newSentimentTag, setNewSentimentTag] = useState('');

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onUpdate({ tags: updatedTags });
      setNewTag('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onUpdate({ tags: updatedTags });
  };

  // Handle adding a new sentiment tag
  const handleAddSentimentTag = () => {
    if (newSentimentTag.trim() && !sentimentTags.includes(newSentimentTag.trim())) {
      const updatedSentimentTags = [...sentimentTags, newSentimentTag.trim()];
      onUpdate({ sentimentTags: updatedSentimentTags });
      setNewSentimentTag('');
    }
  };

  // Handle removing a sentiment tag
  const handleRemoveSentimentTag = (tagToRemove: string) => {
    const updatedSentimentTags = sentimentTags.filter(tag => tag !== tagToRemove);
    onUpdate({ sentimentTags: updatedSentimentTags });
  };

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'draft' | 'published' | 'archived';
    onUpdate({ status: newStatus });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Report Metadata</h3>
      
      {/* Status */}
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={handleStatusChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      {/* Tags */}
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <div key={tag} className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md">
              <span className="text-sm">{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add a tag"
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Sentiment Tags */}
      <div>
        <label htmlFor="sentimentTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sentiment Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {sentimentTags.map(tag => (
            <div key={tag} className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md">
              <span className="text-sm">{tag}</span>
              <button
                onClick={() => handleRemoveSentimentTag(tag)}
                className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            id="sentimentTags"
            value={newSentimentTag}
            onChange={(e) => setNewSentimentTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSentimentTag()}
            placeholder="Add a sentiment tag"
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handleAddSentimentTag}
            className="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportMetaEditor;
