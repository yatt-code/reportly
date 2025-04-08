import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger'; // Optional logging

// Ensure environment variables are defined (consider adding checks or default values)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    logger.error('[SupabaseClient] NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env file.');
    // throw new Error('Supabase URL is not defined.'); // Optionally throw to prevent startup
}
if (!supabaseAnonKey) {
    logger.error('[SupabaseClient] NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Check your .env file.');
    // throw new Error('Supabase Anon Key is not defined.'); // Optionally throw
}

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase client.
 * Throws an error if Supabase URL or Anon Key are missing.
 */
export const getSupabaseClient = (): SupabaseClient => {
    if (!supabaseUrl || !supabaseAnonKey) {
        // This check ensures we don't proceed if config is missing, even if initial logs were ignored.
        throw new Error('Supabase environment variables (URL or Anon Key) are missing.');
    }

    if (!supabaseInstance) {
        logger.log('[SupabaseClient] Initializing new Supabase client instance.');
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            // Optional Supabase client options:
            // auth: {
            //   autoRefreshToken: true,
            //   persistSession: true,
            //   detectSessionInUrl: true
            // }
        });
    }

    return supabaseInstance;
};

// Optionally export the instance directly if preferred, though the getter function is safer
// export const supabase = getSupabaseClient();