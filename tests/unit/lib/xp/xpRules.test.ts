import { calculateLevel, xpRequiredForLevel, xpToNextLevel } from '@/lib/xp/xpRules';

describe('XP Rules', () => {
  describe('calculateLevel', () => {
    test('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    test('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    test('should return level 4 for 250 XP', () => {
      expect(calculateLevel(250)).toBe(4);
    });

    test('should handle large XP values', () => {
      expect(calculateLevel(10000)).toBeGreaterThan(10);
    });
  });

  describe('xpRequiredForLevel', () => {
    test('should return 0 for level 1', () => {
      expect(xpRequiredForLevel(1)).toBe(0);
    });

    test('should return correct XP for level 2', () => {
      expect(xpRequiredForLevel(2)).toBe(50);
    });

    test('should return correct XP for level 3', () => {
      expect(xpRequiredForLevel(3)).toBeGreaterThan(xpRequiredForLevel(2));
    });
  });

  describe('xpToNextLevel', () => {
    test('should return correct XP needed to reach level 2 from 0 XP', () => {
      expect(xpToNextLevel(0)).toBe(50);
    });

    test('should return correct XP needed to reach next level from current XP', () => {
      const currentXp = 75;
      const currentLevel = calculateLevel(currentXp);
      const nextLevelXp = xpRequiredForLevel(currentLevel + 1);
      expect(xpToNextLevel(currentXp)).toBe(nextLevelXp - currentXp);
    });
  });
});
