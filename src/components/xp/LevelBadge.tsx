'use client';

import React from 'react';

interface LevelBadgeProps {
  level: number;
  className?: string;
  showIcon?: boolean;
}

/**
 * Displays the user's current level as a badge
 */
const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  className = '', 
  showIcon = true 
}) => {
  return (
    <div className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 ${className}`}>
      {showIcon && <span className="mr-1">🧠</span>}
      <span>Level {level}</span>
    </div>
  );
};

export default LevelBadge;
