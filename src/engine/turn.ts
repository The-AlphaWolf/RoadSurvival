import {
  ChoiceAction,
  GameState,
  Item,
  RollRecord,
} from './types';
import { executeSpecialTalentUpgrade, executeTalentCascade, formatCascadeRollLog, performStatCheck } from './dice';
import { advanceClock } from './clock';
import { tickSurvivalMeters } from './survival';
import { awardExperience } from './xp';
import {
  addItemToInventory,
  applyTalentUpgradeToChest,
  applyTalentUpgradeToItem,
  calculateInventoryWeight,
  isChestEligibleForUpgrade,
  isItemEligibleForUpgrade,
} from './inventory';
import { openTreasureChest } from './loot';
import { checkVehicleEvolution } from './vehicle';
import { INTENT_TIME_BANDS, TALENT_SPECIAL } from './constants';

export interface ActionInput {
  text: string;
  action: ChoiceAction;
  intent?: string; // e.g. "travel", "explore", "upgrade", etc.
  checks?: { stat: any; difficulty: any; reason: string }[];
  timeCostMinutes?: number;
  exertion?: 'none' | 'light' | 'heavy';
}

export interface ResolveResult {
  updatedState: GameState;
  rolls: RollRecord[];
  messages: string[];
  lootGained: Item[];
  timePassedMinutes: number;
  midnightRecharged: boolean;
  leveledUp: boolean;
  isDead: boolean;
}

/**
 * Executes the RESOLVE step of the turn pipeline (Audited Plan §Turn Pipeline)
 *
 * All numbers, rolls, inventory mutations, and clock advances happen here deterministically
 * BEFORE being sent to the AI for narration.
 */
