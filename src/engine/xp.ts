import { PlayerTrait } from './types';

/**
 * Calculates XP required for next level using an exponential curve:
 * Level 1 -> 100 XP
 * Level 2 -> 250 XP
 * Level 3 -> 450 XP, etc.
 */
export function getRequiredExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.4));
}

export interface ExperienceAwardResult {
  newLevel: number;
  newExperience: number;
  newNextLevelExperience: number;
  upgradePointsGranted: number;
  leveledUp: boolean;
  actualXpAwarded: number;
  fastLearnerBonus: boolean;
}

/**
 * Awards experience to the player/vehicle.
 *
 * Rules:
 * - Fast learner trait: +25% XP bonus for first-time intent/action types (Guide §2, Clarification C15).
 * - Each level up grants 1 upgrade point (Clarification C8).
 */
export function awardExperience(
  currentLevel: number,
  currentExperience: number,
  baseXp: number,
  intentOrActionKey: string,
  knownFirstTimeIntents: string[],
  traits: PlayerTrait[]
): ExperienceAwardResult {
  let actualXp = baseXp;
  let fastLearnerBonus = false;

  const isFirstTime = !knownFirstTimeIntents.includes(intentOrActionKey);
  if (isFirstTime && traits.includes('fast_learner')) {
    actualXp = Math.floor(baseXp * 1.25);
    fastLearnerBonus = true;
  }

  let xp = currentExperience + actualXp;
  let level = currentLevel;
  let upgradePoints = 0;
  let nextLevelXp = getRequiredExperienceForLevel(level);

  while (xp >= nextLevelXp) {
    xp -= nextLevelXp;
    level += 1;
    upgradePoints += 1; // 1 upgrade point per level
    nextLevelXp = getRequiredExperienceForLevel(level);
  }

  return {
    newLevel: level,
    newExperience: xp,
    newNextLevelExperience: nextLevelXp,
    upgradePointsGranted: upgradePoints,
    leveledUp: level > currentLevel,
    actualXpAwarded: actualXp,
    fastLearnerBonus,
  };
}
