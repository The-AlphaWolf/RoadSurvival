import { Rarity, RollStageResult, TalentCascadeResult } from './types';
import { RARITY_ORDER, TALENT_CASCADE_ODDS, TALENT_SPECIAL } from './constants';

/**
 * Seeded PRNG using mulberry32.
 * Deterministic and serializable so that game state reloads maintain honest rolls.
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number = Date.now()) {
    this.state = seed >>> 0;
  }

  public getState(): number {
    return this.state;
  }

  public setState(state: number): void {
    this.state = state >>> 0;
  }

  /**
   * Returns a float in [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random float between min (inclusive) and max (exclusive)
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns an integer between min and max (inclusive)
   */
  public integer(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  /**
   * Rolls a d100 returning a number between 1 and 100
   */
  public d100(): number {
    return this.integer(1, 100);
  }

  /**
   * Checks a probability (0.0 to 1.0)
   */
  public check(probability: number): boolean {
    return this.next() < probability;
  }
}

// Global engine RNG instance
export const engineRNG = new SeededRNG(1337);

/**
 * Helper to advance a rarity by a given number of tiers, clamped at 'mythical'
 */
export function advanceRarity(current: Rarity, tiers: number): Rarity {
  const currentIndex = RARITY_ORDER.indexOf(current);
  if (currentIndex === -1) return current;
  const targetIndex = Math.min(RARITY_ORDER.length - 1, currentIndex + tiers);
  return RARITY_ORDER[targetIndex]!;
}

/**
 * Executes the SSS Mythical Unique Talent "Upgrade" roll cascade (Guide §5.1)
 *
 * Rules:
 * - Primary: 100% -> +1 Tier
 * - Secondary: 50% -> +1 Tier (only if Primary succeeded)
 * - Tertiary: 15% -> +1 Tier (only if Secondary succeeded)
 * - Gacha: 0.05% -> straight to Mythical (only if Tertiary succeeded)
 *
 * One talent use = 1 charge regardless of stages succeeded.
 * Returns the cascade result with individual stage rolls for honest display.
 */
export function executeTalentCascade(
  initialRarity: Rarity,
  targetItemId: string,
  targetItemName: string,
  rng: SeededRNG = engineRNG
): TalentCascadeResult {
  if (initialRarity === 'mythical') {
    throw new Error('Mythical tier items cannot be upgraded further.');
  }

  const stages: RollStageResult[] = [];
  let currentRarity: Rarity = initialRarity;
  let tierJump = 0;

  // 1. Primary Stage (100% chance)
  const primaryRoll = Math.round(rng.next() * 10000) / 100;
  const primarySuccess = true; // 100%
  stages.push({
    stage: 'primary',
    chance: 100,
    rolled: primaryRoll,
    success: primarySuccess,
  });
  tierJump += 1;
  currentRarity = advanceRarity(initialRarity, tierJump);

  // 2. Secondary Stage (50% chance)
  if (currentRarity !== 'mythical') {
    const secRoll = Math.round(rng.next() * 10000) / 100;
    const secSuccess = secRoll < TALENT_CASCADE_ODDS.secondary * 100;
    stages.push({
      stage: 'secondary',
      chance: TALENT_CASCADE_ODDS.secondary * 100,
      rolled: secRoll,
      success: secSuccess,
    });

    if (secSuccess) {
      tierJump += 1;
      currentRarity = advanceRarity(initialRarity, tierJump);

      // 3. Tertiary Stage (15% chance)
      if (currentRarity !== 'mythical') {
        const terRoll = Math.round(rng.next() * 10000) / 100;
        const terSuccess = terRoll < TALENT_CASCADE_ODDS.tertiary * 100;
        stages.push({
          stage: 'tertiary',
          chance: TALENT_CASCADE_ODDS.tertiary * 100,
          rolled: terRoll,
          success: terSuccess,
        });

        if (terSuccess) {
          tierJump += 1;
          currentRarity = advanceRarity(initialRarity, tierJump);

          // 4. Gacha Stage (0.05% chance -> straight to Mythical)
          if (currentRarity !== 'mythical') {
            const gachaRoll = Math.round(rng.next() * 100000) / 1000; // 3 decimal precision
            const gachaSuccess = gachaRoll < TALENT_CASCADE_ODDS.gacha * 100;
            stages.push({
              stage: 'gacha',
              chance: TALENT_CASCADE_ODDS.gacha * 100,
              rolled: gachaRoll,
              success: gachaSuccess,
            });

            if (gachaSuccess) {
              currentRarity = 'mythical';
              tierJump = RARITY_ORDER.indexOf('mythical') - RARITY_ORDER.indexOf(initialRarity);
            }
          }
        }
      }
    }
  }

  return {
    initialRarity,
    finalRarity: currentRarity,
    tierJump,
    stages,
    isSpecialUpgrade: false,
    targetItemId,
    targetItemName,
  };
}

