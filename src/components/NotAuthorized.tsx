import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react'; // Example icon

/**
 * Simple component displayed when a user attempts to access a resource
 * they do not have permission for (e.g., a report they don't own).
 */
const NotAuthorized: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                You do not have permission to view this page or resource. Please ensure you are logged in with the correct account.
            </p>
            <Link
                href="/dashboard"
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotAuthorized;