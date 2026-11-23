import { describe, expect, it } from 'vitest';
import { executeSpecialTalentUpgrade, executeTalentCascade, formatCascadeRollLog, SeededRNG } from './dice';
import { advanceClock, createInitialClock, formatClockTime } from './clock';
import { tickSurvivalMeters } from './survival';
import { awardExperience } from './xp';
import { openTreasureChest, rollStarterChest } from './loot';
import { isItemEligibleForUpgrade } from './inventory';
import { createInitialVehicle } from './vehicle';
import { resolveTurn } from './turn';
import { GameState } from './types';
import { createItemFromTemplate } from './data/items';
import { STARTING_PLAYER_STATS, STARTING_SURVIVAL_METERS } from './constants';

describe('Game Engine: Dice & Talent Cascade', () => {
  it('guarantees at least +1 tier on any upgrade talent use (Primary 100%)', () => {
    const rng = new SeededRNG(42);
    const result = executeTalentCascade('common', 'test_item', 'Test Item', rng);
    expect(result.tierJump).toBeGreaterThanOrEqual(1);
    expect(result.stages[0]?.stage).toBe('primary');
    expect(result.stages[0]?.success).toBe(true);
    expect(result.finalRarity).not.toBe('common');
  });

  it('prohibits upgrading already-upgraded items or mythical items', () => {
    const rng = new SeededRNG(42);
    expect(() => executeTalentCascade('mythical', 'item1', 'Mythical Blade', rng)).toThrow();

    const item = createItemFromTemplate('tactical_machete', 'common');
    item.isUpgraded = true;
    expect(isItemEligibleForUpgrade(item)).toBe(false);
  });

  it('correctly executes special 72-hour guaranteed +3 tiers jump', () => {
    const special = executeSpecialTalentUpgrade('common', 'item2', 'Common Van Fuel Tank');
    expect(special.isSpecialUpgrade).toBe(true);
    expect(special.tierJump).toBe(3);
    expect(special.finalRarity).toBe('gold'); // Common -> Uncommon -> Silver -> Gold
  });

  it('formats honest cascade log showing rolls and outcomes', () => {
    const rng = new SeededRNG(1234);
    const result = executeTalentCascade('silver', 'item3', 'Silver Armor', rng);
    const log = formatCascadeRollLog(result);
    expect(log).toContain('🎲 Primary: 100% → ✅');
  });
});

describe('Game Engine: Clock & Day Cycle', () => {
  it('starts at Day 1, 06:00 AM (minute 360)', () => {
    const clock = createInitialClock();
    expect(clock.day).toBe(1);
    expect(clock.minute).toBe(360);
    expect(formatClockTime(clock.minute)).toBe('06:00');
  });

  it('detects midnight crossing and advances day', () => {
    const clock = createInitialClock(); // Day 1, 06:00 AM (360)
    // Advance 19 hours (1140 minutes) -> 23:00 (1500 total = Day 2, 01:00 AM)
    const result = advanceClock(clock, 1140);
    expect(result.newClock.day).toBe(2);
    expect(result.midnightCrossed).toBe(true);
    expect(result.isNovicePeriod).toBe(true);
  });

  it('recognizes novice period ends after Day 7', () => {
    let clock = createInitialClock();
    const result = advanceClock(clock, 7 * 1440); // 7 full days
    expect(result.newClock.day).toBe(8);
    expect(result.isNovicePeriod).toBe(false);
  });
});

describe('Game Engine: Survival & XP', () => {
  it('depletes thirst faster than hunger', () => {
    const meters = { ...STARTING_SURVIVAL_METERS };
    const stats = { ...STARTING_PLAYER_STATS };
    const result = tickSurvivalMeters(meters, {
      minutes: 120, // 2 hours
      exertion: 'none',
      ambientTemperature: 22,
      traits: ['physically_average'],
      stats,
    });

    expect(result.newMeters.thirst).toBeLessThan(result.newMeters.hunger);
  });

  it('awards fast learner bonus XP on first-time action', () => {
    const result = awardExperience(1, 0, 100, 'explore', [], ['fast_learner']);
    expect(result.actualXpAwarded).toBe(125); // 100 * 1.25
    expect(result.fastLearnerBonus).toBe(true);

    const repeatResult = awardExperience(1, 0, 100, 'explore', ['explore'], ['fast_learner']);
    expect(repeatResult.actualXpAwarded).toBe(100);
    expect(repeatResult.fastLearnerBonus).toBe(false);
  });
});

