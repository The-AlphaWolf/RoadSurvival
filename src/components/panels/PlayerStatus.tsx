import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getLuckDescriptor } from '../../engine/constants';
import { getSpecialChargeStatus } from '../../engine/clock';

export const PlayerStatus: React.FC = () => {
  const { gameState, theme } = useGameStore();
  const { player, clock } = gameState;
  const { meters, stats, talent } = player;
  const isClassic = theme === 'classic';

  const specialStatus = getSpecialChargeStatus(
    clock.totalElapsedMinutes,
    talent.specialCooldownUntilMinute
  );

  return (
    <div className="panel-container" style={{ marginBottom: '8px' }}>
      <div className="panel-header">
        <span>
          {isClassic ? '🧍 ' : ''}{player.name} — Lv. {player.level}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          XP {player.experience}/{player.nextLevelExperience}
        </span>
      </div>

      <div className="panel-body">
        {/* Survival Gauges */}
        <div style={{ marginBottom: '10px' }}>
          <div className="meter-row">
            <span className="meter-label">{isClassic ? '❤️ HP' : 'Health'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${(meters.health / meters.maxHealth) * 100}%`,
                  background: 'var(--meter-health)',
                }}
              />
            </div>
            <span className="meter-value">{meters.health}/{meters.maxHealth}</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '⚡ Energy' : 'Energy'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.energy}%`,
                  background: 'var(--meter-energy)',
                }}
              />
            </div>
            <span className="meter-value">{meters.energy}%</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '🍗 Hunger' : 'Hunger'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.hunger}%`,
                  background: 'var(--meter-hunger)',
                }}
              />
            </div>
            <span className="meter-value">{meters.hunger}%</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '💧 Thirst' : 'Thirst'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.thirst}%`,
                  background: 'var(--meter-thirst)',
                }}
              />
            </div>
            <span className="meter-value">{meters.thirst}%</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '🥱 Fatigue' : 'Fatigue'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.fatigue}%`,
                  background: 'var(--meter-fatigue)',
                }}
              />
            </div>
            <span className="meter-value">{meters.fatigue}%</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '🧠 Sanity' : 'Sanity'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.sanity}%`,
                  background: 'var(--meter-sanity)',
                }}
              />
            </div>
            <span className="meter-value">{meters.sanity}%</span>
          </div>
        </div>

        {/* Talent Diagnostics Box */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 10px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-accent)', fontSize: '0.78rem' }}>
              {isClassic ? '✨ ' : ''}SSS Talent: Upgrade
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: talent.charges > 0 ? '#22c55e' : '#ef4444',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {talent.charges}/6 Charges
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {specialStatus.available ? (
              <span style={{ color: 'var(--text-accent)' }}>
                {isClassic ? '⭐ ' : '● '}Special 3-Tier Jump: Ready
              </span>
            ) : (
              <span>Special Cooldown: {specialStatus.remainingHours}h</span>
            )}
          </div>
        </div>

        {/* Core Attributes */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              marginBottom: '6px',
            }}
          >
            <div>STR {stats.strength}</div>
            <div>AGI {stats.agility}</div>
            <div>END {stats.endurance}</div>
            <div>INT {stats.intelligence}</div>
            <div>PER {stats.perception}</div>
            <div>CHA {stats.charm}</div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isClassic ? '🍀 ' : 'Fortune: '}"{getLuckDescriptor(stats.hiddenLuck)}"
          </div>
        </div>
      </div>
    </div>
  );
};
