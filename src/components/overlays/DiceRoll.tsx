import React from 'react';
import { RollRecord } from '../../engine/types';

interface DiceRollProps {
  roll: RollRecord | null;
  onDismiss: () => void;
}

export const DiceRoll: React.FC<DiceRollProps> = ({ roll, onDismiss }) => {
  if (!roll) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-bright)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        padding: '12px 16px',
        maxWidth: '400px',
      }}
      className="dice-shake"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <strong style={{ fontSize: '0.85rem', color: '#a855f7' }}>
          🎲 {roll.description}
        </strong>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: '#9aa3be', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {roll.details}
      </div>
    </div>
  );
};
