'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { showLevelUpToast } from './LevelUpToast';

interface XpGainToastProps {
  xp: number;
}

/**
 * Toast component for XP gain
 */
const XpGainToast: React.FC<XpGainToastProps> = ({ xp }) => {
  return (
    <div className="flex items-center p-3 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md">
      <div className="mr-3 text-xl">✨</div>
      <div>
        <p className="font-medium text-green-700">+{xp} XP</p>
      </div>
    </div>
  );
};

/**
 * Shows XP gain and level up toasts
 * @param xpGained Amount of XP gained
 * @param levelUp Whether the user leveled up
 * @param newLevel The new level if leveled up
 */
export const showXpNotifications = (
  xpGained?: number,
  levelUp?: boolean,
  newLevel?: number
) => {
  // Show XP gain toast if XP was gained
  if (xpGained && xpGained > 0) {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full`}
        >
          <XpGainToast xp={xpGained} />
        </div>
      ),
      { duration: 3000, id: 'xp-gain' }
    );
  }

  // Show level up toast if user leveled up
  if (levelUp && newLevel) {
    // Delay the level up toast slightly for better UX
    setTimeout(() => {
      showLevelUpToast(newLevel);
    }, 500);
  }
};

export default XpGainToast;
