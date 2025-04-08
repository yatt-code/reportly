'use client'; // Needs state for managing displayed reports

import React, { useState } from 'react';
import { MockReport, getMockReports } from '@/lib/mockData'; // Import type and mock data function
import ReportListItem from './ReportListItem';
import { Loader2 } from 'lucide-react'; // Icon for loading state

const INITIAL_REPORT_COUNT = 5;
const REPORTS_PER_LOAD = 10; // Load 10 more each time
const MAX_REPORTS_TO_SHOW = 50; // Limit total reports shown

/**
 * Displays a list of recent reports with a "Show More" button.
 */
const ReportList: React.FC = () => {
    // Simulate fetching initial reports
    const [reports, setReports] = useState<MockReport[]>(() => getMockReports(INITIAL_REPORT_COUNT));
    const [displayedCount, setDisplayedCount] = useState(INITIAL_REPORT_COUNT);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // In a real app, you'd track if there are more reports available from the backend
    const [hasMoreReports, setHasMoreReports] = useState(true); // Assume more initially

    const loadMoreReports = () => {
        setIsLoadingMore(true);
        // Simulate fetching more reports
        setTimeout(() => {
            const newCount = Math.min(displayedCount + REPORTS_PER_LOAD, MAX_REPORTS_TO_SHOW);
            // Fetch *all* potential reports up to the new count from the mock source
            const allPossibleReports = getMockReports(newCount);
            setReports(allPossibleReports); // Replace the list with the newly fetched set
            setDisplayedCount(newCount);
            // Update hasMoreReports based on whether we reached the max or if the source has more
            // For mock data, assume we can always generate up to MAX_REPORTS_TO_SHOW
            setHasMoreReports(newCount < MAX_REPORTS_TO_SHOW);
            setIsLoadingMore(false);
        }, 500); // Simulate network delay
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
            {reports.length === 0 && !isLoadingMore ? (
                <p className="text-gray-500 dark:text-gray-400">No reports found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map((report) => (
                        <ReportListItem key={report.id} report={report} />
                    ))}
                </div>
            )}

            {/* Show More Button */}
            {hasMoreReports && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMoreReports}
                        disabled={isLoadingMore}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </>
                        ) : (
                            'Show More'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportList;