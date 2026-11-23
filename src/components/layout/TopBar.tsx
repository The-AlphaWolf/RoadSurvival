import React from 'react';
import { useGameStore, GameTheme } from '../../store/gameStore';
import { formatClockTime } from '../../engine/clock';

interface TopBarProps {
  onOpenSettings: () => void;
  onNewGame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings, onNewGame }) => {
  const { gameState, theme, setTheme } = useGameStore();
  const { clock, environment, flags } = gameState;
  const isClassic = theme === 'classic';

  return (
    <header className="top-bar">
      <div className="top-bar-section">
        <span className="brand-title">
          {isClassic ? '🛣️ SURVIVAL ROAD' : 'SURVIVAL ROAD'}
        </span>

        <span className="badge">
          {isClassic ? '📅 ' : ''}Day {clock.day} • {isClassic ? '⏰ ' : ''}{formatClockTime(clock.minute)}
        </span>

        <span className="badge">
          {isClassic ? '📍 ' : ''}{environment.locationName} [Danger {environment.dangerLevel}/10]
        </span>

        <span className="badge">
          {isClassic ? '🌤️ ' : ''}{environment.weather.replace(/_/g, ' ')} • {environment.temperature}°C
        </span>

        {flags.novicePeriod && (
          <span className="badge badge-novice">
            {isClassic ? '🛡️ ' : '● '}Novice Period (Days 1–7)
          </span>
        )}
      </div>

      <div className="top-bar-section">
        {/* 4 Theme Switcher Dropdown */}
        <select
          className="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as GameTheme)}
          title="Switch UI Theme"
        >
          <option value="wasteland">Theme: Wasteland Telemetry</option>
          <option value="terminal">Theme: Tactical Terminal (CRT)</option>
          <option value="graphite">Theme: Clean Graphite</option>
          <option value="classic">Theme: Classic Survivor (Emojis)</option>
        </select>

        <button className="btn" onClick={onOpenSettings} title="Configure Gemini API Key">
          {isClassic ? '⚙️ ' : ''}Settings
        </button>

        <button
          className="btn"
          style={{ opacity: 0.8 }}
          onClick={() => {
            if (confirm('Start a fresh new game from Day 1?')) {
              onNewGame();
            }
          }}
        >
          {isClassic ? '🔄 ' : ''}New Run
        </button>
      </div>
    </header>
  );
};
