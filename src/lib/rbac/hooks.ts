'use client'; // Hooks are client-side

import { useUser } from '@/lib/useUser'; // Import the main user hook

/**
 * Custom hook to get the current user's role from user_metadata.
 * Returns the role string (e.g., 'developer', 'admin') or null if no user or role found.
 *
 * Should be used within components wrapped by AuthProvider.
 */
export const useUserRole = (): string | null => {
    const { user, isLoading } = useUser();

    if (isLoading || !user) {
        return null; // Return null during loading or if no user
    }

    // Access role from user_metadata
    const role = user.user_metadata?.role;

    // Validate or default the role if necessary
    if (typeof role === 'string' && role) {
        return role;
    }

    // Return null if role is not found or not a string
    return null;
};

/**
 * Custom hook to check if the current user has a specific role or one of several roles.
 *
 * @param requiredRole - A single role string or an array of allowed role strings.
 * @returns boolean - True if the user has the required role(s), false otherwise. Also returns false if loading or no user.
 */
export const useHasRole = (requiredRole: string | string[]): boolean => {
    const currentRole = useUserRole();

    if (!currentRole) {
        return false; // No role means no permission
    }

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(currentRole);
    } else {
        return currentRole === requiredRole;
    }
};

// Example Usage in a component:
// const isAdmin = useHasRole('admin');
// const isEditor = useHasRole(['admin', 'editor']);
// if (isAdmin) { /* Render admin UI */ }