'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { createLowlight, common } from 'lowlight';
import MermaidExtension from '@/components/editor/extensions/mermaidExtension';
import TipTapEditor from '@/components/editor/TipTapEditor';
import EditorToolbar from '@/components/editor/EditorToolbar';
import ReportMetaEditor from '@/components/demo/ReportMetaEditor';
import DemoCommentForm from '@/components/demo/DemoCommentForm';
import DemoCommentList from '@/components/demo/DemoCommentList';
import { Loader2, AlertTriangle, ChevronLeft, Edit, Save, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import logger from '@/lib/utils/logger';

// Initialize lowlight
const lowlight = createLowlight(common);

interface DemoReportPageProps {
  reportId: string;
}

/**
 * Demo version of the report page that uses the demo context for data.
 */
const DemoReportPage: React.FC<DemoReportPageProps> = ({ reportId }) => {
  const { isDemoMode, getDemoReport, updateDemoReport, demoUser, addDemoComment, getDemoComments, deleteDemoComment } = useDemo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditParam = searchParams.get('edit') === 'true';

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [isEditable, setIsEditable] = useState(isEditParam);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  // Load the report from demo context
  useEffect(() => {
    const loadReport = () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const demoReport = getDemoReport(reportId);

        if (!demoReport) {
          setLoadError('Report not found');
          setReport(null);
        } else {
          setReport(demoReport);
          setEditableTitle(demoReport.title);
        }
      } catch (error) {
        logger.error('[DemoReportPage] Error loading report:', error);
        setLoadError('Failed to load report');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [reportId, getDemoReport]);

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Start writing your report details...' }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      Image.configure({ inline: false, allowBase64: true }),
      MermaidExtension,
    ],
    content: report?.content || '',
    editable: isEditable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]',
      },
    },
  });

  // Update editor content when report changes
  useEffect(() => {
    if (editor && report) {
      editor.commands.setContent(report.content);
    }
  }, [editor, report]);

  // Update editor editable state when isEditable changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  // Load comments
  useEffect(() => {
    if (reportId) {
      try {
        const reportComments = getDemoComments(reportId);
        setComments(reportComments || []);
      } catch (error) {
        logger.error('[DemoReportPage] Error loading comments:', error);
        setComments([]);
      }
    }
  }, [reportId, getDemoComments]);

  // Handler for saving the report content
  const handleEditorSave = useCallback(async (content: string) => {
    if (!report) {
      setSaveError('Cannot save: Report data not ready.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedReport = updateDemoReport(reportId, {
        title: editableTitle,
        content,
        updatedAt: new Date(),
      });

      if (updatedReport) {
        setReport(updatedReport);
        toast.success('Report saved successfully');
        setIsEditable(false);
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
      logger.error('[DemoReportPage] Error saving report:', error);
      setSaveError('Failed to save report');
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  }, [reportId, report, updateDemoReport, editableTitle]);

  // Handler for adding a comment
  const handleAddComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const newComment = addDemoComment({
        reportId,
        content,
        parentId: parentId || undefined,
      });

      // Update the comments list
      setComments(prevComments => [...prevComments, newComment]);
      toast.success('Comment added successfully');
    } catch (error) {
      logger.error('[DemoReportPage] Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  }, [reportId, addDemoComment]);

  // Handler for deleting a comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!commentId) {
      logger.error('[DemoReportPage] Cannot delete comment: No comment ID provided');
      toast.error('Failed to delete comment: No comment ID provided');
      return;
    }

    try {
      const success = deleteDemoComment(commentId);

      if (success) {
        // Update the comments list
        setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        toast.success('Comment deleted successfully');
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      logger.error('[DemoReportPage] Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  }, [deleteDemoComment]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading report...</span>
      </div>
    );
  }

  // Error state
  if (loadError || !report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-600 dark:text-red-400 mr-2" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error Loading Report</h2>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-400">{loadError || 'Report not found'}</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If not in demo mode, don't render anything
  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Report Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            {isEditable ? (
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Report Title"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold">{report.title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Edit/Save Button */}
            {isEditable ? (
              <button
                onClick={() => editor && handleEditorSave(editor.getHTML())}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditable(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Save Error Display */}
        {saveError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Save Failed:</strong> {saveError}
          </div>
        )}
      </div>

      {/* Metadata Editor (only visible in edit mode) */}
      {isEditable && (
        <ReportMetaEditor
          tags={report.tags || []}
          sentimentTags={report.sentimentTags || []}
          status={report.status}
          onUpdate={(updates) => {
            const updatedReport = updateDemoReport(reportId, updates);
            if (updatedReport) {
              setReport(updatedReport);
            }
          }}
        />
      )}

      {/* TipTap Editor */}
      <div className="report-editor border border-gray-300 dark:border-gray-700 rounded-md">
        {/* Editor Toolbar - only visible in edit mode */}
        {editor && isEditable && <EditorToolbar editor={editor} />}
        <TipTapEditor editor={editor} />
      </div>

      {/* Comment Section */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <DemoCommentForm
            reportId={reportId}
            onSubmit={handleAddComment}
          />
          <div className="mt-6">
            <DemoCommentList
              comments={comments}
              reportId={reportId}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReportPage;
