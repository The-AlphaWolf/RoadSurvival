import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getLuckDescriptor } from '../../engine/constants';
import { getSpecialChargeStatus } from '../../engine/clock';

export const PlayerStatus: React.FC = () => {
  const { gameState } = useGameStore();
  const { player, clock } = gameState;
  const { meters, stats, talent } = player;

  const specialStatus = getSpecialChargeStatus(
    clock.totalElapsedMinutes,
    talent.specialCooldownUntilMinute
  );

  return (
    <div className="panel-container" style={{ marginBottom: '12px' }}>
      <div className="panel-header">
        <span>🧍 {player.name} (Lv. {player.level})</span>
        <span style={{ fontSize: '0.75rem', color: '#9aa3be' }}>
          XP: {player.experience}/{player.nextLevelExperience}
        </span>
      </div>

      <div className="panel-body">
        {/* Survival Meters */}
        <div style={{ marginBottom: '12px' }}>
          <div className="meter-row">
            <span>❤️ Health</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${(meters.health / meters.maxHealth) * 100}%`,
                  background: 'var(--meter-health)',
                }}
              />
            </div>
            <span>{meters.health}/{meters.maxHealth}</span>
          </div>

          <div className="meter-row">
            <span>⚡ Energy</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.energy}%`,
                  background: 'var(--meter-energy)',
                }}
              />
            </div>
            <span>{meters.energy}%</span>
          </div>

          <div className="meter-row">
            <span>🍗 Hunger</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.hunger}%`,
                  background: 'var(--meter-hunger)',
                }}
              />
            </div>
            <span>{meters.hunger}%</span>
          </div>

          <div className="meter-row">
            <span>💧 Thirst</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.thirst}%`,
                  background: 'var(--meter-thirst)',
                }}
              />
            </div>
            <span>{meters.thirst}%</span>
          </div>

          <div className="meter-row">
            <span>🥱 Fatigue</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.fatigue}%`,
                  background: 'var(--meter-fatigue)',
                }}
              />
            </div>
            <span>{meters.fatigue}%</span>
          </div>

          <div className="meter-row">
            <span>🧠 Sanity</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${meters.sanity}%`,
                  background: 'var(--meter-sanity)',
                }}
              />
            </div>
            <span>{meters.sanity}%</span>
          </div>
        </div>

        {/* Talent Section */}
        <div
          style={{
            background: 'rgba(163, 53, 238, 0.1)',
            border: '1px solid rgba(163, 53, 238, 0.3)',
            borderRadius: '6px',
            padding: '8px 10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#d8b4fe', fontSize: '0.8rem' }}>
              ✨ SSS Talent: "Upgrade"
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: talent.charges > 0 ? '#1eff00' : '#ef4444',
              }}
            >
              Charges: {talent.charges}/6
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9aa3be', marginTop: '4px' }}>
            {specialStatus.available ? (
              <span style={{ color: '#ffd700' }}>⭐ Special (+3 Tiers): READY</span>
            ) : (
              <span>⏳ Special Cooldown: {specialStatus.remainingHours}h remaining</span>
            )}
          </div>
        </div>

        {/* Attributes & Luck */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
            <div>STR: {stats.strength}</div>
            <div>AGI: {stats.agility}</div>
            <div>END: {stats.endurance}</div>
            <div>INT: {stats.intelligence}</div>
            <div>PER: {stats.perception}</div>
            <div>CHA: {stats.charm}</div>
          </div>
          <div style={{ fontStyle: 'italic', color: '#60a5fa', fontSize: '0.75rem' }}>
            🍀 Luck: "{getLuckDescriptor(stats.hiddenLuck)}"
          </div>
        </div>
      </div>
    </div>
  );
};
