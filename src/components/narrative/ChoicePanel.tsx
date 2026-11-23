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
  const { gameState, isProcessingTurn, errorMessage } = useGameStore();
  const [customText, setCustomText] = useState('');

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
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'extreme':
        return '#a855f7';
      default:
        return '#9aa3be';
    }
  };

  return (
    <div className="choices-panel">
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '0.8rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* 6 Meaningful Choices Grid */}
      <div className="choice-grid">
        {choices.map((choice, idx) => (
          <button
            key={choice.id || idx}
            className="choice-button"
            disabled={isProcessingTurn}
            onClick={() => onSelectChoice(choice)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                {idx + 1}. {choice.text}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: getRiskColor(choice.risk),
                  marginLeft: '8px',
                }}
              >
                [{choice.risk}]
              </span>
            </div>
            {choice.hint && <div className="choice-hint">💡 {choice.hint}</div>}
          </button>
        ))}
      </div>

      {/* Custom Action (Section 18.12) */}
      <form onSubmit={handleCustomSubmit} className="custom-action-row">
        <input
          type="text"
          className="custom-input"
          placeholder="✍️ Custom Action: type anything you want to attempt..."
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
          {isProcessingTurn ? 'Resolving...' : 'Act ➔'}
        </button>
      </form>
    </div>
  );
};
