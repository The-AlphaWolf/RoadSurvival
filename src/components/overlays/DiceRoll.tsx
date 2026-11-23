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
        bottom: '20px',
        right: '20px',
        zIndex: 50,
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        padding: '10px 14px',
        maxWidth: '380px',
      }}
      className="slide-up"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <strong style={{ fontSize: '0.8rem', color: 'var(--text-accent)' }}>
          {roll.description}
        </strong>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {roll.details}
      </div>
    </div>
  );
};
