// Rarity tiers: 9 levels from Common to Mythical
export type Rarity =
  | 'common'
  | 'uncommon'
  | 'silver'
  | 'gold'
  | 'orange'
  | 'purple'
  | 'black'
  | 'red'
  | 'mythical';

export type StatKey =
  | 'strength'
  | 'agility'
  | 'endurance'
  | 'intelligence'
  | 'perception'
  | 'charm';

export interface PlayerStats {
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
  perception: number;
  charm: number;
  hiddenLuck: number; // 0-100, baseline 80, never shown as a raw number to the player
}

export interface SurvivalMeters {
  health: number; // 0-100, lethal at 0
  maxHealth: number;
  energy: number; // 0-100, spent by actions, restored by rest
  hunger: number; // 0-100, 100 is full, 0 is starving
  thirst: number; // 0-100, 100 is hydrated, 0 is dehydrated (drops faster than hunger)
  fatigue: number; // 0-100, accumulates over activity, impairs agility/per/int
  sanity: number; // 0-100, reduced by horror/bad events, <30 causes hallucinations
  temperature: number; // in Celsius, 36.5 - 37.5 is normal
}

export type PlayerTrait =
  | 'strategist'
  | 'calm_under_pressure'
  | 'fast_learner'
  | 'highly_observant'
  | 'physically_average';

export interface ActiveEffect {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff';
  statModifiers?: Partial<Record<StatKey, number>>;
  durationMinutes: number; // Remaining duration
}

export interface TalentState {
  name: string;
  tier: Rarity; // 'mythical'
  charges: number; // Current charges (0-6)
  maxCharges: number; // 6
  lastRechargeDay: number;
  specialAvailable: boolean; // 72-hour guaranteed +3 tiers jump
  specialCooldownUntilMinute: number; // Game time in total minutes when available
}

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'vehicle_part'
  | 'consumable'
  | 'resource'
  | 'blueprint'
  | 'chest'
  | 'equipment'
  | 'quest_item'
  | 'other';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  quantity: number;
  weight: number; // Total weight in kg
  isUpgraded: boolean; // Once upgraded, cannot be upgraded again
  description: string;
  isBundle?: boolean; // Bundles of items (water, ammo, arrows)
  stats?: Record<string, number | string>;
  blueprintId?: string; // If it unlocks crafting
  equipped?: boolean;
}

export interface TreasureChest {
  id: string;
  name: string;
  rarity: Rarity;
  isUpgraded: boolean;
  isOpened: boolean;
  guardianTier?: Rarity;
  discoveredDay: number;
}

// 12 Vehicle Components
export type VehicleComponentKey =
  | 'engine'
  | 'transmission'
  | 'tires'
  | 'windows'
  | 'chassis'
  | 'armor'
  | 'storage'
  | 'suspension'
  | 'fuelSystem'
  | 'powerSource'
  | 'lighting'
  | 'sensors';

export interface VehicleComponent {
  key: VehicleComponentKey;
  name: string;
  rarity: Rarity;
  durability: number; // 0-100
  isUpgraded: boolean;
}

// 15 Upgrade Paths (12 selectable, 3 locked)
export type UpgradePathKey =
  | 'tires'
  | 'windows'
  | 'chassis'
  | 'armor'
  | 'storage_space'
  | 'living_space'
  | 'kitchen'
  | 'music_entertainment'
  | 'headlights'
  | 'weapons'
  | 'radar_sensors'
  | 'engine'
  | 'lighting'
  | 'ac'
  | 'water';

export interface UpgradePathState {
  key: UpgradePathKey;
  name: string;
  activated: boolean;
  locked: boolean;
  level: number;
  selectedBranch?: string;
  offSlotLevel: number; // Levels gained via blueprints without spending slot points
}

export type VehicleEvolutionStage =
  | 'common_van'
  | 'explorer_van'
  | 'armored_survival_van'
  | 'mobile_fortress'
  | 'land_cruiser'
  | 'hover_fortress'
  | 'legendary_mobile_citadel'
  | 'mythical_world_fortress';

export interface VehicleState {
  name: string;
  stage: VehicleEvolutionStage;
  durability: number; // 0-100
  fuel: number; // Current fuel
  maxFuel: number; // Max fuel capacity
  fuelConsumptionRate: number; // Fuel per km/action
  wear: number; // 0-100 wear percentage
  components: Record<VehicleComponentKey, VehicleComponent>;
  upgradePaths: Record<UpgradePathKey, UpgradePathState>;
  activePathsCount: number; // Max 12
  lockedPathsCount: number; // 3
}

