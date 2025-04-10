/**
 * XP Rules Configuration
 * 
 * This file defines the XP gain values for different user actions.
 * Centralizing these values makes it easier to adjust the XP economy.
 */

/**
 * XP gain values for different user actions
 */
export const xpGainByAction = {
  comment: 10,      // Posting a comment
  report: 25,       // Creating a report
  mention: 5,       // Being mentioned by another user
  login_streak: 5,  // Daily login streak (per day)
  profile_complete: 50, // Completing user profile
  first_weekly_report: 15 // First report of the week
} as const;

/**
 * Type for XP actions, derived from the keys of xpGainByAction
 */
export type XpAction = keyof typeof xpGainByAction;

/**
 * Calculates the user level based on total XP using a logarithmic curve
 * 
 * @param xp - The user's total XP
 * @returns The calculated level
 */
export function calculateLevel(xp: number): number {
  // Logarithmic curve: Level = log_1.5(xp/100 + 1) + 1
  // This creates a curve where each level requires more XP than the last
  return Math.floor(Math.log(xp / 100 + 1) / Math.log(1.5)) + 1;
}

/**
 * Calculates the XP required to reach a specific level
 * 
 * @param level - The target level
 * @returns The XP required to reach that level
 */
export function xpRequiredForLevel(level: number): number {
  // Inverse of the level calculation formula
  // XP = 100 * (1.5^(level-1) - 1)
  return Math.ceil(100 * (Math.pow(1.5, level - 1) - 1));
}

/**
 * Calculates the XP required to reach the next level from the current XP
 * 
 * @param currentXp - The user's current XP
 * @returns The XP required to reach the next level
 */
export function xpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = xpRequiredForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}
