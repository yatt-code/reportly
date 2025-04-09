import React from 'react';
// Removed Link and Plus imports as they are handled by the button component
import { Metadata } from 'next';
import NewReportButton from '@/components/dashboard/NewReportButton'; // Import the client component
import ActivityStats from '@/components/dashboard/ActivityStats';
import WeeklyActivityHeatmap from '@/components/dashboard/WeeklyActivityHeatmap';
import ReportList from '@/components/dashboard/ReportList';
import { getMockActivityStats, getMockWeeklyHeatmapData } from '@/lib/mockData'; // Keep for stats/heatmap
import { getReportsByUser } from '@/app/report/actions/getReportsByUser'; // Import server action
import logger from '@/lib/utils/logger'; // For logging potential errors

export const metadata: Metadata = {
  title: 'Reportly Dashboard',
  description: 'View your reports, activity, and stats.',
};

/**
 * Dashboard page component.
 * Fetches (mock) data server-side and renders dashboard sections.
 */
// Make the component async to fetch data
const DashboardPage = async () => {
    // Fetch mock data for stats/heatmap
    const activityStats = getMockActivityStats();
    const heatmapData = getMockWeeklyHeatmapData();

    // Fetch actual reports for the user server-side
    // Note: getReportsByUser now gets the user ID from the session internally
    let userReports = [];
    let fetchError = null;
    try {
        const result = await getReportsByUser();
        if (result.success) {
            userReports = result.data;
            logger.log('[DashboardPage] Successfully fetched user reports.', { count: userReports.length });
        } else {
            // Handle case where user might not be authenticated or other errors
            fetchError = result.error;
            logger.error('[DashboardPage] Failed to fetch user reports.', { error: fetchError });
            // Middleware should redirect unauthenticated users, but handle error defensively
        }
    } catch (err) {
         const error = err instanceof Error ? err : new Error(String(err));
         fetchError = error.message;
         logger.error('[DashboardPage] Exception fetching user reports.', error);
    }

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Activity Stats */}
            <ActivityStats stats={activityStats} />

            {/* Weekly Heatmap */}
            <WeeklyActivityHeatmap heatmapData={heatmapData} />

            {/* Report List */}
            {/* Conditionally render ReportList or error message */}
            {fetchError ? (
                 <p className="text-red-500 dark:text-red-400 text-center py-4">Error loading reports: {fetchError}</p>
            ) : (
                 <ReportList initialReports={userReports} />
            )}

            {/* Floating Action Button (Client Component) */}
            <NewReportButton />
        </div>
    );
};

export default DashboardPage;