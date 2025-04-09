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


// --- Service Role Client (for server-side actions needing elevated privileges) ---

// Ensure the service role key is defined (ONLY ON SERVER)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let serviceClientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase client initialized with the Service Role Key.
 * WARNING: Use this client ONLY in trusted server-side environments (Server Actions, API Routes).
 * It bypasses Row Level Security. Never expose the service key to the client.
 * Throws an error if Supabase URL or Service Key are missing.
 */
export const getSupabaseServiceRoleClient = (): SupabaseClient => {
     if (!supabaseUrl) {
        throw new Error('Supabase URL is not defined for service client.');
    }
     if (!supabaseServiceKey) {
        logger.error('[SupabaseClient] SUPABASE_SERVICE_ROLE_KEY is not defined. This key is required for server actions that bypass RLS.');
        throw new Error('Supabase Service Role Key is not defined.');
    }

    if (!serviceClientInstance) {
        logger.log('[SupabaseClient] Initializing new Supabase SERVICE ROLE client instance.');
        // Note: Ensure you trust the environment where this runs.
        serviceClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
             auth: {
                // Service role client typically doesn't need session persistence/refresh
                autoRefreshToken: false,
                persistSession: false
             }
        });
    }
    return serviceClientInstance;
};