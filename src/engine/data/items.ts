import { Item, ItemCategory, Rarity } from '../types';

export interface ItemTemplate {
  templateId: string;
  name: string;
  category: ItemCategory;
  baseWeight: number; // in kg
  isBundle?: boolean;
  baseDescription: string;
}

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
  // Consumables / Bundles
  purified_water: {
    templateId: 'purified_water',
    name: 'Purified Water',
    category: 'consumable',
    baseWeight: 0.5,
    isBundle: true,
    baseDescription: 'Clean drinking water essential for survival on the road.',
  },
  emergency_rations: {
    templateId: 'emergency_rations',
    name: 'Survival Rations',
    category: 'consumable',
    baseWeight: 0.3,
    isBundle: true,
    baseDescription: 'Nutrient-dense preserved food that stave off hunger.',
  },
  fuel_canister: {
    templateId: 'fuel_canister',
    name: 'Bio-Refined Fuel Canister',
    category: 'resource',
    baseWeight: 2.0,
    isBundle: true,
    baseDescription: 'Standard liquid fuel required to keep the van moving forward.',
  },
  first_aid_kit: {
    templateId: 'first_aid_kit',
    name: 'Emergency Medical Kit',
    category: 'consumable',
    baseWeight: 1.0,
    baseDescription: 'Sterile bandages and coagulants to treat lacerations and trauma.',
  },

  // Weapons
  tactical_machete: {
    templateId: 'tactical_machete',
    name: 'Carbon-Steel Machete',
    category: 'weapon',
    baseWeight: 1.5,
    baseDescription: 'A balanced blade suitable for both wilderness clearing and defense.',
  },
  hunting_crossbow: {
    templateId: 'hunting_crossbow',
    name: 'Recurve Crossbow',
    category: 'weapon',
    baseWeight: 3.0,
    baseDescription: 'Silent ranged weapon capable of piercing light hide.',
  },
  steel_bolts: {
    templateId: 'steel_bolts',
    name: 'Quiver of Bolts',
    category: 'resource',
    baseWeight: 0.1,
    isBundle: true,
    baseDescription: 'Ammunition crafted for hunting crossbows.',
  },

  // Equipment & Tools
  reinforced_jacket: {
    templateId: 'reinforced_jacket',
    name: 'Insulated Survival Jacket',
    category: 'armor',
    baseWeight: 2.5,
    baseDescription: 'Weather-resistant outerwear offering light impact resistance.',
  },
  multitool: {
    templateId: 'multitool',
    name: 'Precision Multitool',
    category: 'equipment',
    baseWeight: 0.4,
    baseDescription: 'Compact pliers, wire cutters, and screwdrivers for quick fixes.',
  },

  // Resources
  scrap_metal: {
    templateId: 'scrap_metal',
    name: 'Reinforced Metal Scrap',
    category: 'resource',
    baseWeight: 1.0,
    isBundle: true,
    baseDescription: 'Durable metal salvage useful for vehicle repairs and upgrades.',
  },
  electronic_components: {
    templateId: 'electronic_components',
    name: 'Circuit Components',
    category: 'resource',
    baseWeight: 0.2,
    isBundle: true,
    baseDescription: 'Salvaged microchips and wiring for radar, sensors, and lighting.',
  },

  // Blueprints
  bp_fuel_converter: {
    templateId: 'bp_fuel_converter',
    name: 'Blueprint: Fuel Converter',
    category: 'blueprint',
    baseWeight: 0.1,
    baseDescription: 'Schematics to convert basic fuel into high-efficiency propellant.',
  },
};

/**
 * Creates an instance of an item from a template with a specific rarity
 */
export function createItemFromTemplate(
  templateId: string,
  rarity: Rarity,
  quantity: number = 1
): Item {
  const template = ITEM_TEMPLATES[templateId] ?? {
    templateId,
    name: templateId.replace(/_/g, ' '),
    category: 'other' as ItemCategory,
    baseWeight: 1.0,
    baseDescription: 'An uncharted survival item found along the road.',
  };

  const id = `item_${templateId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    name: template.name,
    category: template.category,
    rarity,
    quantity,
    weight: Math.round(template.baseWeight * quantity * 10) / 10,
    isUpgraded: false,
    description: template.baseDescription,
    isBundle: template.isBundle,
  };
}

/**
 * Starter items given to Qing Zhou on Day 1 (Survival Guide §3)
 */
export function getStarterInventoryItems(): Item[] {
  return [
    createItemFromTemplate('purified_water', 'common', 3),
    createItemFromTemplate('emergency_rations', 'common', 3),
    createItemFromTemplate('fuel_canister', 'common', 2),
    createItemFromTemplate('tactical_machete', 'common', 1),
    createItemFromTemplate('multitool', 'common', 1),
  ];
}
