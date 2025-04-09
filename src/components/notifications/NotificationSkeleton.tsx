import React from 'react';

/**
 * A skeleton loading state component for a single notification item.
 * Uses Tailwind CSS for styling and animation.
 */
const NotificationSkeleton: React.FC = () => {
    return (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 animate-pulse">
            <div className="flex items-start gap-3">
                {/* Icon Placeholder */}
                <div className="mt-1">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                {/* Content Placeholder */}
                <div className="flex-1 space-y-2">
                    {/* Description Line */}
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    {/* Optional Snippet Line */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    {/* Timestamp Line */}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSkeleton;