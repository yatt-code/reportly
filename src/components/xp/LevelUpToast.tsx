'use client';

import React from 'react';
import toast from 'react-hot-toast';

interface LevelUpToastProps {
  level: number;
}

/**
 * Displays a toast notification when a user levels up
 */
const LevelUpToast: React.FC<LevelUpToastProps> = ({ level }) => {
  return (
    <div className="flex items-center p-4 bg-indigo-100 border-l-4 border-indigo-500 rounded-lg shadow-md">
      <div className="mr-3 text-2xl">🎉</div>
      <div>
        <h3 className="font-bold text-indigo-800">Level Up!</h3>
        <p className="text-indigo-700">You've reached Level {level}!</p>
      </div>
    </div>
  );
};

/**
 * Shows a level up toast notification
 * @param level The new level reached
 */
export const showLevelUpToast = (level: number) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full`}
      >
        <LevelUpToast level={level} />
      </div>
    ),
    { duration: 5000 }
  );
};

export default LevelUpToast;
