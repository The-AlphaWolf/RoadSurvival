import { z } from 'zod';

export const StatKeySchema = z.enum([
  'strength',
  'agility',
  'endurance',
  'intelligence',
  'perception',
  'charm',
]);

export const DifficultySchema = z.enum(['trivial', 'easy', 'normal', 'hard', 'extreme']);

// Pass 1: Interpret Schema (for free-text custom actions)
export const InterpretResponseSchema = z.object({
  intent: z.enum([
    'travel',
    'explore',
    'search',
    'craft',
    'talk',
    'combat',
    'rest',
    'sleep',
    'use_item',
    'trade',
    'other',
  ]),
  feasible: z.boolean(),
  infeasibleReason: z.string().nullable().optional(),
  checks: z
    .array(
      z.object({
        stat: StatKeySchema,
        difficulty: DifficultySchema,
        reason: z.string(),
      })
    )
    .max(2)
    .default([]),
  timeCostMinutes: z.number().min(1).max(480).default(30),
  exertion: z.enum(['none', 'light', 'heavy']).default('none'),
  lootOpportunity: z
    .object({
      category: z.string(),
      scale: z.enum(['none', 'scrap', 'cache', 'stash']),
    })
    .nullable()
    .optional(),
  targetIds: z.array(z.string()).default([]),
});

export type InterpretResponse = z.infer<typeof InterpretResponseSchema>;

// Pass 2: Narrate Schema (property order matters: narrative first for streaming)
export const NarrateChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  risk: z.enum(['low', 'medium', 'high', 'extreme']),
  hint: z.string(),
  action: z.object({
    type: z.enum([
      'freeform',
      'upgrade',
      'special_upgrade',
      'open_chest',
      'travel',
      'rest',
      'combat_option',
      'chat',
    ]),
    targetId: z.string().optional(),
    params: z.record(z.any()).optional(),
  }),
});

export const NarrateResponseSchema = z.object({
  narrative: z.string(),
  commentary: z.string().nullable().optional(),
  choices: z.array(NarrateChoiceSchema).length(6),
  worldNews: z.string().nullable().optional(),
  worldChat: z
    .array(
      z.object({
        username: z.string(),
        message: z.string(),
        type: z.enum(['panic', 'brag', 'trade', 'scam', 'rumor', 'joke', 'death']),
      })
    )
    .default([]),
  npcDialogue: z
    .array(
      z.object({
        npcId: z.string(),
        dialogue: z.string(),
        emotion: z.string(),
      })
    )
    .default([]),
  suggestedEvents: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        severity: z.number(),
      })
    )
    .default([]),
  ambiance: z.string().default('desert_wind'),
});

export type NarrateResponse = z.infer<typeof NarrateResponseSchema>;
