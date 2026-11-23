import { GoogleGenAI } from '@google/genai';
import { InterpretResponse, InterpretResponseSchema, NarrateResponse, NarrateResponseSchema } from './schemas';
import { buildContextPayload, buildSystemPrompt } from './prompts';
import { getMockInterpretResponse, getMockNarrateResponse } from './mock';
import { GameState } from '../engine/types';
import { extractPartialNarrative } from './stream';

export interface AIClientConfig {
  apiKey?: string;
  modelName?: string;
}

export class GeminiGameClient {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor(config: AIClientConfig = {}) {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    const key =
      config.apiKey ||
      (typeof window !== 'undefined' ? localStorage.getItem('ROAD_SURVIVAL_GEMINI_KEY') || envKey : envKey);
    this.modelName = config.modelName || (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

    if (key && key.trim().length > 0) {
      try {
        this.ai = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client, falling back to mock provider:', err);
        this.ai = null;
      }
    }
  }

  public setApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ROAD_SURVIVAL_GEMINI_KEY', key);
    }
    if (key && key.trim().length > 0) {
      this.ai = new GoogleGenAI({ apiKey: key });
    } else {
      this.ai = null;
    }
  }

  public hasApiKey(): boolean {
    return this.ai !== null;
  }

  /**
   * Pass 1: Interpret a free-text action
   */
  public async interpretAction(
    actionText: string,
    state: GameState
  ): Promise<InterpretResponse> {
    if (!this.ai) {
      return getMockInterpretResponse(actionText);
    }

    try {
      const prompt = `Interpret the following player action within the survival road game:
Action: "${actionText}"
Current Player State: Level ${state.player.level}, HP ${state.player.meters.health}, Location: ${state.environment.locationName}.
Return valid JSON according to the schema.`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return InterpretResponseSchema.parse(parsed);
    } catch (err) {
      console.warn('Error during Gemini interpret pass, using mock fallback:', err);
      return getMockInterpretResponse(actionText);
    }
  }

  /**
   * Pass 2: Narrate resolved outcomes with word-by-word streaming
   */
  public async narrateTurn(
    state: GameState,
    resolvedMessages: string[],
    onStreamChunk?: (streamedNarrative: string) => void
  ): Promise<NarrateResponse> {
    if (!this.ai) {
      const mock = getMockNarrateResponse(state, resolvedMessages);
      // Simulate fast streaming for immersion
      if (onStreamChunk) {
        const words = mock.narrative.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          accumulated += (i > 0 ? ' ' : '') + words[i];
          onStreamChunk(accumulated);
          // Micro-tick for natural typewriter feel
          await new Promise((r) => setTimeout(r, 12));
        }
      }
      return mock;
    }

    try {
      const systemPrompt = buildSystemPrompt();
      const contextPayload = buildContextPayload(state, resolvedMessages);

      const responseStream = await this.ai.models.generateContentStream({
        model: this.modelName,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nCURRENT CONTEXT:\n${contextPayload}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      let fullRawText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text || '';
        fullRawText += chunkText;
        if (onStreamChunk) {
          const partialNarrative = extractPartialNarrative(fullRawText);
          if (partialNarrative) {
            onStreamChunk(partialNarrative);
          }
        }
      }

      const parsed = JSON.parse(fullRawText);
      return NarrateResponseSchema.parse(parsed);
    } catch (err) {
      console.warn('Error during Gemini narrate pass, falling back to mock response:', err);
      const fallback = getMockNarrateResponse(state, resolvedMessages);
      if (onStreamChunk) {
        onStreamChunk(fallback.narrative);
      }
      return fallback;
    }
  }
}

export const gameAIClient = new GeminiGameClient();
