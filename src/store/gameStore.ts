import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { GameState } from '../engine/types';
import { STARTING_PLAYER_STATS, STARTING_SURVIVAL_METERS } from '../engine/constants';
import { createInitialClock } from '../engine/clock';
import { createInitialVehicle } from '../engine/vehicle';
import { rollStarterChest } from '../engine/loot';
import { getStarterInventoryItems } from '../engine/data/items';
import { getMockNarrateResponse } from '../ai/mock';

// IndexedDB storage adapter using idb-keyval
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export function createNewGameInitialState(): GameState {
  const starterChest = rollStarterChest();
  const starterItems = getStarterInventoryItems();
  const initialVehicle = createInitialVehicle();
  const clock = createInitialClock();

  const state: GameState = {
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
      traits: [
        'strategist',
        'calm_under_pressure',
        'fast_learner',
        'highly_observant',
        'physically_average',
      ],
      talent: {
        name: 'Upgrade',
        tier: 'mythical',
        charges: 6,
        maxCharges: 6,
        lastRechargeDay: 1,
        specialAvailable: true,
        specialCooldownUntilMinute: 0,
      },
      titles: ['Road Novice'],
      achievements: [],
      effects: [],
      firstTimeIntents: [],
    },
    vehicle: initialVehicle,
    inventory: {
      items: starterItems,
      chests: [starterChest],
      currency: 50, // Starting Survival Credits
      maxCarryWeight: 40,
    },
    clock,
    environment: {
      weather: 'clear',
      temperature: 22,
      visibility: 'good',
      locationName: 'Highway 404 (Kilometer Zero)',
      dangerLevel: 1,
    },
    quests: [
      {
        id: 'quest_novice_prep',
        title: 'Survive the Novice Week',
        objective: 'Prepare the van and gather survival supplies before Day 7 arrives.',
        rewardTier: 'gold',
        risks: 'Dehydration, starvation, road hazards.',
        status: 'active',
        discoveredDay: 1,
      },
    ],
    npcs: {},
    rumors: [],
    chatRoster: [
      { username: 'IronClad_99', persona: 'Cautious van lifer', reputation: 50 },
      { username: 'ViperX', persona: 'Opportunist trader', reputation: 40 },
      { username: 'GhostRider', persona: 'Veteran wasteland scout', reputation: 80 },
    ],
    chatHistory: [],
    worldNews: ['📢 Novice Period started at 06:00 Day 1. Global monster waves offline for 7 days.'],
    rollHistory: [],
    history: [],
    importantDecisions: [],
    flags: {
      novicePeriod: true,
      isDead: false,
      lastChanceAvailable: false,
      chatVisible: true,
      currentScenario: '',
      currentCommentary: null,
      currentChoices: [],
    },
    rngState: 1337,
  };

  const initialNarrative = getMockNarrateResponse(state, []);
  state.flags.currentScenario = initialNarrative.narrative;
  state.flags.currentCommentary = initialNarrative.commentary || null;
  state.flags.currentChoices = initialNarrative.choices;

  return state;
}

export type GameTheme = 'wasteland' | 'terminal' | 'graphite' | 'classic';

interface GameStoreState {
  gameState: GameState;
  theme: GameTheme;
  isStreaming: boolean;
  streamedText: string;
  isProcessingTurn: boolean;
  errorMessage: string | null;

  // Actions
  setGameState: (state: GameState) => void;
  setTheme: (theme: GameTheme) => void;
  resetNewGame: () => void;
  setStreamingText: (text: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setIsProcessingTurn: (processing: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set) => ({
      gameState: createNewGameInitialState(),
      theme: 'wasteland',
      isStreaming: false,
      streamedText: '',
      isProcessingTurn: false,
      errorMessage: null,

      setGameState: (newState) => set({ gameState: newState }),
      setTheme: (theme) => set({ theme }),
      resetNewGame: () => set({ gameState: createNewGameInitialState(), streamedText: '' }),
      setStreamingText: (text) => set({ streamedText: text }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setIsProcessingTurn: (isProcessingTurn) => set({ isProcessingTurn }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
    }),
    {
      name: 'road_survival_game_state_v1',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ gameState: state.gameState, theme: state.theme }),
    }
  )
);
