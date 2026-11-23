import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const RollHistory: React.FC = () => {
  const { gameState, theme } = useGameStore();
  const recentRolls = gameState.rollHistory.slice(-5).reverse();
  const isClassic = theme === 'classic';

  if (recentRolls.length === 0) return null;

  return (
    <div className="panel-container" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>{isClassic ? '🎲 ' : ''}Honest Roll Log</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Directive #5</span>
      </div>
      <div className="panel-body" style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
        {recentRolls.map((roll) => (
          <div
            key={roll.id}
            style={{
              padding: '6px 0',
              borderBottom: '1px solid var(--border-dim)',
              color: roll.outcome === 'failure' ? 'var(--meter-health)' : 'var(--text-accent)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{roll.description}</div>
            <div style={{ opacity: 0.85, marginTop: '2px' }}>{roll.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
