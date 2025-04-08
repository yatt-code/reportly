import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Re-exports the useAuth hook for accessing authentication context.
 * Provides user, session, isAuthenticated, and isLoading state.
 *
 * Ensures hook is used within an AuthProvider.
 */
export const useUser = useAuth;

// You could potentially add more derived state or helper functions here later,
// for example, checking user roles:
// export const useUserRole = () => {
//   const { user } = useAuth();
//   return user?.user_metadata?.role || null;
// };