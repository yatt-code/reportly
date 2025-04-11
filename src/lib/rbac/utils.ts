import type { User } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger'; // Optional logging

/**
 * Extracts the user role from Supabase user metadata.
 * @param user - The Supabase User object (or null).
 * @returns The role string (e.g., 'admin', 'developer') or null if the user is null,
 *          has no metadata, or the role is missing/invalid in the metadata.
 *          **Fallback Behavior:** Returns null for unknown/missing roles.
 */
export const getUserRole = (user: User | null): string | null => {
    if (!user || !user.user_metadata) {
        return null;
    }
    const role = user.user_metadata.role;
    return typeof role === 'string' && role ? role : null;
};

/**
 * Checks if a user object has a specific role or one of several roles.
 * Designed for server-side usage where the User object is already available.
 *
 * @param user - The Supabase User object (or null).
 * @param requiredRole - A single role string or an array of allowed role strings.
 * @returns boolean - True if the user is not null and their role (from `getUserRole`)
 *          matches the `requiredRole` (or is included in the array).
 *          **Fallback Behavior:** Returns false if the user is null or has no valid role.
 */
export const hasRole = (user: User | null, requiredRole: string | string[]): boolean => {
    const currentRole = getUserRole(user);

    if (!currentRole) {
        return false; // No role means no permission
    }

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(currentRole);
    } else {
        return currentRole === requiredRole;
    }
};

/**
 * Enforces role requirement within a server-side context (e.g., Server Action).
 * Fetches the current user and checks their role against the required role(s).
 * Throws a specific 'Forbidden' error if the user does not have the required role.
 *
 * @param requiredRole - A single role string or an array of allowed role strings.
 * @param currentUser - The authenticated Supabase User object.
 * @param actionContext - Optional string describing the action for logging.
 * @throws {Error} 'Forbidden: Insufficient privileges.' if the user does not have the required role(s).
 * @throws {Error} 'Authentication required.' if `currentUser` is null.
 *          **Fallback Behavior:** Throws 'Forbidden' if the user has no role or an unknown role.
 */
export const enforceRole = (
    requiredRole: string | string[],
    currentUser: User | null,
    actionContext: string = 'perform action'
): void => {
    if (!currentUser) {
        logger.error(`[enforceRole] Authentication required to ${actionContext}.`);
        throw new Error('Authentication required.'); // Or a more specific AuthError
    }

    const userRole = getUserRole(currentUser);
    const hasRequiredRole = hasRole(currentUser, requiredRole);

    if (!hasRequiredRole) {
        logger.error(`[enforceRole] Authorization failed: User ${currentUser.id} (role: ${userRole || 'none'}) attempted to ${actionContext}. Required role(s): ${Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}.`);
        throw new Error('Forbidden: Insufficient privileges.');
    }

    // If we reach here, the user has the required role
    // logger.log(`[enforceRole] Role verified for user ${currentUser.id} to ${actionContext}.`);
};

// Example Usage in a Server Action:
// import { getCurrentUser } from '@/lib/auth.server'; // Corrected path
// import { enforceRole } from '@/lib/rbac/utils';
//
// export async function someAdminAction(payload: any) {
//   const user = await getCurrentUser();
//   enforceRole('admin', user, 'perform admin action');
//   // ... rest of admin action logic ...
// }