export interface GameClock {
  day: number; // Starts at 1
  minute: number; // 0 to 1439 (starts at 360 = 06:00 AM)
  totalElapsedMinutes: number;
}

export type WeatherType =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'heavy_storm'
  | 'sandstorm'
  | 'acid_rain'
  | 'fog'
  | 'scorching_heat'
  | 'freezing_blizzard';

export interface EnvironmentState {
  weather: WeatherType;
  temperature: number; // Outside temp in Celsius
  visibility: 'poor' | 'fair' | 'good' | 'excellent';
  locationName: string;
  dangerLevel: number; // 1 to 10
}

export interface RollStageResult {
  stage: 'primary' | 'secondary' | 'tertiary' | 'gacha';
  chance: number; // percentage, e.g. 100, 50, 15, 0.05
  rolled: number; // number rolled (0-100)
  success: boolean;
}

export interface TalentCascadeResult {
  initialRarity: Rarity;
  finalRarity: Rarity;
  tierJump: number;
  stages: RollStageResult[];
  isSpecialUpgrade: boolean;
  targetItemId: string;
  targetItemName: string;
}

export interface RollRecord {
  id: string;
  timestampMinute: number;
  type: 'talent_cascade' | 'talent_special' | 'stat_check' | 'loot' | 'combat' | 'event';
  description: string;
  details: string;
  outcome: 'success' | 'failure' | 'partial' | 'crit';
}

export interface Quest {
  id: string;
  title: string;
  objective: string;
  rewardTier: Rarity;
  risks: string;
  deadlineMinutes?: number;
  status: 'active' | 'completed' | 'failed';
  discoveredDay: number;
}

export interface NpcRelationship {
  id: string;
  name: string;
  personality: string;
  goals: string;
  secrets: string[];
  knownSecrets: string[];
  trust: number; // 0-100
  respect: number; // 0-100
  affection: number; // 0-100
  combatTier: Rarity;
}

export interface WorldChatMessage {
  id: string;
  username: string;
  message: string;
  type: 'panic' | 'brag' | 'trade' | 'scam' | 'rumor' | 'joke' | 'death';
  day: number;
  timeString: string;
}

export interface Rumor {
  id: string;
  text: string;
  truth: 'true' | 'false' | 'half'; // GM-only truth
  discoveredDay: number;
}

export interface ChoiceAction {
  type:
    | 'freeform'
    | 'upgrade'
    | 'special_upgrade'
    | 'open_chest'
    | 'travel'
    | 'rest'
    | 'combat_option'
    | 'chat';
  targetId?: string;
  params?: Record<string, any>;
}

export interface GameChoice {
  id: string;
  text: string;
  risk: 'low' | 'medium' | 'high' | 'extreme';
  hint: string;
  action: ChoiceAction;
}

export interface TurnHistoryEntry {
  turnNumber: number;
  day: number;
  timeString: string;
  actionText: string;
  outcomeSummary: string;
  narrative: string;
  commentary?: string | null;
}

export interface GameState {
  version: string;
  player: {
    name: string;
    gender: 'male';
    orientation: 'straight';
    past: 'professional_gamer';
    level: number;
    experience: number;
    nextLevelExperience: number;
    upgradePoints: number;
    stats: PlayerStats;
    meters: SurvivalMeters;
    traits: PlayerTrait[];
    talent: TalentState;
    titles: string[];
    achievements: string[];
    effects: ActiveEffect[];
    firstTimeIntents: string[]; // For fast-learner bonus
  };
  vehicle: VehicleState;
  inventory: {
    items: Item[];
    chests: TreasureChest[];
    currency: number; // Survival Credits
    maxCarryWeight: number;
  };
  clock: GameClock;
  environment: EnvironmentState;
  quests: Quest[];
  npcs: Record<string, NpcRelationship>;
  rumors: Rumor[];
  chatRoster: { username: string; persona: string; reputation: number }[];
  chatHistory: WorldChatMessage[];
  worldNews: string[];
  rollHistory: RollRecord[];
  history: TurnHistoryEntry[];
  importantDecisions: string[];
  flags: {
    novicePeriod: boolean; // Days 1-7
    isDead: boolean;
    lastChanceAvailable: boolean;
    chatVisible: boolean; // Visible only on announcements or explicit chat actions
    currentScenario: string;
    currentCommentary: string | null;
    currentChoices: GameChoice[];
  };
  rngState: number; // For repeatable PRNG
}
