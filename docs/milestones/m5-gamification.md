# 🏆 Mini-Spec: Gamification & Achievement Layer

Milestone 5 – Gamification & Achievements

Objective:
Implement a modular achievement and engagement system to incentivize user participation and foster ongoing contributions. The system will monitor various user activities without compromising the platform's primary focus on productivity.

Key User Activities Tracked:
1. Comments written
2. Reports created
3. First mention received
4. Streaks (e.g., daily commenting)
5. Group collaboration milestones

Core Components:
1. Achievements Collection: MongoDB collection to store unlocked achievements per user
2. Achievement Rules Config: Declarative rules engine for defining achievement criteria
3. CheckAchievements() Engine: Utility to verify and award achievements based on user actions
4. Badge UI Components: Visual representations of unlocked achievements
5. AchievementsPanel.tsx: Dashboard component to display earned achievements

Backend Schema (MongoDB Collection: achievements):
- userId (string): Identifier of the user who earned the achievement
- slug (string): Unique identifier for the achievement (e.g., "first-comment")
- unlockedAt (Date): Timestamp when the achievement was unlocked

Achievement Rules Configuration:
Rules are defined in a configuration file, allowing for easy modification without altering core logic. Example rule structure:
{
  slug: "first-comment",
  trigger: "onComment",
  condition: (context) => context.totalComments === 1,
  label: "First Comment!",
  description: "You left your very first comment 🎉",
  icon: "🗨️"
}

Supported triggers: onComment, onMention, onReportCreate, onStreak

Achievement Engine:
Utility function: checkAchievements(userId, triggerContext)
- Invoked after relevant user actions (e.g., posting a comment, creating a report)
- Retrieves user statistics (comments, reports, streaks)
- Evaluates achievement rules matching the trigger
- Inserts new achievements into the achievements collection when conditions are met

Frontend Components:
1. AchievementBadge.tsx: Renders individual achievement icons with tooltips
2. AchievementsPanel.tsx: Displays a comprehensive list of earned achievements
3. UnlockToast.tsx: Optional notification for newly unlocked achievements
4. DashboardBadgeRow.tsx: Horizontal scrollable row for summarizing achievements

Access Control:
- Unlocking achievements: Restricted to system-level operations via backend utility
- Viewing achievements: Limited to the user's own achievements (with optional public visibility)
- Managing achievement rules: Admin-only access or hardcoded configurations

Acceptance Criteria:
1. Accurate tracking of user activities (comments, reports, etc.)
2. Conditional awarding of achievements based on configuration
3. Visual representation of badges in UI (dashboard/profile)
4. Execution of unlock logic on key user actions
5. Optional toast or notification system for achievement unlocks

Future Enhancements:
1. Group-specific achievements
2. Leaderboard functionality
3. AI-powered goal suggestions (e.g., "Write one report daily for 3 days")
4. Profile experience points and leveling system
5. Shareable profile badge embeds for external platforms

