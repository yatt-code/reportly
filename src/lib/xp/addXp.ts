/**
 * XP Management Utility
 * 
 * This module provides functions to add XP to users and handle level-up events.
 */

import { getSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { xpGainByAction, XpAction, calculateLevel } from './xpRules';
import logger from '@/lib/utils/logger';
import { checkAchievements } from '@/lib/achievements/checkAchievements';
import { getUserCommentCount, getUserReportCount } from '@/lib/achievements/userStats';

/**
 * Result of an XP addition operation
 */
export interface AddXpResult {
  newXp: number;
  newLevel: number;
  levelUp: boolean;
  unlockedAchievements: string[];
}

/**
 * Adds XP to a user for a specific action and handles level-up events
 * 
 * @param userId - The ID of the user to add XP to
 * @param action - The action that triggered the XP gain
 * @returns Object containing updated XP, level, level-up status, and unlocked achievements
 */
export async function addXp(userId: string, action: XpAction): Promise<AddXpResult> {
  const functionName = 'addXp';
  logger.log(`[${functionName}] Adding XP for user ${userId} for action: ${action}`);
  
  try {
    // Get the service role client to bypass RLS
    const supabase = getSupabaseServiceRoleClient();
    
    // Step 1: Fetch current XP and level from user_stats
    const { data: userStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('xp, level')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      logger.error(`[${functionName}] Error fetching user stats:`, fetchError);
      throw new Error(`Failed to fetch user stats: ${fetchError.message}`);
    }
    
    // If user doesn't have stats yet, initialize with defaults
    const currentXp = userStats?.xp ?? 0;
    const currentLevel = userStats?.level ?? 1;
    
    // Step 2: Calculate XP gain based on the action
    const xpGain = xpGainByAction[action];
    const newXp = currentXp + xpGain;
    
    // Step 3: Recalculate level
    const newLevel = calculateLevel(newXp);
    
    // Step 4: Detect level-up
    const levelUp = newLevel > currentLevel;
    
    if (levelUp) {
      logger.log(`[${functionName}] User ${userId} leveled up from ${currentLevel} to ${newLevel}!`);
    }
    
    // Step 5: Save new values to Supabase
    // If user doesn't have stats yet, insert a new record
    if (!userStats) {
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          xp: newXp,
          level: newLevel,
          last_updated: new Date().toISOString()
        });
      
      if (insertError) {
        logger.error(`[${functionName}] Error inserting user stats:`, insertError);
        throw new Error(`Failed to insert user stats: ${insertError.message}`);
      }
    } else {
      // Otherwise, update the existing record
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          xp: newXp,
          level: newLevel,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        logger.error(`[${functionName}] Error updating user stats:`, updateError);
        throw new Error(`Failed to update user stats: ${updateError.message}`);
      }
    }
    
    // Step 6: Check for unlocked achievements
    // Prepare context for achievement checks based on the action
    let achievementContext: Record<string, any> = {};
    let achievementTrigger: 'onComment' | 'onReportCreate' | 'onMention' | 'onStreak' | null = null;
    
    switch (action) {
      case 'comment':
        achievementTrigger = 'onComment';
        const totalComments = await getUserCommentCount(userId);
        achievementContext = { totalComments };
        break;
      case 'report':
        achievementTrigger = 'onReportCreate';
        const totalReports = await getUserReportCount(userId);
        achievementContext = { totalReports };
        break;
      case 'mention':
        achievementTrigger = 'onMention';
        // You would need to implement a function to count mentions
        achievementContext = { mentionsReceived: 1 }; // Placeholder
        break;
      case 'login_streak':
        achievementTrigger = 'onStreak';
        achievementContext = { loginDaysStreak: 1 }; // Placeholder
        break;
      // Add other cases as needed
    }
    
    // Check for achievements if we have a valid trigger
    let unlockedAchievements: string[] = [];
    if (achievementTrigger) {
      unlockedAchievements = await checkAchievements(userId, achievementTrigger, achievementContext);
    }
    
    // Return the result
    const result: AddXpResult = {
      newXp,
      newLevel,
      levelUp,
      unlockedAchievements
    };
    
    logger.log(`[${functionName}] XP added successfully:`, result);
    return result;
    
  } catch (error) {
    logger.error(`[${functionName}] Error adding XP:`, error);
    throw new Error(`Failed to add XP: ${error instanceof Error ? error.message : String(error)}`);
  }
}
