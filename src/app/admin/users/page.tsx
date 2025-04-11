import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth.server';
import { hasRole } from '@/lib/rbac/utils'; // Use server-side utility
import logger from '@/lib/utils/logger';

export const metadata: Metadata = {
  title: 'Admin - Manage Users',
  description: 'User management area for administrators.',
};

/**
 * Admin page for managing users.
 * Enforces 'admin' role access server-side.
 */
const AdminUsersPage = async () => {
    // --- Authorization Check ---
    const user = await getCurrentUser();

    // Use hasRole utility for check
    if (!hasRole(user, 'admin')) {
        logger.warn(`[AdminUsersPage] Non-admin user (ID: ${user?.id || 'none'}) attempted to access admin users page. Redirecting.`);
        redirect('/dashboard'); // Redirect non-admins
    }
    // --- End Authorization Check ---

    // User is guaranteed to be non-null here because hasRole('admin', user) returned true
    logger.log(`[AdminUsersPage] Admin user (ID: ${user!.id}) accessed users page.`); // Use non-null assertion or check again

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Manage Users (Admin)</h1>
            <p className="text-gray-600 dark:text-gray-300">
                This is the user management area. Only administrators can see this page.
            </p>
            {/* TODO: Implement user listing, role assignment UI etc. */}
            <div className="mt-6 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                Placeholder for user list and management tools.
            </div>
        </div>
    );
};

export default AdminUsersPage;