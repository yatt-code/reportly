'use client';

import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import ActivityStats from '@/components/dashboard/ActivityStats';
import WeeklyActivityHeatmap from '@/components/dashboard/WeeklyActivityHeatmap';
import ReportList from '@/components/dashboard/ReportList';
import DemoModeIndicator from '@/components/demo/DemoModeIndicator';
import NewReportButton from '@/components/dashboard/NewReportButton';
import { getMockActivityStats, getMockWeeklyHeatmapData } from '@/lib/mockData';

/**
 * Demo version of the dashboard that uses the demo context for data.
 */
const DemoDashboard: React.FC = () => {
  const { isDemoMode, demoReports } = useDemo();
  
  // If not in demo mode, don't render anything
  if (!isDemoMode) return null;
  
  // Get mock data for stats and heatmap
  const activityStats = getMockActivityStats();
  const heatmapData = getMockWeeklyHeatmapData();
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Demo Mode Indicator */}
      <DemoModeIndicator />
      
      {/* Activity Stats */}
      <ActivityStats stats={activityStats} />
      
      {/* Weekly Heatmap */}
      <WeeklyActivityHeatmap heatmapData={heatmapData} />
      
      {/* Report List */}
      <ReportList initialReports={demoReports} />
      
      {/* Floating Action Button */}
      <NewReportButton />
    </div>
  );
};

export default DemoDashboard;
