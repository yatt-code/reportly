'use client';

import React from 'react';
import LevelBadge from './LevelBadge';
import XpProgressBar from './XpProgressBar';

interface UserStatsPanelProps {
  xp: number;
  level: number;
  achievementCount?: number;
  className?: string;
}

/**
 * Displays a panel with the user's XP, level, and achievement stats
 */
const UserStatsPanel: React.FC<UserStatsPanelProps> = ({
  xp,
  level,
  achievementCount = 0,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Stats</h3>
        <LevelBadge level={level} />
      </div>
      
      <div className="mb-4">
        <XpProgressBar xp={xp} level={level} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Total XP</p>
          <p className="text-xl font-bold text-indigo-600">{xp}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Achievements</p>
          <p className="text-xl font-bold text-amber-600">{achievementCount}</p>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPanel;
