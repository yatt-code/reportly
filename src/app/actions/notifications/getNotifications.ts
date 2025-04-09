'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '@/lib/utils/logger';
import type { User } from '@supabase/supabase-js';

// Define the structure of the notification data we expect to return
// This might include joined data from comments/reports
export interface NotificationData {
    id: string; // Notification UUID
    userId: string;
    type: 'mention' | 'reply' | string; // Allow other types
    contextId: string | null;
    reportId: string | null;
    seen: boolean;
    createdAt: string; // ISO string format
    // Optional joined data (adjust based on your actual select query)
    comment?: { content: string | null } | null; // Expect single object or null
    report?: { title: string | null } | null; // Expect single object or null
    // Add sender info if needed (requires joining user table on comment/report author)
    // sender?: { name: string | null; avatarUrl: string | null };
}

// Define return type
type GetNotificationsResult =
    | { success: true; notifications: NotificationData[] }
    | { success: false; error: string };

/**
 * Server Action to fetch unseen notifications for the current user.
 * Includes related comment content and report title if available.
 *
 * @returns {Promise<GetNotificationsResult>} - Result object with notifications array or an error.
 */
export async function getNotifications(): Promise<GetNotificationsResult> {
    const functionName = 'getNotifications';
    logger.log(`[${functionName}] Starting execution.`);

    // --- Authentication & Supabase Client Setup ---
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
        logger.error(`[${functionName}] Missing Supabase config.`);
        return { success: false, error: 'Internal server configuration error.' };
    }

    // Create server client to respect RLS based on user's cookie
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { get: cookieStore.get } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        logger.warn(`[${functionName}] Authentication failed or no user found.`, authError || undefined);
        return { success: false, error: 'Authentication required.' };
    }
    logger.log(`[${functionName}] User authenticated: ${user.id}`);
    // --- End Auth Setup ---

    try {
        logger.log(`[${functionName}] Fetching unseen notifications for user ${user.id}...`);

        // Fetch unseen notifications, joining related data
        // IMPORTANT: Adjust the select query based on your actual table/column names and relationships
        // This assumes you have FK relationships set up in Supabase or can join manually.
        // Supabase JS v2 syntax for joining might differ slightly. Check Supabase docs.
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                id,
                userId,
                type,
                contextId,
                reportId,
                seen,
                createdAt,
                comment: comments ( content ),
                report: reports ( title )
            `)
            .eq('userId', user.id) // RLS should enforce this, but explicit filter is safer
            .eq('seen', false)
            .order('createdAt', { ascending: false });
            // .limit(20); // Optional: Limit the number of notifications fetched

        if (error) {
            logger.error(`[${functionName}] Error fetching notifications from Supabase.`, error);
            throw error; // Throw to be caught by outer catch block
        }

        logger.log(`[${functionName}] Found ${data?.length || 0} unseen notifications.`);

        // Ensure data matches the expected NotificationData structure
        // Map the data to handle the potentially nested array structure from Supabase joins
        const notifications: NotificationData[] = (data || []).map(n => ({
            ...n,
            // Take the first element if the joined data is an array, otherwise null
            comment: n.comment && n.comment.length > 0 ? n.comment[0] : null,
            report: n.report && n.report.length > 0 ? n.report[0] : null,
        }));

        return { success: true, notifications };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Exception during notification fetch.`, error);
        return { success: false, error: 'Failed to fetch notifications due to a server error.' };
    }
}