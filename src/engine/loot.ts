import { Item, Rarity, TreasureChest } from './types';
import { BUNDLE_SIZES, RARITY_ORDER, STARTER_CHEST_WEIGHTS } from './constants';
import { SeededRNG, engineRNG } from './dice';
import { createItemFromTemplate, ITEM_TEMPLATES } from './data/items';

/**
 * Rolls the player's initial starter chest on Day 1 (Survival Guide §3, Clarification C11)
 * Heavily weighted towards Purple (55%), Black (35%), Red (10%).
 */
export function rollStarterChest(rng: SeededRNG = engineRNG): TreasureChest {
  const roll = rng.range(0, 100);
  let cumulative = 0;
  let selectedRarity: Rarity = 'purple';

  for (const entry of STARTER_CHEST_WEIGHTS) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      selectedRarity = entry.rarity;
      break;
    }
  }

  const chestName = `${selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1)} Starter Treasure Chest`;

  return {
    id: `chest_starter_${Date.now()}`,
    name: chestName,
    rarity: selectedRarity,
    isUpgraded: false,
    isOpened: false,
    discoveredDay: 1,
  };
}

export interface ChestOpenResult {
  chest: TreasureChest;
  lootItems: Item[];
  summary: string;
}

/**
 * Opens a Treasure Chest based on its current rarity at opening (Survival Guide §6, Clarification C12).
 *
 * Rules:
 * - Content count = tierIndex + 1 + d(0-1), min 2.
 * - Guaranteed at least 1 item at the chest's current tier.
 * - 2nd at-tier item chance = 2% * (1 + luck / 50).
 * - Remaining slots roll from lower tiers.
 * - Stackable materials (water, food, ammo, fuel, scrap) bundle according to BUNDLE_SIZES[tier].
 */
export function openTreasureChest(
  chest: TreasureChest,
  hiddenLuck: number,
  rng: SeededRNG = engineRNG
): ChestOpenResult {
  if (chest.isOpened) {
    throw new Error('This treasure chest has already been opened!');
  }

  const chestTierIndex = RARITY_ORDER.indexOf(chest.rarity);
  const totalItemCount = Math.max(2, chestTierIndex + 1 + rng.integer(0, 1));
  const templateKeys = Object.keys(ITEM_TEMPLATES);

  const lootItems: Item[] = [];

  // 1. Guaranteed 1 item at the chest's tier
  const firstTemplateKey = templateKeys[rng.integer(0, templateKeys.length - 1)]!;
  const firstTemplate = ITEM_TEMPLATES[firstTemplateKey]!;
  const firstQty = firstTemplate.isBundle ? BUNDLE_SIZES[chest.rarity] : 1;
  lootItems.push(createItemFromTemplate(firstTemplateKey, chest.rarity, firstQty));

  // 2. Chance of second item at the chest's tier: 2% * (1 + luck / 50)
  const secondAtTierChance = 0.02 * (1 + hiddenLuck / 50);
  if (lootItems.length < totalItemCount && rng.check(secondAtTierChance)) {
    const secondTemplateKey = templateKeys[rng.integer(0, templateKeys.length - 1)]!;
    const secondTemplate = ITEM_TEMPLATES[secondTemplateKey]!;
    const secondQty = secondTemplate.isBundle ? BUNDLE_SIZES[chest.rarity] : 1;
    lootItems.push(createItemFromTemplate(secondTemplateKey, chest.rarity, secondQty));
  }

  // 3. Fill remaining slots with lower-tier items (weighted towards closer tiers)
  while (lootItems.length < totalItemCount) {
    let itemTierIndex = 0;
    if (chestTierIndex > 0) {
      // Pick a lower tier index: closer to chestTierIndex is more likely
      const roll = rng.next();
      if (roll < 0.5) {
        itemTierIndex = Math.max(0, chestTierIndex - 1);
      } else if (roll < 0.8) {
        itemTierIndex = Math.max(0, chestTierIndex - 2);
      } else {
        itemTierIndex = rng.integer(0, Math.max(0, chestTierIndex - 1));
      }
    }
    const itemRarity = RARITY_ORDER[itemTierIndex]!;
    const templateKey = templateKeys[rng.integer(0, templateKeys.length - 1)]!;
    const template = ITEM_TEMPLATES[templateKey]!;
    const qty = template.isBundle ? BUNDLE_SIZES[itemRarity] : 1;

    lootItems.push(createItemFromTemplate(templateKey, itemRarity, qty));
  }

  const updatedChest: TreasureChest = {
    ...chest,
    isOpened: true,
  };

  const itemNames = lootItems.map((item) => `${item.name} (${item.rarity.toUpperCase()} x${item.quantity})`).join(', ');
  const summary = `Opened ${chest.name}: Discovered [${itemNames}].`;

  return {
    chest: updatedChest,
    lootItems,
    summary,
  };
}
