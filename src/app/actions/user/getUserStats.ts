'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';
import { getCurrentUser } from '@/lib/auth.server';

// Define return type
type GetUserStatsResult =
  | { success: true; data: { xp: number; level: number; lastUpdated: string } }
  | { success: false; error: string };

/**
 * Server Action to get a user's XP and level stats from Supabase
 * 
 * @returns {Promise<GetUserStatsResult>} - Result object with user stats or an error
 */
export async function getUserStats(): Promise<GetUserStatsResult> {
  const functionName = 'getUserStats';
  logger.log(`[${functionName}] Starting execution.`);

  try {
    // Get the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      logger.error(`[${functionName}] Unauthorized: No user session found.`);
      return { success: false, error: 'Authentication required.' };
    }
    const userId = currentUser.id;
    logger.log(`[${functionName}] User authenticated.`, { userId });

    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error(`[${functionName}] Missing Supabase config.`);
      return { success: false, error: 'Internal server configuration error.' };
    }

    // Create server client to respect RLS based on user's cookie
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    });

    // Query the user_stats table for the current user
    const { data, error } = await supabase
      .from('user_stats')
      .select('xp, level, last_updated')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If the error is that no rows were returned, return default values
      if (error.code === 'PGRST116') {
        logger.log(`[${functionName}] No stats found for user ${userId}, returning defaults.`);
        return {
          success: true,
          data: {
            xp: 0,
            level: 1,
            lastUpdated: new Date().toISOString(),
          },
        };
      }

      logger.error(`[${functionName}] Error fetching user stats:`, error);
      return { success: false, error: `Failed to fetch user stats: ${error.message}` };
    }

    // Return the user stats
    logger.log(`[${functionName}] Successfully fetched user stats.`, { data });
    return {
      success: true,
      data: {
        xp: data.xp,
        level: data.level,
        lastUpdated: data.last_updated,
      },
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[${functionName}] Error getting user stats:`, error);
    return { success: false, error: 'Failed to get user stats due to a server error.' };
  }
}
