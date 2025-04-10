/**
 * Achievement Rules Configuration
 * 
 * This file contains the centralized configuration for all achievement rules in the system.
 * Each rule defines when and how an achievement is unlocked based on user actions.
 */

/**
 * Type definition for achievement triggers
 * These represent the different user actions that can trigger achievement checks
 */
export type AchievementTrigger = 'onComment' | 'onReportCreate' | 'onMention' | 'onStreak';

/**
 * Interface for the context object passed to achievement condition functions
 * This is a generic record that will contain different properties based on the trigger type
 */
export interface AchievementContext {
  [key: string]: any;
}

/**
 * Interface for a single achievement rule
 */
export interface AchievementRule {
  /** Unique identifier for the achievement */
  slug: string;
  
  /** The user action that triggers this achievement check */
  trigger: AchievementTrigger;
  
  /** Function that evaluates whether the achievement condition is met */
  condition: (context: AchievementContext) => boolean;
  
  /** User-friendly name of the achievement */
  label: string;
  
  /** Detailed description of the achievement */
  description: string;
  
  /** Emoji or icon identifier for the achievement */
  icon: string;
}

/**
 * The complete list of achievement rules
 */
export const achievementRules: AchievementRule[] = [
  // Comment-related achievements
  {
    slug: "first-comment",
    trigger: "onComment",
    condition: (ctx) => ctx.totalComments === 1,
    label: "First Comment!",
    description: "You've made your first comment!",
    icon: "💬"
  },
  {
    slug: "comment-streak-3",
    trigger: "onComment",
    condition: (ctx) => ctx.commentDaysStreak >= 3,
    label: "Comment Streak: 3 Days",
    description: "You've commented for 3 days in a row!",
    icon: "🔥"
  },
  {
    slug: "comment-10",
    trigger: "onComment",
    condition: (ctx) => ctx.totalComments >= 10,
    label: "Commenter",
    description: "You've made 10 comments!",
    icon: "🗣️"
  },
  
  // Report-related achievements
  {
    slug: "first-report",
    trigger: "onReportCreate",
    condition: (ctx) => ctx.totalReports === 1,
    label: "First Report!",
    description: "You've created your first report!",
    icon: "📝"
  },
  {
    slug: "report-streak-5",
    trigger: "onReportCreate",
    condition: (ctx) => ctx.reportDaysStreak >= 5,
    label: "Report Streak: 5 Days",
    description: "You've created reports for 5 days in a row!",
    icon: "📊"
  },
  
  // Mention-related achievements
  {
    slug: "first-mention",
    trigger: "onMention",
    condition: (ctx) => ctx.mentionsReceived === 1,
    label: "First Mention",
    description: "Someone mentioned you for the first time!",
    icon: "👋"
  },
  {
    slug: "popular-5-mentions",
    trigger: "onMention",
    condition: (ctx) => ctx.mentionsReceived >= 5,
    label: "Popular",
    description: "You've been mentioned 5 times!",
    icon: "⭐"
  },
  
  // Streak-related achievements
  {
    slug: "weekly-streak-4",
    trigger: "onStreak",
    condition: (ctx) => ctx.weeklyLoginStreak >= 4,
    label: "Weekly Warrior",
    description: "You've used the app for 4 weeks in a row!",
    icon: "📅"
  }
];

/**
 * Helper function to get achievement rules for a specific trigger
 * @param trigger The trigger type to filter by
 * @returns Array of achievement rules for the specified trigger
 */
export function getRulesByTrigger(trigger: AchievementTrigger): AchievementRule[] {
  return achievementRules.filter(rule => rule.trigger === trigger);
}

/**
 * Helper function to get an achievement rule by its slug
 * @param slug The unique identifier of the achievement
 * @returns The achievement rule or undefined if not found
 */
export function getRuleBySlug(slug: string): AchievementRule | undefined {
  return achievementRules.find(rule => rule.slug === slug);
}
