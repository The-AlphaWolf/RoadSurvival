import { GameState } from '../engine/types';
import { getLuckDescriptor } from '../engine/constants';
import { formatClockTime } from '../engine/clock';

/**
 * Builds the Master GM system prompt incorporating Survival Guide rules
 */
export function buildSystemPrompt(): string {
  return `You are the Game Master, Narrator, World System, and NPC voice of "Survival Road", an interactive post-apocalyptic survival road RPG.
Follow the Ultimate Game Master Bible rules strictly:

PRIME DIRECTIVES:
1. The player drives the story. Never make choices, speak, or act for the player character (Qing Zhou).
2. Never skip time without explicit request. One turn = one meaningful action or decision.
3. NEVER open a Treasure Chest yourself. Chests can ONLY be opened when the player explicitly performs an open action!
4. Honest dice: never fudge a result. The game engine has already resolved all dice rolls, damage, time, and inventory changes. You MUST narrate the resolved results faithfully.
5. Consistency over drama: The provided Game State is the single source of truth.
6. Tone & Commentary: Be brutal and entertaining. Jeer mercilessly at stupid or careless decisions, but praise genuine strategic "pro-gamer" foresight. Roast the decision, not the person.
7. Choices: Provide EXACTLY 6 distinct, meaningful choices spanning cautious, aggressive, clever, economic, social, and exploratory paths.

FORMAT:
Return strictly valid JSON matching the schema. No markdown formatting outside the JSON.`;
}

/**
 * Serializes the game state into public and GM-only context sections
 */
export function buildContextPayload(
  state: GameState,
  resolvedResultsMessage: string[]
): string {
  const publicContext = {
    day: state.clock.day,
    time: formatClockTime(state.clock.minute),
    location: state.environment.locationName,
    weather: state.environment.weather,
    temperature: `${state.environment.temperature}°C`,
    meters: {
      health: `${state.player.meters.health}/${state.player.meters.maxHealth}`,
      energy: state.player.meters.energy,
      hunger: state.player.meters.hunger,
      thirst: state.player.meters.thirst,
      fatigue: state.player.meters.fatigue,
      sanity: state.player.meters.sanity,
    },
    playerStats: {
      strength: state.player.stats.strength,
      agility: state.player.stats.agility,
      endurance: state.player.stats.endurance,
      intelligence: state.player.stats.intelligence,
      perception: state.player.stats.perception,
      charm: state.player.stats.charm,
      luckDescriptor: getLuckDescriptor(state.player.stats.hiddenLuck),
    },
    talentCharges: `${state.player.talent.charges}/6`,
    specialTalentReady: state.player.talent.specialAvailable,
    vehicle: {
      name: state.vehicle.name,
      stage: state.vehicle.stage,
      durability: `${state.vehicle.durability}%`,
      fuel: `${state.vehicle.fuel}/${state.vehicle.maxFuel}`,
      wear: `${state.vehicle.wear}%`,
    },
    inventorySummary: state.inventory.items.map(
      (it) => `${it.name} (${it.rarity.toUpperCase()} x${it.quantity})${it.isUpgraded ? ' [Upgraded ✔]' : ''}`
    ),
    unopenedChests: state.inventory.chests
      .filter((c) => !c.isOpened)
      .map((c) => `${c.name} (${c.rarity.toUpperCase()})${c.isUpgraded ? ' [Upgraded ✔]' : ''}`),
    activeQuests: state.quests.map((q) => q.title),
  };

  const gmOnlyContext = {
    exactHiddenLuck: state.player.stats.hiddenLuck,
    novicePeriod: state.flags.novicePeriod,
    noviceGuardianImmunity: state.flags.novicePeriod
      ? 'Chest guardians cannot deal damage during Days 1-7. Foreshadow this mysteriously if encountered, never state it outright.'
      : 'Novice protection ended.',
    recentDecisions: state.importantDecisions.slice(-5),
  };

  return JSON.stringify({
    [RESOLVED_RESULTS_KEY]: resolvedResultsMessage,
    publicContext,
    gmOnlyContext,
    recentHistory: state.history.slice(-3).map((h) => ({
      turn: h.turnNumber,
      action: h.actionText,
      outcome: h.outcomeSummary,
    })),
  });
}

const RESOLVED_RESULTS_KEY = 'MECHANICAL_RESULTS_RESOLVED_BY_ENGINE_DO_NOT_CONTRADICT';
