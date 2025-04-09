'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '@/lib/utils/logger';
import type { User } from '@supabase/supabase-js';

// Define Zod schema for input validation
const NotificationIdSchema = z.object({
    notificationId: z.string().uuid('Invalid UUID format for notification ID'),
});

// Define return type
type MarkSeenResult =
    | { success: true }
    | { success: false; error: string; issues?: z.ZodIssue[] };

/**
 * Server Action to mark a specific notification as seen for the current user.
 *
 * @param notificationId - The UUID of the notification to mark as seen.
 * @returns {Promise<MarkSeenResult>} - Result object indicating success or failure.
 */
export async function markNotificationAsSeen(notificationId: string): Promise<MarkSeenResult> {
    const functionName = 'markNotificationAsSeen';
    logger.log(`[${functionName}] Starting execution.`, { notificationId });

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

    // --- Input Validation ---
    const validationResult = NotificationIdSchema.safeParse({ notificationId });
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid notificationId format.`, { notificationId, issues: validationResult.error.issues });
        return { success: false, error: 'Invalid Notification ID format.', issues: validationResult.error.issues };
    }
    const validatedNotificationId = validationResult.data.notificationId;

    try {
        logger.log(`[${functionName}] Attempting to mark notification ${validatedNotificationId} as seen for user ${user.id}...`);

        // Update the notification. RLS policy should ensure user can only update their own.
        const { error: updateError } = await supabase
            .from('notifications')
            .update({ seen: true })
            .eq('id', validatedNotificationId)
            .eq('userId', user.id); // Explicitly match userId for safety, though RLS handles it

        if (updateError) {
            logger.error(`[${functionName}] Error updating notification in Supabase.`, { notificationId: validatedNotificationId, userId: user.id, error: updateError });
            // Check for specific errors, e.g., RLS violation (though unlikely with eq('userId', user.id))
            throw updateError;
        }

        logger.log(`[${functionName}] Notification ${validatedNotificationId} marked as seen successfully.`);
        return { success: true };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Exception during notification update.`, { notificationId: validatedNotificationId, error });
        // Handle potential errors like RLS violation if the explicit userId check was removed
        if (error.message.includes('violates row-level security policy')) {
             return { success: false, error: 'Forbidden: Cannot update this notification.' };
        }
        return { success: false, error: 'Failed to mark notification as seen due to a server error.' };
    }
}