export function resolveTurn(state: GameState, input: ActionInput): ResolveResult {
  let currentState = JSON.parse(JSON.stringify(state)) as GameState;
  const rolls: RollRecord[] = [];
  const messages: string[] = [];
  const lootGained: Item[] = [];

  const action = input.action;
  const intent = input.intent || action.type;

  // 1. Process Mechanical Action (Upgrade, Special Upgrade, Open Chest, etc.)
  if (action.type === 'upgrade') {
    const targetId = action.targetId;
    if (currentState.player.talent.charges <= 0) {
      throw new Error('No talent upgrade charges remaining today! Recharges at midnight.');
    }

    // Check if target is an inventory item
    const itemIndex = currentState.inventory.items.findIndex((it) => it.id === targetId);
    if (itemIndex !== -1) {
      const item = currentState.inventory.items[itemIndex]!;
      if (!isItemEligibleForUpgrade(item)) {
        throw new Error(`Item "${item.name}" cannot be upgraded (already upgraded or ineligible).`);
      }

      const cascade = executeTalentCascade(item.rarity, item.id, item.name);
      const upgradedItem = applyTalentUpgradeToItem(item, cascade);
      currentState.inventory.items[itemIndex] = upgradedItem;
      currentState.player.talent.charges -= 1;

      const logText = formatCascadeRollLog(cascade);
      rolls.push({
        id: `roll_${Date.now()}_${Math.random()}`,
        timestampMinute: currentState.clock.totalElapsedMinutes,
        type: 'talent_cascade',
        description: `Upgrade Talent on "${item.name}"`,
        details: logText,
        outcome: cascade.tierJump > 1 ? 'crit' : 'success',
      });
      messages.push(`Upgraded ${item.name} to ${cascade.finalRarity.toUpperCase()}!`);
    } else {
      // Check if target is a treasure chest
      const chestIndex = currentState.inventory.chests.findIndex((c) => c.id === targetId);
      if (chestIndex !== -1) {
        const chest = currentState.inventory.chests[chestIndex]!;
        if (!isChestEligibleForUpgrade(chest)) {
          throw new Error(`Chest "${chest.name}" cannot be upgraded (already upgraded or opened).`);
        }

        const cascade = executeTalentCascade(chest.rarity, chest.id, chest.name);
        const upgradedChest = applyTalentUpgradeToChest(chest, cascade);
        currentState.inventory.chests[chestIndex] = upgradedChest;
        currentState.player.talent.charges -= 1;

        const logText = formatCascadeRollLog(cascade);
        rolls.push({
          id: `roll_${Date.now()}_${Math.random()}`,
          timestampMinute: currentState.clock.totalElapsedMinutes,
          type: 'talent_cascade',
          description: `Upgrade Talent on Chest "${chest.name}"`,
          details: logText,
          outcome: cascade.tierJump > 1 ? 'crit' : 'success',
        });
        messages.push(`Upgraded Treasure Chest to ${cascade.finalRarity.toUpperCase()}!`);
      } else {
        throw new Error('Target item or chest not found in inventory.');
      }
    }
  } else if (action.type === 'special_upgrade') {
    const targetId = action.targetId;
    if (!currentState.player.talent.specialAvailable) {
      throw new Error('Special 72-hour guaranteed upgrade is currently on cooldown!');
    }

    const itemIndex = currentState.inventory.items.findIndex((it) => it.id === targetId);
    if (itemIndex !== -1) {
      const item = currentState.inventory.items[itemIndex]!;
      if (!isItemEligibleForUpgrade(item)) {
        throw new Error(`Item "${item.name}" cannot be upgraded.`);
      }

      const cascade = executeSpecialTalentUpgrade(item.rarity, item.id, item.name);
      currentState.inventory.items[itemIndex] = applyTalentUpgradeToItem(item, cascade);
      currentState.player.talent.specialAvailable = false;
      currentState.player.talent.specialCooldownUntilMinute =
        currentState.clock.totalElapsedMinutes + TALENT_SPECIAL.cooldownMinutes;

      const logText = formatCascadeRollLog(cascade);
      rolls.push({
        id: `roll_${Date.now()}_${Math.random()}`,
        timestampMinute: currentState.clock.totalElapsedMinutes,
        type: 'talent_special',
        description: `Special 72h Upgrade on "${item.name}"`,
        details: logText,
        outcome: 'crit',
      });
      messages.push(`[SPECIAL TALENT] Guaranteed 3-tier jump applied to ${item.name}!`);
    } else {
      const chestIndex = currentState.inventory.chests.findIndex((c) => c.id === targetId);
      if (chestIndex !== -1) {
        const chest = currentState.inventory.chests[chestIndex]!;
        if (!isChestEligibleForUpgrade(chest)) {
          throw new Error(`Chest "${chest.name}" cannot be upgraded.`);
        }

        const cascade = executeSpecialTalentUpgrade(chest.rarity, chest.id, chest.name);
        currentState.inventory.chests[chestIndex] = applyTalentUpgradeToChest(chest, cascade);
        currentState.player.talent.specialAvailable = false;
        currentState.player.talent.specialCooldownUntilMinute =
          currentState.clock.totalElapsedMinutes + TALENT_SPECIAL.cooldownMinutes;

        const logText = formatCascadeRollLog(cascade);
        rolls.push({
          id: `roll_${Date.now()}_${Math.random()}`,
          timestampMinute: currentState.clock.totalElapsedMinutes,
          type: 'talent_special',
          description: `Special 72h Upgrade on Chest "${chest.name}"`,
          details: logText,
          outcome: 'crit',
        });
        messages.push(`[SPECIAL TALENT] Guaranteed 3-tier jump applied to Chest!`);
      } else {
        throw new Error('Target not found for special upgrade.');
      }
    }
  } else if (action.type === 'open_chest') {
    // PRIME DIRECTIVE 3: Never open a chest unless explicitly requested!
    const targetId = action.targetId;
    const chestIndex = currentState.inventory.chests.findIndex((c) => c.id === targetId || !targetId);
    if (chestIndex === -1) {
      throw new Error('No unopened chest available to open.');
    }
    const chest = currentState.inventory.chests[chestIndex]!;
    if (chest.isOpened) {
      throw new Error('Chest is already opened!');
    }

    const openResult = openTreasureChest(chest, currentState.player.stats.hiddenLuck);
    currentState.inventory.chests[chestIndex] = openResult.chest;

    for (const newItem of openResult.lootItems) {
      currentState.inventory.items = addItemToInventory(currentState.inventory.items, newItem);
      lootGained.push(newItem);
    }

    messages.push(openResult.summary);
  }

  // 2. Perform any Stat Checks (from freeform action or choices)
  if (input.checks && input.checks.length > 0) {
    for (const chk of input.checks) {
      const statVal = (currentState.player.stats as any)[chk.stat] || 10;
      const res = performStatCheck(statVal, chk.difficulty, currentState.player.stats.hiddenLuck);

      rolls.push({
        id: `roll_${Date.now()}_${Math.random()}`,
        timestampMinute: currentState.clock.totalElapsedMinutes,
        type: 'stat_check',
        description: `${chk.stat.toUpperCase()} check (${chk.difficulty}): ${chk.reason}`,
        details: `Rolled ${res.rolled} vs DC ${res.dc} (margin ${res.margin >= 0 ? '+' : ''}${res.margin})${res.nearMissSaved ? ' [Saved by Luck!]' : ''}`,
        outcome: res.success ? (res.nearMissSaved ? 'partial' : 'success') : 'failure',
      });
    }
  }

  // 3. Time Clamping & Clock Advance
  const band = INTENT_TIME_BANDS[intent] || INTENT_TIME_BANDS.other!;
  let minutesToPass = input.timeCostMinutes ?? band.default;
  minutesToPass = Math.max(band.min, Math.min(band.max, minutesToPass));

  const clockResult = advanceClock(currentState.clock, minutesToPass);
  currentState.clock = clockResult.newClock;
  currentState.flags.novicePeriod = clockResult.isNovicePeriod;

  // Midnight recharge of talent charges (Guide §5.1, Clarification C5)
  if (clockResult.midnightCrossed) {
    currentState.player.talent.charges = currentState.player.talent.maxCharges; // Reset to 6/6
    currentState.player.talent.lastRechargeDay = currentState.clock.day;
    messages.push('🌙 Midnight arrived: Talent charges recharged to 6/6!');
  }

  // Check 72h special cooldown
  if (!currentState.player.talent.specialAvailable) {
    if (currentState.clock.totalElapsedMinutes >= currentState.player.talent.specialCooldownUntilMinute) {
      currentState.player.talent.specialAvailable = true;
      messages.push('⭐ Special 72-Hour Guaranteed Upgrade charge is now ready!');
    }
  }

  // 4. Survival Meters Tick
  const tickResult = tickSurvivalMeters(currentState.player.meters, {
    minutes: minutesToPass,
    exertion: input.exertion || 'none',
    ambientTemperature: currentState.environment.temperature,
    traits: currentState.player.traits,
    stats: currentState.player.stats,
  });
  currentState.player.meters = tickResult.newMeters;
  currentState.flags.isDead = tickResult.isDead;

  for (const w of tickResult.warnings) {
    messages.push(w);
  }

  // 5. XP Award & Level Up
  const xpAward = awardExperience(
    currentState.player.level,
    currentState.player.experience,
    15, // Base XP for taking a meaningful turn action
    intent,
    currentState.player.firstTimeIntents,
    currentState.player.traits
  );

  currentState.player.level = xpAward.newLevel;
  currentState.player.experience = xpAward.newExperience;
  currentState.player.nextLevelExperience = xpAward.newNextLevelExperience;
  currentState.player.upgradePoints += xpAward.upgradePointsGranted;

  if (!currentState.player.firstTimeIntents.includes(intent)) {
    currentState.player.firstTimeIntents.push(intent);
    if (xpAward.fastLearnerBonus) {
      messages.push(`✨ Fast Learner bonus: First time performing "${intent}" (+25% XP)!`);
    }
  }

  if (xpAward.leveledUp) {
    messages.push(`🎉 LEVEL UP! Reached Level ${currentState.player.level}! (+${xpAward.upgradePointsGranted} Vehicle Upgrade Point)`);
    // Check vehicle evolution milestones
    currentState.vehicle = checkVehicleEvolution(currentState.player.level, currentState.vehicle);
  }

  // Append roll records to history
  currentState.rollHistory.push(...rolls);

  // Update carry weight
  const currentCarryWeight = calculateInventoryWeight(currentState.inventory.items, currentState.inventory.chests);
  if (currentCarryWeight > currentState.inventory.maxCarryWeight) {
    messages.push(`🎒 Encumbered: Carry weight (${currentCarryWeight}kg) exceeds max capacity (${currentState.inventory.maxCarryWeight}kg)!`);
  }

  return {
    updatedState: currentState,
    rolls,
    messages,
    lootGained,
    timePassedMinutes: minutesToPass,
    midnightRecharged: clockResult.midnightCrossed,
    leveledUp: xpAward.leveledUp,
    isDead: tickResult.isDead,
  };
}
