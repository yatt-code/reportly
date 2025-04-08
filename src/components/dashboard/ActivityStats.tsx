import React from 'react';
import { Flame, BarChartBig } from 'lucide-react'; // Example icons
import { MockActivityStats } from '@/lib/mockData'; // Import the type

interface ActivityStatsProps {
    stats: MockActivityStats;
}

/**
 * Displays user activity statistics like daily streak and weekly report count.
 */
const ActivityStats: React.FC<ActivityStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Daily Streak */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Daily Streak</p>
                    <p className="text-xl font-semibold">{stats.dailyStreak} Day{stats.dailyStreak !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Productivity Summary */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-3">
                 <BarChartBig className="w-8 h-8 text-blue-500" />
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                    <p className="text-xl font-semibold">{stats.reportsThisWeek} Report{stats.reportsThisWeek !== 1 ? 's' : ''}</p>
                 </div>
            </div>
        </div>
    );
};

export default ActivityStats;