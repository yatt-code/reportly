import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

/**
 * Global not found component for Next.js App Router
 * This will be shown when a route is not found
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-blue-200 dark:border-blue-900 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          {/* 404 icon with animation */}
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <Search size={32} className="animate-bounce-small" />
          </div>
          
          {/* Large 404 text */}
          <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Back button */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200 w-full"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            
            {/* Home link */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 w-full"
            >
              <Home size={16} />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
