# XP and Level System

This directory contains the core functionality for the XP (experience points) and level system in Reportly.

## Overview

The XP system tracks user activities, assigns XP points, calculates levels, and provides visual feedback to create a motivating and rewarding experience for users.

## Database Schema

The system uses a Supabase table called `user_stats` with the following structure:

```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Row Level Security (RLS)

The `user_stats` table has the following RLS policies:

1. Users can view their own stats
2. Users can update their own stats
3. Only the backend (service role) can insert new stats

## Core Files

- `xpRules.ts`: Defines XP gain values for different actions and level calculation formulas
- `addXp.ts`: Core utility function to add XP to a user and handle level-up events
- `index.ts`: Exports all XP-related functionality

## XP Actions and Values

| Action | XP Gained |
|--------|-----------|
| Post comment | +10 XP |
| Create report | +25 XP |
| Mentioned by others | +5 XP |
| Daily login streak | +5 XP per day (max 25) |
| Complete profile | +50 XP |
| First report of the week | +15 XP |

## Level Calculation

Levels are calculated using a logarithmic curve to balance progression:

```typescript
function calculateLevel(xp: number): number {
  return Math.floor(Math.log(xp / 100 + 1) / Math.log(1.5)) + 1;
}
```

This creates a curve where each level requires more XP than the last.

## Integration Points

The XP system is integrated at the following points:

- `postComment.ts`: Adds XP when a user posts a comment
- `saveReport.ts`: Adds XP when a user creates a report

## UI Components

The following UI components are available in `src/components/xp`:

- `LevelBadge`: Displays the user's current level
- `XpProgressBar`: Shows progress towards the next level
- `LevelUpToast`: Notification for level-up events
- `XpGainToast`: Notification for XP gain
- `UserStatsPanel`: Dashboard widget with XP, level, and achievements

## Server Actions

- `getUserStats.ts`: Fetches a user's XP and level stats from Supabase

## Hooks

- `useUserStats.ts`: React hook to fetch and manage user stats in client components
