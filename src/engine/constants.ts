import { Rarity, UpgradePathKey, VehicleComponentKey, VehicleEvolutionStage } from './types';

// Rarity ordering and tier mapping (Common=0 to Mythical=8)
export const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'silver',
  'gold',
  'orange',
  'purple',
  'black',
  'red',
  'mythical',
];

export const RARITY_DISPLAY: Record<Rarity, { name: string; emoji: string; color: string }> = {
  common: { name: 'Common', emoji: '⚪', color: '#9d9d9d' },
  uncommon: { name: 'Uncommon', emoji: '🟢', color: '#1eff00' },
  silver: { name: 'Silver', emoji: '🔘', color: '#c0c0c0' },
  gold: { name: 'Gold', emoji: '🟡', color: '#ffd700' },
  orange: { name: 'Orange', emoji: '🟠', color: '#ff8c00' },
  purple: { name: 'Purple', emoji: '🟣', color: '#a335ee' },
  black: { name: 'Black', emoji: '⚫', color: '#686894' },
  red: { name: 'Red', emoji: '🔴', color: '#ff2a2a' },
  mythical: { name: 'Mythical', emoji: '🌈', color: '#ff4fd8' },
};

// Qing Zhou Starting Stats (Survival Guide §2)
export const STARTING_PLAYER_STATS = {
  strength: 10,
  agility: 10,
  endurance: 10,
  intelligence: 14,
  perception: 15,
  charm: 10,
  hiddenLuck: 80, // Out of 100
};

// Starting Survival Meters
export const STARTING_SURVIVAL_METERS = {
  health: 100,
  maxHealth: 100,
  energy: 100,
  hunger: 100,
  thirst: 100,
  fatigue: 0,
  sanity: 100,
  temperature: 37.0, // Celsius
};

// Talent Odds (Survival Guide §5.1, Clarification C1)
export const TALENT_CASCADE_ODDS = {
  primary: 1.0, // 100% -> +1 tier
  secondary: 0.5, // 50% -> +1 tier
  tertiary: 0.15, // 15% -> +1 tier
  gacha: 0.0005, // 0.05% -> straight to Mythical
};

// Talent Special Charge (Clarification C3)
export const TALENT_SPECIAL = {
  tierJump: 3,
  cooldownHours: 72,
  cooldownMinutes: 72 * 60,
};

// Starter Chest Weights (Clarification C11)
// Player: Purple 55%, Black 35%, Red 10%
export const STARTER_CHEST_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'purple', weight: 55 },
  { rarity: 'black', weight: 35 },
  { rarity: 'red', weight: 10 },
];

// NPC Starter Chest Weights (for simulated world chat flavor)
export const NPC_STARTER_CHEST_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'uncommon', weight: 50 },
  { rarity: 'silver', weight: 35 },
  { rarity: 'gold', weight: 15 },
];

// Chest Loot Bundle Sizes (Survival Guide §6, Clarification C12)
export const BUNDLE_SIZES: Record<Rarity, number> = {
  common: 3,
  uncommon: 5,
  silver: 10,
  gold: 20,
  orange: 50,
  purple: 100,
  black: 200,
  red: 500,
  mythical: 1000,
};

// Vehicle Evolution Milestones (Clarification C9)
export const VEHICLE_EVOLUTIONS: { stage: VehicleEvolutionStage; minLevel: number; name: string }[] = [
  { stage: 'common_van', minLevel: 1, name: 'Common Van' },
  { stage: 'explorer_van', minLevel: 5, name: 'Explorer Van' },
  { stage: 'armored_survival_van', minLevel: 10, name: 'Armored Survival Van' },
  { stage: 'mobile_fortress', minLevel: 20, name: 'Mobile Fortress' },
  { stage: 'land_cruiser', minLevel: 30, name: 'Land Cruiser' },
  { stage: 'hover_fortress', minLevel: 45, name: 'Hover Fortress' },
  { stage: 'legendary_mobile_citadel', minLevel: 60, name: 'Legendary Mobile Citadel' },
  { stage: 'mythical_world_fortress', minLevel: 80, name: 'Mythical World Fortress' },
];

// 12 Vehicle Components List
export const VEHICLE_COMPONENTS_LIST: VehicleComponentKey[] = [
  'engine',
  'transmission',
  'tires',
  'windows',
  'chassis',
  'armor',
  'storage',
  'suspension',
  'fuelSystem',
  'powerSource',
  'lighting',
  'sensors',
];

// 15 Upgrade Paths List (12 active max, 3 locked)
export const UPGRADE_PATHS_LIST: { key: UpgradePathKey; name: string; backingComponent?: VehicleComponentKey }[] = [
  { key: 'tires', name: 'Tires', backingComponent: 'tires' },
  { key: 'windows', name: 'Windows', backingComponent: 'windows' },
  { key: 'chassis', name: 'Chassis', backingComponent: 'chassis' },
  { key: 'armor', name: 'Armor', backingComponent: 'armor' },
  { key: 'storage_space', name: 'Storage Space', backingComponent: 'storage' },
  { key: 'living_space', name: 'Living Space' },
  { key: 'kitchen', name: 'Kitchen' },
  { key: 'music_entertainment', name: 'Music & Entertainment' },
  { key: 'headlights', name: 'Headlights', backingComponent: 'lighting' },
  { key: 'weapons', name: 'Weapons' },
  { key: 'radar_sensors', name: 'Radar / Sensors', backingComponent: 'sensors' },
  { key: 'engine', name: 'Engine', backingComponent: 'engine' },
  { key: 'lighting', name: 'Lighting', backingComponent: 'lighting' },
  { key: 'ac', name: 'AC' },
  { key: 'water', name: 'Water' },
];

// Time Cost Bands per Intent (Clarification C14, in minutes)
export const INTENT_TIME_BANDS: Record<string, { min: number; max: number; default: number }> = {
  travel: { min: 30, max: 240, default: 60 },
  explore: { min: 20, max: 120, default: 45 },
  search: { min: 10, max: 60, default: 20 },
  craft: { min: 15, max: 180, default: 30 },
  talk: { min: 5, max: 30, default: 10 },
  combat: { min: 5, max: 30, default: 10 },
  rest: { min: 30, max: 180, default: 60 },
  sleep: { min: 360, max: 480, default: 420 }, // 6-8 hours
  use_item: { min: 1, max: 10, default: 5 },
  trade: { min: 10, max: 60, default: 20 },
  upgrade: { min: 5, max: 15, default: 5 },
  open_chest: { min: 2, max: 10, default: 3 },
  other: { min: 5, max: 60, default: 15 },
};

// Luck Descriptors (Clarification C10)
export function getLuckDescriptor(luckValue: number): string {
  if (luckValue >= 95) return 'Miracles orbit your every step';
  if (luckValue >= 85) return 'The universe bends in your favour';
  if (luckValue >= 75) return 'Fortune smiles favourably upon you';
  if (luckValue >= 60) return 'The winds of chance are gentle';
  if (luckValue >= 45) return 'Fates are indifferent';
  if (luckValue >= 30) return 'A faint shadow clings to your steps';
  return 'The stars gaze down with cold malice';
}

// Carry weight calculation: 20 + 2 * Strength kg (Clarification C13)
export function calculateMaxCarryWeight(strength: number): number {
  return 20 + 2 * strength;
}
