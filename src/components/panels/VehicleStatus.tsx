import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY_DISPLAY } from '../../engine/constants';

export const VehicleStatus: React.FC = () => {
  const { gameState } = useGameStore();
  const { vehicle } = gameState;

  return (
    <div className="panel-container" style={{ marginBottom: '12px' }}>
      <div className="panel-header">
        <span>🚐 {vehicle.name}</span>
        <span style={{ fontSize: '0.75rem', color: '#9aa3be' }}>
          Paths: {vehicle.activePathsCount}/12
        </span>
      </div>

      <div className="panel-body">
        {/* Vehicle Health & Fuel */}
        <div style={{ marginBottom: '10px' }}>
          <div className="meter-row">
            <span>🛡️ Durability</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${vehicle.durability}%`,
                  background: '#10b981',
                }}
              />
            </div>
            <span>{vehicle.durability}%</span>
          </div>

          <div className="meter-row">
            <span>⛽ Fuel</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${(vehicle.fuel / vehicle.maxFuel) * 100}%`,
                  background: '#3b82f6',
                }}
              />
            </div>
            <span>{vehicle.fuel}/{vehicle.maxFuel}</span>
          </div>

          <div className="meter-row">
            <span>⚙️ Wear</span>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{
                  width: `${vehicle.wear}%`,
                  background: '#f59e0b',
                }}
              />
            </div>
            <span>{vehicle.wear}%</span>
          </div>
        </div>

        {/* 12 Components Mini Grid */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
          COMPONENTS (12)
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
                  padding: '3px 6px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{comp.name}</span>
                <span style={{ color: rInfo.color }}>{rInfo.emoji}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
