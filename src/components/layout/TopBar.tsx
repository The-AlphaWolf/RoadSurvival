import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatClockTime } from '../../engine/clock';

interface TopBarProps {
  onOpenSettings: () => void;
  onNewGame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onNewGame }) => {
  const { gameState } = useGameStore();
  const { clock, environment, flags } = gameState;

  return (
    <header className="top-bar">
      <div className="top-bar-section">
        <strong style={{ letterSpacing: '1px', color: '#60a5fa' }}>🛣️ SURVIVAL ROAD</strong>
        <span className="badge">
          📅 Day {clock.day} • ⏰ {formatClockTime(clock.minute)}
        </span>
        <span className="badge">
          📍 {environment.locationName} (Danger: {environment.dangerLevel}/10)
        </span>
        <span className="badge">
          🌤️ {environment.weather.replace(/_/g, ' ').toUpperCase()} • {environment.temperature}°C
        </span>
        {flags.novicePeriod && (
          <span className="badge badge-novice">🛡️ NOVICE PERIOD (Day 1–7)</span>
        )}
      </div>

      <div className="top-bar-section">
        <button className="btn" onClick={onOpenSettings} title="Configure Gemini API Key">
          ⚙️ Settings
        </button>
        <button
          className="btn"
          style={{ background: '#374151', color: '#d1d5db' }}
          onClick={() => {
            if (confirm('Start a fresh new game from Day 1?')) {
              onNewGame();
            }
          }}
        >
          🔄 New Game
        </button>
      </div>
    </header>
  );
};
