// This file contains server-side only authentication helpers

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '@/lib/utils/logger';
import type { User } from '@supabase/supabase-js';

/**
 * Retrieves the current authenticated user's data in a server-side context
 * (Server Component, Server Action, Route Handler).
 * Reads session from cookies.
 *
 * @returns {Promise<User | null>} The Supabase user object or null if not authenticated.
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const functionName = 'auth.getCurrentUser';
    // Create a Supabase client FOR SERVER-SIDE USE configured to use cookies
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

     if (!supabaseUrl || !supabaseAnonKey) {
        logger.error(`[${functionName}] Missing Supabase URL or Anon Key.`);
        // Depending on context, might return null or throw
        return null;
    }

    // Acknowledge potential static analysis error for cookies() here
    // The pattern is correct for server-side contexts where this will be called
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options) {
                    try { cookieStore.set({ name, value, ...options }); } catch (e) { /* Ignored */ }
                },
                remove(name: string, options) {
                     try { cookieStore.set({ name, value: '', ...options }); } catch(e) { /* Ignored */ }
                },
            },
        }
    );

    try {
        // Use getUser() which checks the cookie-based session
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            logger.error(`[${functionName}] Error getting user from session.`, error);
            return null;
        }

        if (user) {
             logger.log(`[${functionName}] User found in session.`, { userId: user.id });
        } else {
             logger.log(`[${functionName}] No user found in session.`);
        }
        return user;

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Exception during getUser call.`, error);
        return null;
    }
};