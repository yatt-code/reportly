import React from 'react';
import { MockHeatmapData } from '@/lib/mockData'; // Import the type

interface WeeklyActivityHeatmapProps {
    heatmapData: MockHeatmapData[]; // Expects 7 days of data
}

/**
 * Displays a simple weekly activity heatmap.
 */
const WeeklyActivityHeatmap: React.FC<WeeklyActivityHeatmapProps> = ({ heatmapData }) => {

    // Function to determine cell color based on count
    const getCellColor = (count: number): string => {
        if (count === 0) return 'bg-gray-100 dark:bg-gray-700'; // No activity
        if (count === 1) return 'bg-green-200 dark:bg-green-800'; // Low activity
        if (count <= 3) return 'bg-green-400 dark:bg-green-600'; // Medium activity
        return 'bg-green-600 dark:bg-green-400'; // High activity
    };

    // Get day initials (e.g., S, M, T, W, T, F, S)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay(); // 0 for Sunday, 6 for Saturday
    // Order labels starting from today going back 6 days
    const orderedDayLabels = Array.from({ length: 7 }, (_, i) => {
        const dayIndex = (todayIndex - (6 - i) + 7) % 7;
        return dayLabels[dayIndex].charAt(0); // Get first letter
    });


    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Weekly Activity</h3>
            <div className="flex justify-between items-center gap-1">
                {/* Day Labels */}
                {/* <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mr-2">
                    {orderedDayLabels.map((label, index) => (
                        <span key={index} className="h-4 flex items-center">{label}</span> // Adjust height to match cells
                    ))}
                </div> */}
                {/* Heatmap Cells */}
                <div className="grid grid-cols-7 gap-1 flex-grow">
                    {heatmapData.slice(-7).map((dayData, index) => ( // Ensure we only show last 7 days
                        <div
                            key={dayData.date}
                            className={`w-full aspect-square rounded ${getCellColor(dayData.count)}`}
                            title={`${dayData.date}: ${dayData.count} report(s)`}
                        >
                            {/* Optionally display count inside or use tooltip */}
                        </div>
                    ))}
                </div>
            </div>
             {/* Optional Legend */}
             <div className="flex justify-end gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700"></span>
                <span className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></span>
                <span className="w-3 h-3 rounded bg-green-400 dark:bg-green-600"></span>
                <span className="w-3 h-3 rounded bg-green-600 dark:bg-green-400"></span>
                <span>More</span>
            </div>
        </div>
    );
};

export default WeeklyActivityHeatmap;