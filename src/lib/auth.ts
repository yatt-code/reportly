// This file contains CLIENT-SIDE callable auth helpers

import { getSupabaseClient } from './supabaseClient'; // Use client-side helper
import { z } from 'zod';
import logger from '@/lib/utils/logger';
// Removed server-only imports: cookies, createServerClient, User type (if only used by getCurrentUser)

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
// Removed getCurrentUser function - moved to auth.server.ts
// Ensure no stray characters remain