'use client'; // This component uses hooks and context, must be a client component

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import logger from '@/lib/utils/logger'; // Optional logging

// Define the shape of the authentication context
interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Add logout function directly to context for easier access? Or keep in lib/auth?
    // logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provides authentication context to the application.
 * Manages user session state based on Supabase Auth events.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading until session is checked

    useEffect(() => {
        const supabase = getSupabaseClient();
        let isMounted = true; // Track mount status to prevent state updates on unmounted component

        // --- Initial Session Check ---
        const checkSession = async () => {
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();
                if (error) {
                    logger.error('[AuthProvider] Error getting initial session:', error);
                    throw error;
                }
                if (isMounted) {
                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                    logger.log('[AuthProvider] Initial session checked.', { hasSession: !!currentSession });
                }
            } catch (err) {
                 // Error already logged
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        checkSession();

        // --- Listen for Auth State Changes ---
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                logger.log('[AuthProvider] Auth state changed:', { event });
                 if (isMounted) {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);
                    // No need to set loading here, as initial load is done
                 }
            }
        );

        // --- Cleanup ---
        return () => {
            isMounted = false;
            if (authListener?.subscription) {
                authListener.subscription.unsubscribe();
                logger.log('[AuthProvider] Unsubscribed from auth state changes.');
            }
        };
    }, []); // Run only once on mount

    const value: AuthContextType = {
        user,
        session,
        isAuthenticated: !!user, // User is authenticated if user object exists
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Don't render children until initial session check is complete */}
            {!isLoading ? children : null /* Or render a global loading spinner */}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use the authentication context.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};