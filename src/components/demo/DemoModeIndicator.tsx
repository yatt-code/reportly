'use client';

import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Beaker } from 'lucide-react';

/**
 * Component to display demo mode status and user info on the dashboard.
 */
const DemoModeIndicator: React.FC = () => {
  const { isDemoMode, demoUser, clearDemoData, exitDemoMode } = useDemo();

  if (!isDemoMode) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Beaker size={20} className="text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">Demo Mode Active</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Logged in as {demoUser.displayName} ({demoUser.email})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearDemoData}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 rounded"
          >
            Reset Demo Data
          </button>
          <button
            onClick={exitDemoMode}
            className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded"
          >
            Exit Demo
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
        All changes you make in demo mode are stored only in your browser and will be lost when you close the browser or clear your cache.
      </p>
    </div>
  );
};

export default DemoModeIndicator;
