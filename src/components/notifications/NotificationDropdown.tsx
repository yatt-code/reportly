'use client';

import React, { useState, useEffect, useRef } from 'react';
// Removed server action imports, use context instead
import { useNotifications } from '@/contexts/NotificationContext'; // Import the context hook
import type { NotificationData } from '@/app/actions/notifications/getNotifications'; // Keep type import
import NotificationItem from './NotificationItem';
import NotificationBadge from './NotificationBadge';
import NotificationSkeleton from './NotificationSkeleton'; // Import skeleton
import logger from '@/lib/utils/logger';
import { Bell, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link'; // Added Link for View All

/**
 * Dropdown component to display recent unseen notifications.
 * Fetches notifications, allows marking as seen, and handles basic UI state.
 */
const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Consume state from context
    const {
        notifications,
        unreadCount,
        isLoading, // Use isLoading from context for initial load
        error,
        markAsSeen, // Use markAsSeen from context
        refetchNotifications // Use refetch from context if needed
    } = useNotifications();

    // Setup click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Run only once

    // Wrapper for marking as seen, potentially closing dropdown
    const handleItemClick = async (notificationId: string) => {
         await markAsSeen(notificationId); // Call context function
         // Optionally close dropdown after click, or let NotificationItem handle navigation
         // setIsOpen(false);
    };

    // Determine content based on state
    let content: React.ReactNode;
    if (isLoading) {
        // Show skeletons during initial load
        content = (
            <div>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
            </div>
        );
    } else if (error) {
        content = (
             <div className="px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle size={16} /> Error: {error}
             </div>
        );
    } else if (notifications.length === 0) {
        content = (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No unread notifications.
            </div>
        );
    } else {
        content = notifications.map((notification) => (
            <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsSeen={handleItemClick} // Pass the wrapper
            />
        ));
    }


    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Bell size={20} />
                <NotificationBadge count={unreadCount} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {/* Optional: Add a "Mark All Read" button here */}
                    </div>
                    <div className="py-1">
                        {content} {/* Render the determined content */}
                    </div>
                     {/* Optional: Add "View All" link */}
                     {/* <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                        <Link href="/notifications" className="text-sm text-blue-600 hover:underline">View All</Link>
                     </div> */}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;