import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY_DISPLAY } from '../../engine/constants';

export const VehicleStatus: React.FC = () => {
  const { gameState, theme } = useGameStore();
  const { vehicle } = gameState;
  const isClassic = theme === 'classic';

  return (
    <div className="panel-container" style={{ marginBottom: '8px' }}>
      <div className="panel-header">
        <span>{isClassic ? '🚐 ' : ''}{vehicle.name}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Paths {vehicle.activePathsCount}/12
        </span>
      </div>

      <div className="panel-body">
        {/* Vehicle Health & Fuel */}
        <div style={{ marginBottom: '10px' }}>
          <div className="meter-row">
            <span className="meter-label">{isClassic ? '🛡️ Hull' : 'Durability'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${vehicle.durability}%`,
                  background: '#16a34a',
                }}
              />
            </div>
            <span className="meter-value">{vehicle.durability}%</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '⛽ Fuel' : 'Fuel'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${(vehicle.fuel / vehicle.maxFuel) * 100}%`,
                  background: '#0284c7',
                }}
              />
            </div>
            <span className="meter-value">{vehicle.fuel}/{vehicle.maxFuel}</span>
          </div>

          <div className="meter-row">
            <span className="meter-label">{isClassic ? '⚙️ Wear' : 'Wear'}</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${vehicle.wear}%`,
                  background: '#d97706',
                }}
              />
            </div>
            <span className="meter-value">{vehicle.wear}%</span>
          </div>
        </div>

        {/* 12 Components Grid */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>
          Installed Components
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            fontSize: '0.7rem',
          }}
        >
          {Object.entries(vehicle.components).map(([key, comp]) => {
            const rInfo = RARITY_DISPLAY[comp.rarity];
            return (
              <div
                key={key}
                style={{
                  padding: '4px 6px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{comp.name}</span>
                <span
                  style={{
                    color: rInfo.color,
                    fontSize: isClassic ? '0.75rem' : '0.68rem',
                    fontWeight: 600,
                  }}
                >
                  {isClassic ? rInfo.emoji : comp.rarity.toUpperCase().slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
