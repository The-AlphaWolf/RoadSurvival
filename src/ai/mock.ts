import { InterpretResponse, NarrateResponse } from './schemas';
import { GameState } from '../engine/types';

/**
 * High-quality canned responses for Day 1 and offline play
 */
export function getMockInterpretResponse(actionText: string): InterpretResponse {
  const lower = actionText.toLowerCase();

  if (lower.includes('travel') || lower.includes('drive')) {
    return {
      intent: 'travel',
      feasible: true,
      checks: [{ stat: 'agility', difficulty: 'easy', reason: 'Navigate cracked highway' }],
      timeCostMinutes: 60,
      exertion: 'light',
      targetIds: [],
    };
  }

  if (lower.includes('search') || lower.includes('scavenge') || lower.includes('look')) {
    return {
      intent: 'search',
      feasible: true,
      checks: [{ stat: 'perception', difficulty: 'normal', reason: 'Spot salvageable materials' }],
      timeCostMinutes: 30,
      exertion: 'light',
      targetIds: [],
    };
  }

  if (lower.includes('rest') || lower.includes('sleep')) {
    return {
      intent: 'rest',
      feasible: true,
      timeCostMinutes: 60,
      exertion: 'none',
      targetIds: [],
      checks: [],
    };
  }

  return {
    intent: 'other',
    feasible: true,
    timeCostMinutes: 15,
    exertion: 'light',
    targetIds: [],
    checks: [],
  };
}

/**
 * Returns a rich, context-aware mock narration matching the Survival Guide opening
 */
