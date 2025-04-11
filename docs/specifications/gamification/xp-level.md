
⸻

🧪 Mini-Spec: Enhanced XP & Level System

⸻

🎯 Objective

Implement a comprehensive XP (experience point) and Level system to gamify user engagement in Reportly. This system will track user activities, assign XP, calculate levels, and provide visual feedback, creating a motivating and rewarding experience for long-term user retention.

⸻

📦 Core Features

| Feature | Description |
|---------|-------------|
| 🧮 XP Tracking | Assign XP for user actions (comments, reports, mentions, etc.) |
| 🧗 Level Calculation | Use a non-linear curve to map XP to user levels |
| 📊 User Stats | Store and retrieve XP, level, and related data for each user |
| 📈 Progress Visualization | Display current XP, level, and progress to next level |
| 🎉 Level-Up Feedback | Provide visual/audio cues when a user levels up |
| 🏆 Achievements | Unlock achievements based on XP milestones or specific actions |

⸻

🧱 Data Model (Supabase)

Table: user_stats
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

⸻

🧠 XP Logic Rules

| Action | XP Gained |
|--------|-----------|
| Post comment | +10 XP |
| Create report | +25 XP |
| Mentioned by others | +5 XP |
| Daily login streak | +5 XP per day (max 25) |
| Complete profile | +50 XP |
| First report of the week | +15 XP |

Define these rules in `lib/xp/xpRules.ts` for easy maintenance.

⸻

🔢 Level Curve

Implement a logarithmic XP curve to balance progression:

```typescript
function calculateLevel(xp: number): number {
  return Math.floor(Math.log(xp / 100 + 1) / Math.log(1.5)) + 1;
}
```

⸻

🔁 Integration Points

| Trigger | Action |
|---------|--------|
| `postComment.ts` | `addXp(userId, "comment")` |
| `saveReport.ts` | `addXp(userId, "report")` |
| `userMentioned.ts` | `addXp(userId, "mention")` |
| `dailyLoginCheck.ts` | `addXp(userId, "login_streak")` |
| `completeProfile.ts` | `addXp(userId, "profile_complete")` |
| `weeklyReportCheck.ts` | `addXp(userId, "first_weekly_report")` |

⸻

🔧 Core Utility

File: `lib/xp/addXp.ts`

```typescript
export async function addXp(userId: string, action: XpAction): Promise<{
  newXp: number;
  levelUp: boolean;
  newLevel: number;
  unlockedAchievements: Achievement[];
}> {
  // 1. Fetch current XP and level
  // 2. Calculate XP gain based on action
  // 3. Update XP and recalculate level
  // 4. Check for unlocked achievements
  // 5. Save updated stats to Supabase
  // 6. Return updated info and any unlocked achievements
}
```

⸻

💻 UI Components

| Component | Purpose |
|-----------|---------|
| `LevelBadge.tsx` | Display current level (e.g., 🧠 Level 5) |
| `XpProgressBar.tsx` | Show XP progress to next level |
| `LevelUpModal.tsx` | Celebratory modal for level-ups |
| `AchievementUnlockToast.tsx` | Toast notification for new achievements |
| `UserStatsPanel.tsx` | Dashboard widget with XP, level, and achievements |

⸻

✅ Acceptance Criteria

1. Users gain appropriate XP for all defined actions
2. Levels are calculated correctly using the logarithmic curve
3. Level-up events trigger visual feedback (modal/toast)
4. Achievement unlocks are detected and displayed
5. User stats are securely stored and efficiently retrieved
6. XP/Level UI is seamlessly integrated into profile and dashboard
7. System performance is optimized for frequent XP updates

⸻

🧪 Future Enhancements

1. Team/Group XP leaderboards
2. Weekly XP summary emails with personalized insights
3. Level-based feature unlocks (e.g., AI assistant modes, custom themes)
4. XP boosters for special events or challenges
5. Social sharing of achievements and level-ups
6. Integration with external reward systems or gift cards

⸻

