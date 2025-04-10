/**
 * Core Achievement Verification Function
 * 
 * This module implements the central achievement checking mechanism that evaluates
 * user actions against achievement rules and records newly unlocked achievements.
 */

import { Achievement } from '@/models/Achievement';
import { AchievementTrigger, AchievementContext, getRulesByTrigger } from './achievementRules';
import connectDB from '@/lib/db/connectDB';
import logger from '@/lib/utils/logger';

/**
 * Checks if a user has unlocked any achievements based on the provided trigger and context.
 * 
 * @param userId - The ID of the user to check achievements for
 * @param trigger - The action that triggered the achievement check
 * @param context - Contextual data for evaluating achievement conditions
 * @returns An array of newly unlocked achievement slugs
 */
export async function checkAchievements(
  userId: string,
  trigger: AchievementTrigger,
  context: AchievementContext
): Promise<string[]> {
  const functionName = 'checkAchievements';
  logger.log(`[${functionName}] Checking achievements for user ${userId}`, { trigger, contextKeys: Object.keys(context) });
  
  try {
    // Connect to the database
    await connectDB();
    
    // Step 1: Retrieve user's current achievements
    const existingAchievements = await Achievement.find({ userId });
    const existingSlugs = existingAchievements.map(achievement => achievement.slug);
    
    logger.log(`[${functionName}] User has ${existingSlugs.length} existing achievements`, { existingSlugs });
    
    // Step 2: Filter applicable rules based on the trigger
    const applicableRules = getRulesByTrigger(trigger);
    
    if (applicableRules.length === 0) {
      logger.log(`[${functionName}] No rules found for trigger: ${trigger}`);
      return [];
    }
    
    logger.log(`[${functionName}] Found ${applicableRules.length} applicable rules for trigger: ${trigger}`);
    
    // Step 3: Check each rule and record new achievements
    const newlyUnlockedSlugs: string[] = [];
    
    for (const rule of applicableRules) {
      // Skip if already unlocked
      if (existingSlugs.includes(rule.slug)) {
        logger.log(`[${functionName}] Achievement "${rule.slug}" already unlocked, skipping`);
        continue;
      }
      
      // Evaluate the condition
      try {
        const conditionMet = rule.condition(context);
        
        if (conditionMet) {
          logger.log(`[${functionName}] Condition met for achievement: ${rule.slug}`);
          
          // Record the achievement with current timestamp
          const newAchievement = new Achievement({
            userId,
            slug: rule.slug,
            unlockedAt: new Date()
          });
          
          await newAchievement.save();
          newlyUnlockedSlugs.push(rule.slug);
          
          logger.log(`[${functionName}] Recorded new achievement: ${rule.slug}`);
        } else {
          logger.log(`[${functionName}] Condition not met for achievement: ${rule.slug}`);
        }
      } catch (conditionError) {
        // If a condition throws an error, log it but continue checking other rules
        logger.error(`[${functionName}] Error evaluating condition for achievement: ${rule.slug}`, conditionError);
      }
    }
    
    // Step 4: Return array of newly unlocked achievement slugs
    logger.log(`[${functionName}] Unlocked ${newlyUnlockedSlugs.length} new achievements`, { newlyUnlockedSlugs });
    return newlyUnlockedSlugs;
    
  } catch (error) {
    logger.error(`[${functionName}] Error checking achievements`, error);
    // Re-throw the error to be handled by the caller
    throw new Error(`Failed to check achievements: ${error instanceof Error ? error.message : String(error)}`);
  }
}
