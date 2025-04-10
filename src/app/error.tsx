'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logger from '@/lib/utils/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error component for Next.js App Router
 * This will be shown when an error occurs in a route
 */
export default function Error({ error, reset }: ErrorProps) {
  // Log the error when it occurs
  useEffect(() => {
    logger.error('[Global Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Error icon with animation */}
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 animate-pulse">
            <AlertTriangle size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We apologize for the inconvenience. Our team has been notified of this issue.
          </p>
          
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="w-full mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-left overflow-auto max-h-40">
              <p className="font-mono text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {error.stack.split('\n').slice(1, 4).join('\n')}
                </pre>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Reset button */}
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 w-full"
            >
              <RefreshCw size={16} className="animate-spin-once" />
              Try again
            </button>
            
            {/* Home link */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200 w-full"
            >
              <Home size={16} />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Error ID for support reference */}
      {error.digest && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
