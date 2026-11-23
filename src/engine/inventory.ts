import { Item, TalentCascadeResult, TreasureChest } from './types';

export interface InventoryState {
  items: Item[];
  chests: TreasureChest[];
  currency: number;
  maxCarryWeight: number;
}

/**
 * Calculates current total weight of all inventory items and unopened chests in kg
 */
export function calculateInventoryWeight(items: Item[], chests: TreasureChest[]): number {
  const itemsWeight = items.reduce((acc, item) => acc + (item.weight || 0), 0);
  // Unopened chests carry weight depending on tier (approx 5-15kg)
  const chestsWeight = chests.filter((c) => !c.isOpened).length * 8.0;
  return Math.round((itemsWeight + chestsWeight) * 10) / 10;
}

/**
 * Checks if a specific item is eligible for talent upgrade (Guide §5.2, Clarification C6).
 *
 * Rules:
 * - Can upgrade: Weapons, Armor, Treasure Chests, Blueprints, Vehicle Parts, Consumables, Equipment, Resources.
 * - Cannot be used on the same item more than once (isUpgraded flag).
 * - Mythical items cannot be upgraded (tier cap).
 */
export function isItemEligibleForUpgrade(item: Item): boolean {
  if (item.isUpgraded) return false;
  if (item.rarity === 'mythical') return false;

  const validCategories = [
    'weapon',
    'armor',
    'vehicle_part',
    'consumable',
    'resource',
    'blueprint',
    'equipment',
  ];
  return validCategories.includes(item.category);
}

/**
 * Checks if a treasure chest is eligible for talent upgrade
 */
export function isChestEligibleForUpgrade(chest: TreasureChest): boolean {
  return !chest.isOpened && !chest.isUpgraded && chest.rarity !== 'mythical';
}

/**
 * Adds items to inventory, stacking bundles with identical name and rarity if not upgraded
 */
export function addItemToInventory(items: Item[], newItem: Item): Item[] {
  const result = [...items];

  // If stackable bundle, non-upgraded, same name and rarity
  if (newItem.isBundle && !newItem.isUpgraded) {
    const existingIndex = result.findIndex(
      (it) => it.name === newItem.name && it.rarity === newItem.rarity && !it.isUpgraded
    );

    if (existingIndex !== -1) {
      const existing = result[existingIndex]!;
      const totalQty = existing.quantity + newItem.quantity;
      const unitWeight = existing.weight / existing.quantity;
      result[existingIndex] = {
        ...existing,
        quantity: totalQty,
        weight: Math.round(unitWeight * totalQty * 10) / 10,
      };
      return result;
    }
  }

  result.push(newItem);
  return result;
}

/**
 * Removes items from inventory by ID and quantity
 */
export function removeItemFromInventory(
  items: Item[],
  itemId: string,
  quantityToRemove: number = 1
): Item[] {
  const index = items.findIndex((it) => it.id === itemId);
  if (index === -1) return items;

  const item = items[index]!;
  if (item.quantity <= quantityToRemove) {
    return items.filter((it) => it.id !== itemId);
  }

  const result = [...items];
  const unitWeight = item.weight / item.quantity;
  const newQty = item.quantity - quantityToRemove;
  result[index] = {
    ...item,
    quantity: newQty,
    weight: Math.round(unitWeight * newQty * 10) / 10,
  };
  return result;
}

/**
 * Applies a talent cascade upgrade to an item
 */
export function applyTalentUpgradeToItem(item: Item, cascade: TalentCascadeResult): Item {
  return {
    ...item,
    rarity: cascade.finalRarity,
    isUpgraded: true,
    // Add bonus effect or tag to description
    description: `${item.description} [Upgraded to ${cascade.finalRarity.toUpperCase()} via Talent ✔]`,
  };
}

/**
 * Applies a talent cascade upgrade to a treasure chest
 */
export function applyTalentUpgradeToChest(
  chest: TreasureChest,
  cascade: TalentCascadeResult
): TreasureChest {
  const newName = `${cascade.finalRarity.charAt(0).toUpperCase() + cascade.finalRarity.slice(1)} Treasure Chest (Upgraded ✔)`;
  return {
    ...chest,
    name: newName,
    rarity: cascade.finalRarity,
    isUpgraded: true,
  };
}
