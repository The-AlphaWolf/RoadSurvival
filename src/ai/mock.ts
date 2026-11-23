import { InterpretResponse, NarrateResponse } from './schemas';
import { GameState } from '../engine/types';
import { calculateInventoryWeight } from '../engine/inventory';

export function getMockInterpretResponse(actionText: string): InterpretResponse {
  const lower = actionText.toLowerCase();

  if (lower.includes('travel') || lower.includes('drive') || lower.includes('accelerate') || lower.includes('speed') || lower.includes('road')) {
    return {
      intent: 'travel',
      feasible: true,
      checks: [{ stat: 'agility', difficulty: 'easy', reason: 'Navigate cracked highway' }],
      timeCostMinutes: 45,
      exertion: 'light',
      targetIds: [],
    };
  }

  if (lower.includes('search') || lower.includes('scavenge') || lower.includes('scout') || lower.includes('loot') || lower.includes('explore')) {
    return {
      intent: 'search',
      feasible: true,
      checks: [{ stat: 'perception', difficulty: 'normal', reason: 'Spot salvageable materials and hazards' }],
      timeCostMinutes: 30,
      exertion: 'light',
      targetIds: [],
    };
  }

  if (lower.includes('stash') || lower.includes('store') || lower.includes('cargo') || lower.includes('weight') || lower.includes('manage')) {
    return {
      intent: 'craft',
      feasible: true,
      timeCostMinutes: 15,
      exertion: 'light',
      targetIds: [],
      checks: [],
    };
  }

  if (lower.includes('refuel') || lower.includes('fuel')) {
    return {
      intent: 'use_item',
      feasible: true,
      timeCostMinutes: 10,
      exertion: 'light',
      targetIds: [],
      checks: [],
    };
  }

  if (lower.includes('rest') || lower.includes('sleep') || lower.includes('repair') || lower.includes('maintenance')) {
    return {
      intent: 'rest',
      feasible: true,
      timeCostMinutes: 60,
      exertion: 'none',
      targetIds: [],
      checks: [],
    };
  }

  if (lower.includes('chat') || lower.includes('radio') || lower.includes('tune')) {
    return {
      intent: 'talk',
      feasible: true,
      timeCostMinutes: 10,
      exertion: 'none',
      targetIds: [],
      checks: [],
    };
  }

  return {
    intent: 'other',
    feasible: true,
    timeCostMinutes: 20,
    exertion: 'light',
    targetIds: [],
    checks: [],
  };
}

// Road Milestones along Highway 404
const ROAD_MILESTONES = [
  {
    km: 0,
    name: 'Highway 404 (Kilometer Zero)',
    setting: 'A cracked stretch of asphalt between endless arid salt flats. Abandoned road signs creak in the dust.',
  },
  {
    km: 4,
    name: 'Kilometer 4 — Decaying Tollbooth Overpass',
    setting: 'A collapsed concrete toll plaza with rusted booths, tangled rebar, and overturned courier vans.',
  },
  {
    km: 11,
    name: 'Kilometer 11 — Rust River Wash & Deserted Diner',
    setting: 'A dry gravel river canyon spanned by an aging truss bridge. An abandoned roadside diner sits half-buried in sand.',
  },
  {
    km: 19,
    name: 'Kilometer 19 — Overturned Fuel Tanker & Junction',
    setting: 'A smoking chemical tanker spilled across two lanes. Yellow warning ribbons flutter near animal nests in the ditch.',
  },
  {
    km: 28,
    name: 'Kilometer 28 — Sunken Military Convoy & Barricade',
    setting: 'Three armored personnel carriers halted by anti-tank spikes. Spent shell casings glint in the tire ruts.',
  },
  {
    km: 36,
    name: 'Kilometer 36 — The Acid Fog Hollow',
    setting: 'A low-lying valley filled with yellow-green caustic mist. Electronic sensors pulse erratically.',
  },
  {
    km: 45,
    name: 'Kilometer 45 — Outpost 7 Service Station',
    setting: 'A fortified truck stop with bullet-pitted corrugated walls, automated fuel dispensers, and quiet solar arrays.',
  },
];

/**
 * Dynamic Procedural Scenario Generator for Offline & Fallback play
 */
