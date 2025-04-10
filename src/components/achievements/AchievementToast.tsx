'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { AchievementDetails } from '@/lib/achievements/getAchievementDetails';

/**
 * Displays a toast notification for unlocked achievements
 * 
 * @param achievements - Array of achievement details to display
 */
export function showAchievementToasts(achievements: AchievementDetails[]): void {
  if (!achievements || achievements.length === 0) return;
  
  // Show each achievement as a separate toast
  achievements.forEach((achievement) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                {achievement.icon}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  Achievement Unlocked!
                </p>
                <p className="mt-1 text-sm text-white font-bold">
                  {achievement.label}
                </p>
                <p className="mt-1 text-sm text-white opacity-90">
                  {achievement.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-indigo-400">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-indigo-100 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000, // Show for 5 seconds
        position: 'bottom-right',
      }
    );
  });
}
