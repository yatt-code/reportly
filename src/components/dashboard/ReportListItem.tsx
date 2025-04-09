'use client'; // Needs state for actions/modals

import React, { useState } from 'react';
import Link from 'next/link';
// Import the specific type needed for this component
import type { ReportListItemData } from '@/lib/schemas/reportSchemas';
import { FileText, Tag, Trash2, Copy, Pin, PinOff, Share2, MoreVertical, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // For notifications
// Import server actions (adjust paths if needed)
import { deleteReport } from '@/app/report/actions/deleteReport';
import { duplicateReport } from '@/app/report/actions/duplicateReport';
// Assume a Pin/Share action exists or will be created
// import { togglePinReport } from '@/app/report/actions/togglePinReport';
// import { generateShareLink } from '@/app/report/actions/generateShareLink';
import logger from '@/lib/utils/logger';
import { useUser } from '@/lib/useUser'; // Import useUser to get current user ID
import { useHasRole } from '@/lib/rbac/hooks'; // Import role checking hook

interface ReportListItemProps {
    report: ReportListItemData; // Use the specific data type
    onDelete: (reportId: string) => void;
    onDuplicate: (newReport: ReportListItemData) => void; // Callback now expects the list item type
    // Add callbacks for pin/share if implementing state updates
}

/**
 * Displays a single report item in the list or grid view.
 */
const ReportListItem: React.FC<ReportListItemProps> = ({ report, onDelete, onDuplicate }) => {
    const { user } = useUser(); // Get current user
    const isAdmin = useHasRole('admin'); // Check if user is admin
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isPinned, setIsPinned] = useState(false); // Mock pinned state
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const formattedDate = report.createdAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const statusColor = report.status === 'Complete' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';

    // Simple tag coloring based on common words (customize as needed)
    const getTagColor = (tag: string): string => {
        if (tag.includes('issue') || tag.includes('bug')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        if (tag.includes('feature') || tag.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (tag.includes('task') || tag.includes('plan')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    // --- Action Handlers ---

    const handleDelete = async () => {
        setShowConfirmDelete(false); // Close modal first
        setIsDeleting(true);
        logger.log('[ReportListItem] Deleting report...', { id: report.id });
        const toastId = toast.loading('Deleting report...');

        try {
            const result = await deleteReport(report.id);
            if (result.success) {
                toast.success('Report deleted successfully!', { id: toastId });
                logger.log('[ReportListItem] Report deleted successfully.', { id: report.id });
                onDelete(report.id); // Notify parent to remove from list
            } else {
                throw new Error(result.error || 'Failed to delete report.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[ReportListItem] Error deleting report.', { id: report.id, error });
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDuplicate = async () => {
        setIsDuplicating(true);
        logger.log('[ReportListItem] Duplicating report...', { id: report.id });
        const toastId = toast.loading('Duplicating report...');

        try {
            // The server action now gets the user ID from the session
            const result = await duplicateReport(report.id);
            if (result.success && result.newReport) {
                toast.success('Report duplicated successfully!', { id: toastId });
                logger.log('[ReportListItem] Report duplicated successfully.', { oldId: report.id, newId: result.newReport._id });
                // Map the duplicated report (which might be a full ReportDocument)
                // to the ReportListItemData structure needed by the parent list
                const newListItemData: ReportListItemData = {
                    id: result.newReport._id, // Use consistent 'id'
                    title: result.newReport.title,
                    status: 'Draft', // Assume draft status
                    createdAt: new Date(result.newReport.createdAt),
                    sentimentTags: [], // Assume no tags initially
                };
                onDuplicate(newListItemData); // Notify parent with the correct type
            } else if (!result.success) { // Check if the operation failed before accessing error
                throw new Error(result.error || 'Failed to duplicate report.');
            } else {
                 // Should not happen if success is true but newReport is missing
                 throw new Error('Duplication succeeded but no new report data returned.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[ReportListItem] Error duplicating report.', { id: report.id, error });
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setIsDuplicating(false);
        }
    };

    const handleTogglePin = () => {
        // Mock implementation - toggle local state and show toast
        const newState = !isPinned;
        setIsPinned(newState);
        toast.success(newState ? 'Report pinned!' : 'Report unpinned!');
        // TODO: Call actual server action: togglePinReport(report.id, newState);
        logger.log('[ReportListItem] Toggled pin status (mock).', { id: report.id, pinned: newState });
    };

    const handleShare = () => {
        // Mock implementation - show toast with fake link
        const fakeLink = `${window.location.origin}/share/${report.id.substring(0, 8)}`;
        toast.success(`Share link copied (mock): ${fakeLink}`);
        navigator.clipboard.writeText(fakeLink).catch(err => logger.error('Failed to copy mock link', err));
        // TODO: Call actual server action: generateShareLink(report.id);
        logger.log('[ReportListItem] Generated share link (mock).', { id: report.id });
    };


    // --- Render Logic ---
    return (
        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow group">
            {/* Main Content Area (Link) */}
            <Link href={`/report/${report.id}`} className="block mb-2">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                        <h4 className="font-semibold mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.title}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                            <span className={statusColor}>{report.status}</span>
                            <span>&bull;</span>
                            <span>{formattedDate}</span>
                        </div>
                        {report.sentimentTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {report.sentimentTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${getTagColor(tag)}`}
                                    >
                                        <Tag size={12} /> {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Action Buttons - Show on hover or via dropdown */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 {/* Pin Button */}
                 <button
                    onClick={handleTogglePin}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={isPinned ? "Unpin Report" : "Pin Report"}
                 >
                    {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                 </button>
                 {/* Share Button */}
                 <button
                    onClick={handleShare}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Share Report"
                 >
                    <Share2 size={14} />
                 </button>
                 {/* Duplicate Button */}
                 <button
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    title="Duplicate Report"
                 >
                    {isDuplicating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                 </button>
                 {/* Delete Button - Show if user owns the report OR if user is admin */}
                 {/* We need the report owner's ID here. Assuming ReportListItemData includes it or we fetch it */}
                 {/* For now, let's assume only admins can delete via dashboard for simplicity, or add owner check */}
                 {/* Example check if report object had ownerId: (user?.id === report.ownerId || isAdmin) */}
                 {isAdmin && ( // Simplified: Only show delete to admin for now
                     <button
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={isDeleting}
                        className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                        title="Delete Report (Admin)"
                     >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                     </button>
                 )}
                 {/* TODO: Consider using a Dropdown Menu (e.g., from Shadcn/ui) for more actions */}
                 {/* <button className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><MoreVertical size={14} /></button> */}
            </div>

             {/* Confirmation Modal for Delete */}
             {showConfirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-auto">
                        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the report "{report.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </div> // Add missing closing div for the main container started on line 125
    );
};

export default ReportListItem;