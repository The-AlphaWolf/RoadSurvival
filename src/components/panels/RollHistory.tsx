import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const RollHistory: React.FC = () => {
  const { gameState } = useGameStore();
  const recentRolls = gameState.rollHistory.slice(-5).reverse();

  if (recentRolls.length === 0) return null;

  return (
    <div className="panel-container" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>🎲 Honest Roll Log</span>
        <span style={{ fontSize: '0.75rem', color: '#9aa3be' }}>Prime Directive #5</span>
      </div>
      <div className="panel-body" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
        {recentRolls.map((roll) => (
          <div
            key={roll.id}
            style={{
              padding: '6px 8px',
              borderBottom: '1px solid var(--border-dim)',
              color: roll.outcome === 'failure' ? '#fca5a5' : '#86efac',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{roll.description}</div>
            <div style={{ opacity: 0.9, marginTop: '2px' }}>{roll.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