/**
 * Executes the Special Guaranteed +3 Tier Talent Upgrade (Guide §5.1, Clarification C3)
 */
export function executeSpecialTalentUpgrade(
  initialRarity: Rarity,
  targetItemId: string,
  targetItemName: string
): TalentCascadeResult {
  if (initialRarity === 'mythical') {
    throw new Error('Mythical tier items cannot be upgraded further.');
  }

  const finalRarity = advanceRarity(initialRarity, TALENT_SPECIAL.tierJump);
  const tierJump = RARITY_ORDER.indexOf(finalRarity) - RARITY_ORDER.indexOf(initialRarity);

  return {
    initialRarity,
    finalRarity,
    tierJump,
    stages: [
      {
        stage: 'primary',
        chance: 100,
        rolled: 0,
        success: true,
      },
    ],
    isSpecialUpgrade: true,
    targetItemId,
    targetItemName,
  };
}

/**
 * Formats a talent cascade result for the honest dice display (Guide §5.1)
 * Example: `🎲 Primary: 100% → ✅ | Secondary: 50% (rolled 17) → ✅ | Tertiary: 15% (rolled 63) → ❌`
 */
export function formatCascadeRollLog(result: TalentCascadeResult): string {
  if (result.isSpecialUpgrade) {
    return `⭐ [Special 72h Talent]: Guaranteed +3 Tiers jump on "${result.targetItemName}" → ${result.finalRarity.toUpperCase()} ✅`;
  }

  const parts = result.stages.map((stage) => {
    const stageName = stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1);
    if (stage.stage === 'primary') {
      return `${stageName}: 100% → ✅`;
    }
    const rolledStr = stage.rolled.toFixed(stage.stage === 'gacha' ? 3 : 1);
    return `${stageName}: ${stage.chance}% (rolled ${rolledStr}) → ${stage.success ? '✅' : '❌'}`;
  });

  return `🎲 ${parts.join(' | ')} ⇒ Result: ${result.finalRarity.toUpperCase()} (+${result.tierJump} Tiers)`;
}

/**
 * Stat check with Luck near-miss mechanic (Guide §19, Clarification C10)
 * Returns outcome, rolled value, target difficulty, and whether luck turned a near-miss into partial success.
 */
export function performStatCheck(
  statValue: number,
  difficulty: 'trivial' | 'easy' | 'normal' | 'hard' | 'extreme',
  hiddenLuck: number,
  rng: SeededRNG = engineRNG
): {
  success: boolean;
  nearMissSaved: boolean;
  rolled: number;
  dc: number;
  margin: number;
} {
  const dcMap = {
    trivial: 5,
    easy: 10,
    normal: 14,
    hard: 18,
    extreme: 22,
  };

  const dc = dcMap[difficulty];
  const d20 = rng.integer(1, 20);
  const total = statValue / 2 + d20; // e.g. Stat 14 gives +7 + d20
  const margin = total - dc;

  if (margin >= 0) {
    return { success: true, nearMissSaved: false, rolled: total, dc, margin };
  }

  // Near-miss save: failed by 3 or less points
  if (margin >= -3) {
    // Luck check: chance = (hiddenLuck / 100) * 0.6
    const luckRoll = rng.next() * 100;
    const luckThreshold = hiddenLuck * 0.6;
    if (luckRoll < luckThreshold) {
      return { success: true, nearMissSaved: true, rolled: total, dc, margin };
    }
  }

  return { success: false, nearMissSaved: false, rolled: total, dc, margin };
}
