# 🧠 Technical Specification: Achievement Engine

## 🎯 Objective

Develop a central utility function `checkAchievements(userId, triggerContext)` that evaluates user activity and awards achievements based on a declarative configuration. This engine is designed to be triggered automatically after key user actions and serves as the core of the gamification system.

Key Responsibilities:
1. Evaluate user eligibility for achievements
2. Prevent duplicate achievement awards
3. Record new achievements in the database
4. Return newly unlocked achievement slugs for UI updates

## ⚙️ Function Signature

```typescript
async function checkAchievements(
  userId: string,
  trigger: "onComment" | "onReportCreate" | "onMention" | "onStreak",
  context: Record<string, any> // Contextual data for achievement evaluation
): Promise<string[]> // Array of newly unlocked achievement slugs
```

## 📦 Core Logic Flow

1. Retrieve user's existing achievements from the database
2. Load achievement rules from configuration (achievementRules.ts)
3. Filter rules based on the current trigger type
4. For each applicable rule:
   - Check if the user has already unlocked it
   - If not, evaluate the rule's condition using the provided context
5. For each met condition:
   - Insert a new achievement record into the database
   - Add the achievement slug to the result array
6. Return the array of newly unlocked achievement slugs

## 📘 Achievement Rule Configuration

Achievement rules are defined in a separate configuration file (achievementRules.ts) for easy maintenance and extensibility.

Example rule structure:
```typescript
export const achievementRules = [
  {
    slug: "first-comment",
    trigger: "onComment",
    condition: (ctx) => ctx.totalComments === 1,
    label: "First Comment!",
    description: "You left your very first comment 🎉",
    icon: "💬",
  },
  // Additional rules...
];
```

## 🧠 Context Input Examples

The context object provides necessary data for evaluating achievement conditions:

onComment trigger:
```typescript
{
  totalComments: 5,
  reportId: "123",
}
```

onReportCreate trigger:
```typescript
{
  totalReports: 3,
}
```

onMention trigger:
```typescript
{
  mentionsReceived: 2,
}
```

## ✅ Acceptance Criteria

1. Function returns a list of newly unlocked achievement slugs
2. No duplicate achievements are awarded
3. Rule conditions are correctly applied
4. New achievements are properly recorded in the database
5. Implementation is decoupled from UI and database trigger logic
6. New rules can be easily added to achievementRules.ts

## 🔐 Security Considerations

- The function should only be invoked by server-side logic
- Achievement insertions must use appropriate system privileges

## 🧪 Future Enhancements

- Implement real-time notifications for newly unlocked achievements
- Add analytics tracking for achievement unlocks
- Implement caching for improved performance on frequently accessed user achievements

