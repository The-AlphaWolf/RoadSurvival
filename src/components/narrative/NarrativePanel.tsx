import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Commentary } from './Commentary';

export const NarrativePanel: React.FC = () => {
  const { gameState, streamedText, isStreaming } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // The text to display is either streamed text while in progress or the committed scenario
  const displayText = isStreaming ? streamedText : gameState.flags.currentScenario;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayText, gameState.flags.currentCommentary]);

  return (
    <div className="narrative-scroll" ref={scrollRef}>
      {/* World News Banner if present */}
      {gameState.worldNews.length > 0 && (
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '14px',
            fontSize: '0.82rem',
            color: '#93c5fd',
          }}
        >
          {gameState.worldNews[gameState.worldNews.length - 1]}
        </div>
      )}

      {/* Narrative Prose */}
      <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
        {displayText}
        {isStreaming && <span className="streaming-cursor" />}
      </div>

      {/* GM Commentary */}
      {gameState.flags.currentCommentary && !isStreaming && (
        <Commentary commentary={gameState.flags.currentCommentary} />
      )}
    </div>
  );
};