export function getMockNarrateResponse(
  state: GameState,
  resolvedMessages: string[]
): NarrateResponse {
  const turnCount = state.history.length;
  const currentWeight = calculateInventoryWeight(state.inventory.items, state.inventory.chests);
  const isEncumbered = currentWeight > state.inventory.maxCarryWeight;
  const unopenedChest = state.inventory.chests.find((c) => !c.isOpened);
  const chestRarityUpper = unopenedChest ? unopenedChest.rarity.toUpperCase() : 'PURPLE';
  const chestId = unopenedChest ? unopenedChest.id : '';
  const lastAction = state.history[state.history.length - 1];

  // Turn 0: Opening Arrival Scene
  if (turnCount === 0) {
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

  // Calculate current road milestone based on turn count or travel actions
  const travelCount = state.history.filter((h) => h.actionText.toLowerCase().includes('travel') || h.actionText.toLowerCase().includes('drive') || h.actionText.toLowerCase().includes('accelerate')).length;
  const milestoneIndex = Math.min(ROAD_MILESTONES.length - 1, travelCount);
  const currentMilestone = ROAD_MILESTONES[milestoneIndex]!;

  const outcomesText = resolvedMessages.length > 0 ? resolvedMessages.join(' ') : 'You execute your action with disciplined precision.';

  // Scenario narrative generator
  let dynamicScene = '';
  let commentaryText = '';

  if (isEncumbered) {
    dynamicScene = `${outcomesText}
    
⚠️ Your pack is groaning under heavy salvage: you are carrying ${currentWeight} kg against a ${state.inventory.maxCarryWeight} kg threshold! Every step away from the van drains double energy, and agility is severely compromised. 

Surrounding terrain: ${currentMilestone.setting} High above, crows circle an abandoned transmission mast. You need to offload heavy fuel barrels and materials into the van's cargo bay before venturing further.`;

    commentaryText = `You're dragging over 200 kilos of scrap and fuel canisters by hand like a pack mule. Put the barrels in the van before you snap an ankle.`;
  } else if (lastAction?.actionText.toLowerCase().includes('scout') || lastAction?.actionText.toLowerCase().includes('search')) {
    dynamicScene = `${outcomesText}
    
Searching through the debris of ${currentMilestone.name}, you pry open a rusted utility container. Underneath broken glass you locate discarded mechanical wiring and a bundle of clean fuel filters. In the distance, the wind howls through the power lines.`;

    commentaryText = `Thorough scavenge. A pro gamer never leaves free resources on the map.`;
  } else if (lastAction?.actionText.toLowerCase().includes('travel') || lastAction?.actionText.toLowerCase().includes('drive')) {
    dynamicScene = `${outcomesText}
    
The Common Van rolls smoothly down the cracked asphalt, its tires crunching over scattered gravel. The odometer clicks forward: you have reached ${currentMilestone.name}. 

${currentMilestone.setting} A faint radio beacon flickers on your console dashboard.`;

    commentaryText = `Good pace. Covering ground during daylight hours is textbook survival economics.`;
  } else {
    dynamicScene = `${outcomesText}
    
You take stock of your surroundings at ${currentMilestone.name}. ${currentMilestone.setting} The sky remains heavy with amber dust, but the van's engine idles steadily, awaiting your command.`;

    commentaryText = `Calculated pause. Staying ahead of thirst and equipment degradation keeps you alive.`;
  }

  // Dynamic choices based on current dilemma
  const choices: any[] = [];

  // Choice 1: Handle encumbrance or explore
  if (isEncumbered) {
    choices.push({
      id: `c_${turnCount}_1`,
      text: 'Transfer heavy fuel canisters and bulk resources into the van storage',
      risk: 'low',
      hint: 'Stashes bulk supplies in vehicle storage, reducing personal carry weight below 40 kg.',
      action: { type: 'freeform', params: { intent: 'craft', stash: true } },
    });
  } else {
    choices.push({
      id: `c_${turnCount}_1`,
      text: `Scout the salvage containers around ${currentMilestone.name.split('—')[1] || 'the area'}`,
      risk: 'medium',
      hint: 'High chance to discover blueprints, vehicle parts, or crafting salvage.',
      action: { type: 'freeform', params: { intent: 'search' } },
    });
  }

  // Choice 2: Vehicle action (Refuel, upgrade or drive)
  if (state.vehicle.fuel < 80 && state.inventory.items.some((i) => i.name.includes('Fuel'))) {
    choices.push({
      id: `c_${turnCount}_2`,
      text: 'Refuel the Common Van using 1x Bio-Refined Fuel Canister',
      risk: 'low',
      hint: 'Restores 40 units of vehicle fuel and consumes one fuel canister.',
      action: { type: 'freeform', params: { intent: 'use_item', refuel: true } },
    });
  } else {
    choices.push({
      id: `c_${turnCount}_2`,
      text: 'Accelerate down Highway 404 towards the next road milestone',
      risk: 'low',
      hint: 'Spends fuel and advances your distance along the wasteland highway.',
      action: { type: 'travel' },
    });
  }

  // Choice 3: SSS Talent usage if charges available
  if (unopenedChest && state.player.talent.charges > 0) {
    choices.push({
      id: `c_${turnCount}_3`,
      text: `Upgrade the [${chestRarityUpper}] Chest with SSS Talent (${state.player.talent.charges}/6 charges left)`,
      risk: 'low',
      hint: 'Push the chest rarity higher before opening.',
      action: { type: 'upgrade', targetId: chestId },
    });
  } else if (state.player.talent.charges > 0) {
    const upgradableItem = state.inventory.items.find((it) => !it.isUpgraded && it.rarity !== 'mythical');
    choices.push({
      id: `c_${turnCount}_3`,
      text: upgradableItem
        ? `Use SSS Talent to Upgrade "${upgradableItem.name}" (${state.player.talent.charges}/6 left)`
        : 'Scan surroundings with Perception for upgradeable artifacts',
      risk: 'low',
      hint: 'Use talent charges before midnight reset.',
      action: upgradableItem
        ? { type: 'upgrade', targetId: upgradableItem.id }
        : { type: 'freeform', params: { intent: 'explore' } },
    });
  } else {
    choices.push({
      id: `c_${turnCount}_3`,
      text: 'Perform field maintenance on the van tires and fuel injectors',
      risk: 'low',
      hint: 'Reduces vehicle wear and inspects component integrity.',
      action: { type: 'rest' },
    });
  }

  // Choice 4: Chest open or radio
  if (unopenedChest) {
    choices.push({
      id: `c_${turnCount}_4`,
      text: `Crack open the [${chestRarityUpper}] Treasure Chest`,
      risk: 'low',
      hint: 'Claim the loot inside the chest.',
      action: { type: 'open_chest', targetId: chestId },
    });
  } else {
    choices.push({
      id: `c_${turnCount}_4`,
      text: 'Tune the CB radio and broadcast trade inquiry on World Chat',
      risk: 'low',
      hint: 'Check recent transmissions from other players in this sector.',
      action: { type: 'chat' },
    });
  }

  // Choice 5: Tactical defense / rest
  choices.push({
    id: `c_${turnCount}_5`,
    text: 'Rest inside the van cabin, drink purified water, and check perimeter traps',
    risk: 'low',
    hint: 'Restores Energy and stabilizes Thirst/Hunger meters.',
    action: { type: 'rest' },
  });

  // Choice 6: Tactical weapon / stealth scan
  choices.push({
    id: `c_${turnCount}_6`,
    text: 'Load the Recurve Crossbow and scout the horizon with binoculars',
    risk: 'medium',
    hint: 'Leverages Perception (15) to detect hidden threats or supply caches early.',
    action: { type: 'freeform', params: { intent: 'explore' } },
  });

  return {
    narrative: dynamicScene,
    commentary: commentaryText,
    choices: choices.slice(0, 6) as any,
    worldNews: turnCount % 3 === 0 ? `📢 ROAD TELEMETRY: Radiation scan at ${currentMilestone.name} normal. Novice field intact.` : null,
    worldChat: [
      {
        username: 'ViperX',
        message: `Passed kilometer ${milestoneIndex * 8}. Watch the drainage ditches, something big is moving in the silt.`,
        type: 'rumor',
      },
      {
        username: 'IronClad_99',
        message: 'Anyone got clean water filters? Trading 10x bolts for water.',
        type: 'trade',
      },
    ],
    npcDialogue: [],
    suggestedEvents: [],
    ambiance: 'desert_wind',
  };
}
