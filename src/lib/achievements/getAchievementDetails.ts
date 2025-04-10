import { achievementRules, AchievementRule } from './achievementRules';
import logger from '@/lib/utils/logger';

/**
 * Interface for the detailed achievement data returned to the client
 */
export interface AchievementDetails {
  slug: string;
  label: string;
  description: string;
  icon: string;
}

/**
 * Retrieves the full details (label, description, icon) for a list of achievement slugs.
 *
 * @param slugs - An array of achievement slugs that were unlocked.
 * @returns An array of AchievementDetails objects.
 */
export function getAchievementDetails(slugs: string[]): AchievementDetails[] {
  if (!slugs || slugs.length === 0) {
    return [];
  }

  const details: AchievementDetails[] = [];
  for (const slug of slugs) {
    const rule = achievementRules.find(r => r.slug === slug);
    if (rule) {
      details.push({
        slug: rule.slug,
        label: rule.label,
        description: rule.description,
        icon: rule.icon,
      });
    } else {
      logger.warn(`[getAchievementDetails] No rule found for unlocked slug: ${slug}`);
      // Optionally include a default placeholder detail
      // details.push({ slug, label: 'Unknown Achievement', description: '', icon: '❓' });
    }
  }
  return details;
}
