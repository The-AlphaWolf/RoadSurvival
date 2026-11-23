import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ActionInput, resolveTurn } from '../engine/turn';
import { gameAIClient } from '../ai/client';
import { ChoiceAction } from '../engine/types';

export function useGameTurn() {
  const {
    gameState,
    setGameState,
    setStreamingText,
    setIsStreaming,
    setIsProcessingTurn,
    isProcessingTurn,
    setErrorMessage,
  } = useGameStore();

  const [activeRollOverlay, setActiveRollOverlay] = useState<any>(null);

  const executeAction = async (actionText: string, choiceAction?: ChoiceAction) => {
    if (isProcessingTurn) return;
    setIsProcessingTurn(true);
    setErrorMessage(null);

    try {
      let resolvedAction: ChoiceAction = choiceAction || { type: 'freeform' };
      let intent: string = resolvedAction.type;
      let checks: any[] = [];
      let timeCostMinutes: number | undefined = undefined;
      let exertion: 'none' | 'light' | 'heavy' = 'none';

      // Pass 1: If freeform, interpret intent and checks via AI
      if (resolvedAction.type === 'freeform') {
        const interpretRes = await gameAIClient.interpretAction(actionText, gameState);
        if (!interpretRes.feasible) {
          setErrorMessage(interpretRes.infeasibleReason || 'That action is not possible right now.');
          setIsProcessingTurn(false);
          return;
        }
        intent = interpretRes.intent;
        checks = interpretRes.checks;
        timeCostMinutes = interpretRes.timeCostMinutes;
        exertion = interpretRes.exertion;
      }

      // Step 2: Deterministic engine RESOLVE
      const input: ActionInput = {
        text: actionText,
        action: resolvedAction,
        intent,
        checks,
        timeCostMinutes,
        exertion,
      };

      const resolveOutput = resolveTurn(gameState, input);

      // Record any talent roll overlay for visual delight
      const latestRoll = resolveOutput.rolls[resolveOutput.rolls.length - 1];
      if (latestRoll) {
        setActiveRollOverlay(latestRoll);
      }

      // Step 3: Stream narration pass
      setIsStreaming(true);
      setStreamingText('');

      const narrateResponse = await gameAIClient.narrateTurn(
        resolveOutput.updatedState,
        resolveOutput.messages,
        (streamedChunk) => {
          setStreamingText(streamedChunk);
        }
      );

      // Step 4: Commit complete turn to store
      const finalState = {
        ...resolveOutput.updatedState,
        flags: {
          ...resolveOutput.updatedState.flags,
          currentScenario: narrateResponse.narrative,
          currentCommentary: narrateResponse.commentary || null,
          currentChoices: narrateResponse.choices,
        },
        history: [
          ...resolveOutput.updatedState.history,
          {
            turnNumber: resolveOutput.updatedState.history.length + 1,
            day: resolveOutput.updatedState.clock.day,
            timeString: `${Math.floor(resolveOutput.updatedState.clock.minute / 60)}:${resolveOutput.updatedState.clock.minute % 60}`,
            actionText,
            outcomeSummary: resolveOutput.messages.join(' '),
            narrative: narrateResponse.narrative,
            commentary: narrateResponse.commentary,
          },
        ],
      };

      setGameState(finalState);
      setStreamingText(narrateResponse.narrative);
    } catch (err: any) {
      console.error('Turn execution error:', err);
      setErrorMessage(err.message || 'An error occurred resolving this turn.');
    } finally {
      setIsStreaming(false);
      setIsProcessingTurn(false);
    }
  };

  return {
    executeAction,
    isProcessingTurn,
    activeRollOverlay,
    dismissRollOverlay: () => setActiveRollOverlay(null),
  };
}
