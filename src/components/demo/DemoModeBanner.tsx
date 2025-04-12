'use client';

import React, { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Beaker, X, Info } from 'lucide-react';

/**
 * Banner component displayed at the top of the page when in demo mode.
 */
const DemoModeBanner: React.FC = () => {
  const { isDemoMode, exitDemoMode } = useDemo();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isDemoMode) return null;

  return (
    <div className="bg-blue-600 text-white w-full">
      {isExpanded ? (
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker size={20} />
            <div>
              <span className="font-medium">Demo Mode Active</span>
              <span className="hidden sm:inline"> - Changes are stored locally and will not persist after you close your browser</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-blue-700 rounded-full"
              aria-label="Minimize demo banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Beaker size={16} />
            <span className="text-sm font-medium">Demo Mode</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 hover:bg-blue-700 rounded-full"
            aria-label="Expand demo banner"
          >
            <Info size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DemoModeBanner;
