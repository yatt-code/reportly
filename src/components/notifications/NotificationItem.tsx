import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { NotificationData } from '@/app/actions/notifications/getNotifications'; // Import the type
import { MessageSquare, FileText } from 'lucide-react'; // Example icons
import logger from '@/lib/utils/logger';

interface NotificationItemProps {
    notification: NotificationData;
    onMarkAsSeen: (notificationId: string) => Promise<void>; // Callback to mark as seen
}

// Helper to format dates (e.g., "2 hours ago", "on Jan 5") - Consider moving to a utils file
const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.max(0, Math.floor(seconds)) + "s ago";
};

/**
 * Renders a single notification item within the dropdown.
 * Handles marking as seen and navigating on click.
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsSeen }) => {
    const router = useRouter();

    const handleClick = async () => {
        logger.log('[NotificationItem] Clicked, marking as seen...', { id: notification.id });
        try {
            await onMarkAsSeen(notification.id); // Call parent handler to mark as seen

            // Navigate to the relevant report/comment
            // TODO: Enhance navigation to scroll to the specific comment (contextId)
            if (notification.reportId) {
                const url = `/report/${notification.reportId}${notification.contextId ? `#comment-${notification.contextId}` : ''}`;
                logger.log('[NotificationItem] Navigating to:', { url });
                router.push(url);
            } else {
                 logger.warn('[NotificationItem] Cannot navigate, reportId missing.', { id: notification.id });
            }
        } catch (err) {
             const error = err instanceof Error ? err : new Error(String(err));
             logger.error('[NotificationItem] Error marking notification as seen or navigating.', error);
             // Optionally show toast error
        }
    };

    // Generate descriptive text based on notification type
    let description = 'New notification';
    if (notification.type === 'mention') {
        description = `You were mentioned in a comment`;
        if (notification.report?.title) {
            description += ` on report "${notification.report.title}"`;
        }
        // TODO: Add sender name if available
    }
    // Add cases for other notification types ('reply', etc.)

    return (
        <button
            onClick={handleClick}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 block"
            aria-label={`Notification: ${description}`}
        >
            <div className="flex items-start gap-3">
                {/* Icon based on type */}
                <div className="mt-1">
                    {notification.type === 'mention' ? (
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                        <FileText className="w-4 h-4 text-gray-500" /> // Default icon
                    )}
                </div>
                {/* Content */}
                <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                        {description}
                    </p>
                    {/* Optionally show comment snippet */}
                    {notification.comment?.content && (
                         <p className="text-xs text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-2 truncate">
                            "{notification.comment.content}"
                         </p>
                    )}
                    {/* Timestamp */}
                    <time dateTime={notification.createdAt} className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {timeAgo(notification.createdAt)}
                    </time>
                </div>
            </div>
        </button>
    );
};

export default NotificationItem;