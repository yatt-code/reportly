#!/bin/bash

# Run all Gamification tests
echo "Running all Gamification tests..."
echo "--------------------------------"

# XP Rules tests
echo "\n🧪 Running XP Rules tests..."
npm test -- tests/unit/lib/xp/xpRules.test.ts

# Add XP tests
echo "\n🧪 Running Add XP tests..."
npm test -- tests/unit/lib/xp/addXp.test.ts

# Post Comment XP tests
echo "\n🧪 Running Post Comment XP tests..."
npm test -- tests/unit/app/actions/comment/postComment.xp.test.ts

# Save Report XP tests
echo "\n🧪 Running Save Report XP tests..."
npm test -- tests/unit/app/report/actions/saveReport.xp.test.ts

# Level Up Toast tests
echo "\n🧪 Running Level Up Toast tests..."
npm test -- tests/unit/components/xp/LevelUpToast.test.ts

# Check Achievements tests
echo "\n🧪 Running Check Achievements tests..."
npm test -- tests/unit/lib/achievements/checkAchievements.test.ts

echo "\n✅ All Gamification tests completed!"