describe('Game Engine: Loot & Chests', () => {
  it('rolls a starter chest heavily weighted to purple/black/red', () => {
    const rng = new SeededRNG(99);
    const chest = rollStarterChest(rng);
    expect(['purple', 'black', 'red']).toContain(chest.rarity);
    expect(chest.isOpened).toBe(false);
  });

  it('guarantees at least 1 at-tier item on chest opening and bundles stackables', () => {
    const rng = new SeededRNG(777);
    const chest = rollStarterChest(rng);
    chest.rarity = 'purple';

    const result = openTreasureChest(chest, 80, rng);
    expect(result.chest.isOpened).toBe(true);
    expect(result.lootItems.length).toBeGreaterThanOrEqual(2);

    const hasPurpleItem = result.lootItems.some((item) => item.rarity === 'purple');
    expect(hasPurpleItem).toBe(true);

    // Any bundle item in purple should have quantity 100
    const bundleItem = result.lootItems.find((item) => item.isBundle && item.rarity === 'purple');
    if (bundleItem) {
      expect(bundleItem.quantity).toBe(100);
    }
  });
});

describe('Game Engine: Full Turn Resolver', () => {
  function createTestInitialState(): GameState {
    const vehicle = createInitialVehicle();
    const starterChest = rollStarterChest();
    return {
      version: '0.1.0',
      player: {
        name: 'Qing Zhou',
        gender: 'male',
        orientation: 'straight',
        past: 'professional_gamer',
        level: 1,
        experience: 0,
        nextLevelExperience: 100,
        upgradePoints: 0,
        stats: { ...STARTING_PLAYER_STATS },
        meters: { ...STARTING_SURVIVAL_METERS },
        traits: ['strategist', 'calm_under_pressure', 'fast_learner', 'highly_observant', 'physically_average'],
        talent: {
          name: 'Upgrade',
          tier: 'mythical',
          charges: 6,
          maxCharges: 6,
          lastRechargeDay: 1,
          specialAvailable: true,
          specialCooldownUntilMinute: 0,
        },
        titles: ['Novice Survivor'],
        achievements: [],
        effects: [],
        firstTimeIntents: [],
      },
      vehicle,
      inventory: {
        items: [createItemFromTemplate('tactical_machete', 'common', 1)],
        chests: [starterChest],
        currency: 0,
        maxCarryWeight: 40,
      },
      clock: createInitialClock(),
      environment: {
        weather: 'clear',
        temperature: 20,
        visibility: 'good',
        locationName: 'Highway 404 (Kilometer Zero)',
        dangerLevel: 1,
      },
      quests: [],
      npcs: {},
      rumors: [],
      chatRoster: [],
      chatHistory: [],
      worldNews: [],
      rollHistory: [],
      history: [],
      importantDecisions: [],
      flags: {
        novicePeriod: true,
        isDead: false,
        lastChanceAvailable: false,
        chatVisible: false,
        currentScenario: 'Arrival at Survival Road',
        currentCommentary: null,
        currentChoices: [],
      },
      rngState: 1337,
    };
  }

  it('correctly upgrades an item and uses 1 charge', () => {
    const state = createTestInitialState();
    const machete = state.inventory.items[0]!;

    const result = resolveTurn(state, {
      text: 'Upgrade my machete',
      action: { type: 'upgrade', targetId: machete.id },
    });

    expect(result.updatedState.player.talent.charges).toBe(5);
    const upgradedMachete = result.updatedState.inventory.items[0]!;
    expect(upgradedMachete.isUpgraded).toBe(true);
    expect(upgradedMachete.rarity).not.toBe('common');
    expect(result.rolls.length).toBe(1);
    expect(result.rolls[0]?.type).toBe('talent_cascade');
  });

  it('opens a chest only upon explicit action and transfers items', () => {
    const state = createTestInitialState();
    const chest = state.inventory.chests[0]!;

    const result = resolveTurn(state, {
      text: 'Open starter chest',
      action: { type: 'open_chest', targetId: chest.id },
    });

    expect(result.updatedState.inventory.chests[0]?.isOpened).toBe(true);
    expect(result.lootGained.length).toBeGreaterThanOrEqual(2);
    expect(result.updatedState.inventory.items.length).toBeGreaterThan(1);
  });
});
