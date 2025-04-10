import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Global loading component for Next.js App Router
 * This will be shown during route transitions
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 transition-all duration-300">
      <div className="transform animate-fade-in">
        <LoadingSpinner size="xl" label="Loading..." />
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">
        Preparing your content...
      </p>
    </div>
  );
}
