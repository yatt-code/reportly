import React from 'react';
// Removed Link and Plus imports as they are handled by the button component
import { Metadata } from 'next';
import NewReportButton from '@/components/dashboard/NewReportButton'; // Import the client component
import ActivityStats from '@/components/dashboard/ActivityStats';
import WeeklyActivityHeatmap from '@/components/dashboard/WeeklyActivityHeatmap';
import ReportList from '@/components/dashboard/ReportList';
import { getMockActivityStats, getMockWeeklyHeatmapData } from '@/lib/mockData'; // Import mock data functions

export const metadata: Metadata = {
  title: 'Reportly Dashboard',
  description: 'View your reports, activity, and stats.',
};

/**
 * Dashboard page component.
 * Fetches (mock) data server-side and renders dashboard sections.
 */
const DashboardPage = () => {
    // Fetch mock data (in a real app, this might be API calls or server actions)
    // Since this is a Server Component by default in App Router,
    // we can fetch data directly here.
    const activityStats = getMockActivityStats();
    const heatmapData = getMockWeeklyHeatmapData();
    // ReportList fetches its own data client-side in this example

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Activity Stats */}
            <ActivityStats stats={activityStats} />

            {/* Weekly Heatmap */}
            <WeeklyActivityHeatmap heatmapData={heatmapData} />

            {/* Report List */}
            <ReportList />

            {/* Floating Action Button (Client Component) */}
            <NewReportButton />
        </div>
    );
};

export default DashboardPage;