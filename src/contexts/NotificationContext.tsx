'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { getNotifications, NotificationData } from '@/app/actions/notifications/getNotifications';
import { markNotificationAsSeen } from '@/app/actions/notifications/markNotificationAsSeen';
import { useAuth } from '@/components/auth/AuthProvider'; // Use auth context to only poll when logged in
import logger from '@/lib/utils/logger';
import toast from 'react-hot-toast';

// Define the shape of the notification context
interface NotificationContextType {
    notifications: NotificationData[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    markAsSeen: (notificationId: string) => Promise<void>; // Function to mark as seen
    refetchNotifications: () => Promise<void>; // Function to manually refetch
}

// Create the context with a default undefined value to enforce provider usage
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
    pollInterval?: number; // Optional interval override (in ms)
}

const DEFAULT_POLL_INTERVAL = 30000; // 30 seconds

/**
 * Provides global state for user notifications.
 * Fetches notifications periodically if the user is authenticated.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    pollInterval = DEFAULT_POLL_INTERVAL
}) => {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get auth status
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Initial loading state
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (isInitialLoad = false) => {
        if (!isAuthenticated) {
             // Don't fetch if not authenticated, clear existing notifications
             setNotifications([]);
             if (isInitialLoad) setIsLoading(false);
             return;
        }

        if (isInitialLoad) setIsLoading(true); // Only show initial loading spinner
        setError(null);
        logger.log('[NotificationContext] Fetching notifications...');
        try {
            const result = await getNotifications();
            if (result.success) {
                setNotifications(result.notifications);
                logger.log('[NotificationContext] Notifications updated.', { count: result.notifications.length });
            } else {
                // Don't clear notifications on poll error, just log it
                if (isInitialLoad) {
                    setError(result.error || 'Failed to fetch notifications.');
                    setNotifications([]);
                }
                 logger.error('[NotificationContext] Error fetching notifications.', { error: result.error });
            }
        } catch (err) {
            const fetchError = err instanceof Error ? err : new Error(String(err));
             if (isInitialLoad) {
                setError(fetchError.message);
                setNotifications([]);
             }
            logger.error('[NotificationContext] Exception fetching notifications.', fetchError);
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, [isAuthenticated]); // Depend on auth status

    // Initial fetch
    useEffect(() => {
        if (!isAuthLoading) { // Only fetch initially once auth status is known
             fetchNotifications(true);
        }
    }, [isAuthLoading, fetchNotifications]);

    // Polling mechanism
    useEffect(() => {
        if (!isAuthenticated) return; // Don't poll if not logged in

        logger.log(`[NotificationContext] Starting polling interval (${pollInterval}ms).`);
        const intervalId = setInterval(() => {
            fetchNotifications(); // Fetch periodically
        }, pollInterval);

        // Cleanup interval on unmount or when auth status changes
        return () => {
            clearInterval(intervalId);
            logger.log('[NotificationContext] Polling interval cleared.');
        };
    }, [isAuthenticated, pollInterval, fetchNotifications]);

    // Function to mark a notification as seen (updates state optimistically)
    const markAsSeen = useCallback(async (notificationId: string) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        logger.log('[NotificationContext] Optimistically marked as seen.', { notificationId });

        try {
            const result = await markNotificationAsSeen(notificationId);
            if (!result.success) {
                toast.error(`Failed to mark notification as seen: ${result.error}`);
                logger.error('[NotificationContext] Failed to mark as seen (server).', { notificationId, error: result.error });
                // Revert UI change by refetching
                fetchNotifications();
            } else {
                 logger.log('[NotificationContext] Successfully marked as seen (server).', { notificationId });
            }
        } catch (err) {
             const error = err instanceof Error ? err : new Error(String(err));
             logger.error('[NotificationContext] Exception marking as seen.', { notificationId, error });
             toast.error(`Error: ${error.message}`);
             fetchNotifications(); // Refetch on exception
        }
    }, [fetchNotifications]);

    const value: NotificationContextType = {
        notifications,
        unreadCount: notifications.length,
        isLoading,
        error,
        markAsSeen,
        refetchNotifications: () => fetchNotifications(true), // Allow manual refetch with loading state
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * Hook to use the notification context.
 * Throws an error if used outside of a NotificationProvider.
 */
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};