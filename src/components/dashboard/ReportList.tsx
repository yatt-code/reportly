'use client'; // Needs state for managing displayed reports

import React, { useState, useCallback } from 'react';
// Import the specific types needed
import type { MockReport } from '@/lib/mockData'; // Keep for mock data handling if needed
import type { ReportDocument } from '@/lib/schemas/reportSchemas';
import type { ReportListItemData } from '@/lib/schemas/reportSchemas'; // Import the list item type
import ReportListItem from './ReportListItem';
import { Loader2 } from 'lucide-react';
import logger from '@/lib/utils/logger'; // For logging actions
// Import server actions
import { deleteReport } from '@/app/report/actions/deleteReport';
import { duplicateReport } from '@/app/report/actions/duplicateReport';
import toast from 'react-hot-toast';

const INITIAL_REPORT_COUNT = 5;
const REPORTS_PER_LOAD = 10; // Load 10 more each time
const MAX_REPORTS_TO_SHOW = 50; // Limit total reports shown

// Helper function to map different report types to the consistent list item type
const mapToReportListItemData = (report: ReportDocument | MockReport): ReportListItemData => {
    // Basic status derivation (replace with actual logic if status exists on ReportDocument)
    const status = (report as MockReport).status || 'Complete'; // Default to Complete if not MockReport
    const tags = (report as MockReport).sentimentTags || (report as ReportDocument).ai_tags || [];

    return {
        // Use type assertion to safely access properties
        id: (report as ReportDocument)._id || (report as MockReport).id,
        title: report.title || 'Untitled Report', // Add fallback for title
        status: status,
        createdAt: new Date((report as ReportDocument).createdAt || (report as MockReport).createdAt),
        sentimentTags: tags,
    };
};


interface ReportListProps {
    initialReports: (ReportDocument | MockReport)[]; // Accept either type initially
    // Add props for pagination/loading if handled by parent later
    // totalReports?: number;
    // onLoadMore?: () => Promise<void>;
}

/**
 * Displays a list of recent reports. Handles client-side state updates
 * for delete and duplicate actions based on callbacks from ReportListItem.
 * Assumes initial reports are passed via props.
 */
const ReportList: React.FC<ReportListProps> = ({ initialReports = [] }) => {
    // Map initial data and manage state with the consistent type
    const [reports, setReports] = useState<ReportListItemData[]>(() =>
        initialReports.map(mapToReportListItemData)
    );
    // Removed state related to client-side loading more (should be handled by parent/server component)
    // const [displayedCount, setDisplayedCount] = useState(initialReports.length);
    // const [isLoadingMore, setIsLoadingMore] = useState(false);
    // const [hasMoreReports, setHasMoreReports] = useState(true); // Parent should indicate this

    // Removed loadMoreReports - parent component should handle fetching/pagination

    // Callback for handling deletion from a list item
    const handleDeleteReport = useCallback((reportIdToDelete: string) => {
        // Optimistically remove the report from the UI
        // Filter using the consistent 'id' field
        setReports(currentReports => currentReports.filter(report => report.id !== reportIdToDelete));
        logger.log('[ReportList] Report removed from local state.', { reportIdToDelete });
        // Note: Server action `deleteReport` handles actual deletion and toast notifications
    }, []);

    // Callback for handling duplication from a list item
    // Callback now receives ReportListItemData from the child component
    const handleDuplicateReport = useCallback((newListItemData: ReportListItemData) => {
        // Optimistically add the new report data (already mapped) to the UI
        setReports(currentReports => [newListItemData, ...currentReports]);
        logger.log('[ReportList] Duplicated report added to local state.', { newReportId: newListItemData.id });
        // Note: Server action `duplicateReport` handles actual creation and toast notifications
    }, []); // Empty dependency array

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
            {reports.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No reports found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map((reportData) => ( // Use a different variable name to avoid confusion
                        <ReportListItem
                            key={reportData.id} // Use the consistent 'id' from ReportListItemData
                            // Pass the correctly typed report data
                            report={reportData}
                            onDelete={handleDeleteReport}
                            onDuplicate={handleDuplicateReport}
                        />
                    ))}
                </div>
            )}

            {/* Removed Show More button - Pagination/loading handled by parent */}
        </div>
    );
};

export default ReportList;