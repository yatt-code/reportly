import { cookies } from 'next/headers'; // Needed for server-side client
import { createServerClient } from '@supabase/ssr'; // Import server client creator
import { getSupabaseClient } from './supabaseClient'; // Keep for client-side helpers
import { z } from 'zod';
import logger from '@/lib/utils/logger';
import type { User } from '@supabase/supabase-js'; // Import User type

// --- Zod Schemas for Auth ---
const AuthCredentialsSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type AuthCredentials = z.infer<typeof AuthCredentialsSchema>;

// --- Auth Helper Functions ---

/**
 * Logs in a user using email and password.
 * @param credentials - Object containing email and password.
 * @returns The Supabase auth response (data or error).
 */
export const login = async (credentials: AuthCredentials) => {
    const functionName = 'auth.login';
    logger.log(`[${functionName}] Attempting login...`, { email: credentials.email });

    // Validate input
    const validationResult = AuthCredentialsSchema.safeParse(credentials);
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid credentials provided.`, { issues: validationResult.error.issues });
        return { data: null, error: { message: 'Invalid email or password format.', issues: validationResult.error.issues } };
    }

    const supabase = getSupabaseClient();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: validationResult.data.email,
            password: validationResult.data.password,
        });

        if (error) {
            logger.error(`[${functionName}] Supabase login failed.`, error);
            return { data: null, error };
        }

        logger.log(`[${functionName}] Login successful.`, { userId: data.user?.id });
        return { data, error: null };
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Exception during login.`, error);
        return { data: null, error: { message: 'An unexpected error occurred during login.' } };
    }
};

/**
 * Registers a new user with email and password.
 * Assigns the default role 'developer' to user_metadata.
 * @param credentials - Object containing email and password.
 * @returns The Supabase auth response (data or error).
 */
export const register = async (credentials: AuthCredentials) => {
    const functionName = 'auth.register';
    logger.log(`[${functionName}] Attempting registration...`, { email: credentials.email });

     // Validate input
    const validationResult = AuthCredentialsSchema.safeParse(credentials);
    if (!validationResult.success) {
        logger.error(`[${functionName}] Invalid credentials provided.`, { issues: validationResult.error.issues });
        return { data: null, error: { message: 'Invalid email or password format.', issues: validationResult.error.issues } };
    }

    const supabase = getSupabaseClient();
    try {
        const { data, error } = await supabase.auth.signUp({
            email: validationResult.data.email,
            password: validationResult.data.password,
            options: {
                // Add user metadata here
                data: {
                    role: 'developer', // Assign default role
                    // Add other metadata like name if collected during signup
                }
            }
        });

        if (error) {
            logger.error(`[${functionName}] Supabase registration failed.`, error);
            return { data: null, error };
        }

        // Note: Supabase might require email confirmation depending on settings.
        // The 'data' object might contain user info even if confirmation is pending.
        logger.log(`[${functionName}] Registration successful (confirmation might be required).`, { userId: data.user?.id });
        return { data, error: null };

    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`[${functionName}] Exception during registration.`, error);
        return { data: null, error: { message: 'An unexpected error occurred during registration.' } };
    }
};

/**
 * Logs out the current user.
 * @returns The Supabase signout response (error if any).
 */
export const logout = async () => {
    const functionName = 'auth.logout';
    logger.log(`[${functionName}] Attempting logout...`);
    const supabase = getSupabaseClient();
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            logger.error(`[${functionName}] Supabase logout failed.`, error);
            return { error };
        }

        logger.log(`[${functionName}] Logout successful.`);
        return { error: null };
    } catch (err) {
         const error = err instanceof Error ? err : new Error(String(err));
         logger.error(`[${functionName}] Exception during logout.`, error);
         return { error: { message: 'An unexpected error occurred during logout.' } };
    }
};

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

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // Set/Remove are not typically needed for just getting the user,
                // but included here based on the standard pattern.
                // They might cause warnings if called from Server Components.
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