export function getMockNarrateResponse(
  state: GameState,
  resolvedMessages: string[]
): NarrateResponse {
  const unopenedChest = state.inventory.chests.find((c) => !c.isOpened);
  const chestRarityUpper = unopenedChest ? unopenedChest.rarity.toUpperCase() : 'PURPLE';
  const chestId = unopenedChest ? unopenedChest.id : '';

  const isFirstTurn = state.history.length === 0;

  if (isFirstTurn) {
    return {
      narrative: `You awaken to the harsh tang of ozone and hot asphalt. The digital clock on the faded dashboard flickers to life: 06:00 AM, Day 1.

You are Qing Zhou, former professional esports strategist, now stranded on the endless cracked ribbon of Highway 404. Your rusted Common Van sits motionless beneath an overcast, pale amber sky. In the passenger seat rests an ornate, pulsating 🎁 [${chestRarityUpper}] Treasure Chest, sealed with arcane metallic bands. 

A shimmering holographic sigil burns into the back of your hand: the SSS Mythical Unique Talent, "Upgrade" (6 charges available today, recharging at midnight). The road stretches infinitely into the fog ahead. Your survival journey begins now.`,
      commentary: null,
      choices: [
        {
          id: 'choice_1',
          text: `Use SSS Talent to Upgrade the [${chestRarityUpper}] Treasure Chest (1 Charge)`,
          risk: 'low',
          hint: 'Upgrading the chest before opening unlocks significantly higher tier loot!',
          action: { type: 'upgrade', targetId: chestId },
        },
        {
          id: 'choice_2',
          text: `Pry open the [${chestRarityUpper}] Treasure Chest immediately`,
          risk: 'medium',
          hint: 'Gain immediate resources, but forfeit the opportunity to upgrade the chest first.',
          action: { type: 'open_chest', targetId: chestId },
        },
        {
          id: 'choice_3',
          text: 'Inspect the Common Van engine, fuel system, and chassis',
          risk: 'low',
          hint: 'Assess vehicle wear, fuel capacity, and upgrade path readiness.',
          action: { type: 'freeform', params: { intent: 'explore' } },
        },
        {
          id: 'choice_4',
          text: 'Turn the ignition and begin driving carefully along Highway 404',
          risk: 'medium',
          hint: 'Burn fuel to discover upcoming road junctions, scrap piles, or chest guardians.',
          action: { type: 'travel' },
        },
        {
          id: 'choice_5',
          text: 'Tune the onboard radio to scan the World Chat frequencies',
          risk: 'low',
          hint: 'Check what other stranded survivors are reporting across the wasteland.',
          action: { type: 'chat' },
        },
        {
          id: 'choice_6',
          text: 'Use SSS Talent on your Carbon-Steel Machete to forge a lethal blade',
          risk: 'low',
          hint: 'Arm yourself with superior weaponry before meeting the hazards of the road.',
          action: {
            type: 'upgrade',
            targetId: state.inventory.items[0]?.id || '',
          },
        },
      ],
      worldNews: '📢 WORLD ANNOUNCEMENT: Novice Period initiated (Days 1–7). Spawning isolated.',
      worldChat: [
        {
          username: 'IronClad_99',
          message: 'What is this place?! My car spawned in a dry ditch!',
          type: 'panic',
        },
        {
          username: 'ViperX',
          message: 'Got a Silver chest! Anyone got fuel? Trading wood scrap for fuel canister.',
          type: 'trade',
        },
        {
          username: 'GhostRider',
          message: 'Don’t panic. Check your dashboard. The novice period gives us 7 days to prepare.',
          type: 'rumor',
        },
      ],
      npcDialogue: [],
      suggestedEvents: [],
      ambiance: 'desert_wind',
    };
  }

  // Follow-up turns
  const outcomesText = resolvedMessages.length > 0 ? resolvedMessages.join(' ') : 'You take a breath and prepare your next move.';

  return {
    narrative: `The engine hums with low vibration. ${outcomesText} Wind rattles the van's side mirrors as dust scuds across the highway lanes. Ahead in the distance, a decaying tollbooth silhouette emerges from the morning haze, flanked by rusted road barriers and what appears to be a cache of discarded containers.`,
    commentary:
      'A measured, calculated move. Efficient resource handling is what separates champions from corpses out here.',
    choices: [
      {
        id: 'c1',
        text: 'Scout the abandoned tollbooth on foot with weapons drawn',
        risk: 'medium',
        hint: 'High chance of scavenged parts or blueprints, moderate ambush risk.',
        action: { type: 'freeform', params: { intent: 'search' } },
      },
      {
        id: 'c2',
        text: 'Accelerate past the tollbooth without slowing down',
        risk: 'low',
        hint: 'Safely bypass potential traps at the cost of fuel and missed loot.',
        action: { type: 'travel' },
      },
      {
        id: 'c3',
        text: unopenedChest
          ? `Upgrade the [${chestRarityUpper}] Chest with SSS Talent (${state.player.talent.charges} charges left)`
          : 'Inspect inventory and manage gear weight',
        risk: 'low',
        hint: 'Optimize your equipment and talent economy.',
        action: unopenedChest
          ? { type: 'upgrade', targetId: chestId }
          : { type: 'freeform', params: { intent: 'craft' } },
      },
      {
        id: 'c4',
        text: unopenedChest ? 'Crack open the Treasure Chest' : 'Tune radio to World Chat',
        risk: 'low',
        hint: 'Check current chatter or claim loot.',
        action: unopenedChest ? { type: 'open_chest', targetId: chestId } : { type: 'chat' },
      },
      {
        id: 'c5',
        text: 'Perform field maintenance on the van tires and fuel filters',
        risk: 'low',
        hint: 'Restore vehicle condition before high-speed travel.',
        action: { type: 'rest' },
      },
      {
        id: 'c6',
        text: 'Scan the perimeter with binoculars to detect hidden tracks',
        risk: 'low',
        hint: 'Leverage your Perception to spot concealed threats or hidden supply crates.',
        action: { type: 'freeform', params: { intent: 'explore' } },
      },
    ],
    worldNews: null,
    worldChat: [
      {
        username: 'ScrapCollector',
        message: 'Watch out near the kilometer markers, saw some feral hounds stalking the shoulder.',
        type: 'rumor',
      },
    ],
    npcDialogue: [],
    suggestedEvents: [],
    ambiance: 'desert_wind',
  };
}
