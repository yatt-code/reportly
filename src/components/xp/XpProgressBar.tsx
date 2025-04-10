'use client';

import React from 'react';
import { calculateLevel, xpRequiredForLevel } from '@/lib/xp/xpRules';

interface XpProgressBarProps {
  xp: number;
  level?: number;
  className?: string;
  showText?: boolean;
}

/**
 * Displays a progress bar showing XP progress towards the next level
 */
const XpProgressBar: React.FC<XpProgressBarProps> = ({ 
  xp, 
  level: providedLevel,
  className = '',
  showText = true
}) => {
  // Calculate level if not provided
  const level = providedLevel || calculateLevel(xp);
  
  // Calculate XP required for current and next level
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  
  // Calculate progress percentage
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));
  
  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{xpInCurrentLevel} XP</span>
          <span>{xpRequiredForNextLevel} XP needed for Level {level + 1}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default XpProgressBar;
