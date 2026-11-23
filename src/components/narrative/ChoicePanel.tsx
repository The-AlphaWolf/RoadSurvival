import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GameChoice } from '../../engine/types';

interface ChoicePanelProps {
  onSelectChoice: (choice: GameChoice) => void;
  onSubmitCustomAction: (actionText: string) => void;
}

export const ChoicePanel: React.FC<ChoicePanelProps> = ({
  onSelectChoice,
  onSubmitCustomAction,
}) => {
  const { gameState, theme, isProcessingTurn, errorMessage } = useGameStore();
  const [customText, setCustomText] = useState('');
  const isClassic = theme === 'classic';

  const choices = gameState.flags.currentChoices || [];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isProcessingTurn) return;
    onSubmitCustomAction(customText.trim());
    setCustomText('');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return '#16a34a';
      case 'medium':
        return '#d97706';
      case 'high':
        return '#dc2626';
      case 'extreme':
        return '#9333ea';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className="choices-panel">
      {errorMessage && (
        <div
          style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid #dc2626',
            color: '#fca5a5',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* 6 Tactical Choices Grid */}
      <div className="choice-grid">
        {choices.map((choice, idx) => (
          <button
            key={choice.id || idx}
            className="choice-button"
            disabled={isProcessingTurn}
            onClick={() => onSelectChoice(choice)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 500, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '6px', fontFamily: 'var(--font-mono)' }}>
                  [{String(idx + 1).padStart(2, '0')}]
                </span>
                {choice.text}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: getRiskColor(choice.risk),
                  marginLeft: '8px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {choice.risk}
              </span>
            </div>
            {choice.hint && (
              <div className="choice-hint">
                {isClassic ? '💡 ' : ''}{choice.hint}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Action Row */}
      <form onSubmit={handleCustomSubmit} className="custom-action-row">
        <input
          type="text"
          className="custom-input"
          placeholder={isClassic ? "✍️ Custom Action: type anything you want to attempt..." : "Type custom action to execute..."}
          value={customText}
          disabled={isProcessingTurn}
          onChange={(e) => setCustomText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!customText.trim() || isProcessingTurn}
          style={{ whiteSpace: 'nowrap' }}
        >
          {isProcessingTurn ? 'Resolving...' : isClassic ? 'Act ➔' : 'Execute'}
        </button>
      </form>
    </div>
  );
};
