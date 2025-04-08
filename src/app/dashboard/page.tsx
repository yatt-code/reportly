import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Plus } from 'lucide-react'; // Icon for New Report button
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

            {/* Floating Action Button for New Report */}
            <Link
                href="/report/new" // Assuming '/report/new' is the route for the editor
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-20"
                title="Create New Report"
            >
                <Plus size={24} />
            </Link>
        </div>
    );
};

export default DashboardPage;