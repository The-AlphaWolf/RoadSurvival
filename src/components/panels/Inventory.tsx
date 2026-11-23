import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY_DISPLAY } from '../../engine/constants';
import { isChestEligibleForUpgrade, isItemEligibleForUpgrade, calculateInventoryWeight } from '../../engine/inventory';

interface InventoryProps {
  onUpgradeItem: (targetId: string, isChest: boolean) => void;
  onOpenChest: (targetId: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onUpgradeItem, onOpenChest }) => {
  const { gameState, isProcessingTurn } = useGameStore();
  const { inventory, player } = gameState;
  const currentWeight = calculateInventoryWeight(inventory.items, inventory.chests);

  const canUseTalent = player.talent.charges > 0 && !isProcessingTurn;

  return (
    <div className="panel-container" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>🎒 Inventory ({inventory.items.length})</span>
        <span
          style={{
            fontSize: '0.75rem',
            color: currentWeight > inventory.maxCarryWeight ? '#ef4444' : '#9aa3be',
          }}
        >
          {currentWeight} / {inventory.maxCarryWeight} kg
        </span>
      </div>

      <div className="panel-body">
        {/* Unopened Chests */}
        {inventory.chests.some((c) => !c.isOpened) && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffd700', marginBottom: '6px' }}>
              🎁 TREASURE CHESTS
            </div>
            {inventory.chests
              .filter((c) => !c.isOpened)
              .map((chest) => {
                const rInfo = RARITY_DISPLAY[chest.rarity];
                const canUpgrade = isChestEligibleForUpgrade(chest) && canUseTalent;
                return (
                  <div
                    key={chest.id}
                    className={`item-card ${chest.rarity}`}
                    style={{ marginBottom: '6px', background: 'rgba(234, 179, 8, 0.08)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {rInfo.emoji} {chest.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9aa3be' }}>
                        {chest.isUpgraded ? '✨ Upgraded ✔' : 'Unopened starter chest'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {canUpgrade && (
                        <button
                          className="btn btn-upgrade"
                          disabled={isProcessingTurn}
                          onClick={() => onUpgradeItem(chest.id, true)}
                          title="Use 1 Upgrade Charge"
                        >
                          Upgrade ✨
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        disabled={isProcessingTurn}
                        onClick={() => onOpenChest(chest.id)}
                      >
                        Open 🎁
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Inventory Items */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
          ITEMS & SUPPLIES
        </div>
        <div className="inventory-grid">
          {inventory.items.map((item) => {
            const rInfo = RARITY_DISPLAY[item.rarity];
            const canUpgrade = isItemEligibleForUpgrade(item) && canUseTalent;

            return (
              <div key={item.id} className={`item-card ${item.rarity}`}>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{rInfo.emoji}</span>
                    <span>{item.name}</span>
                    {item.quantity > 1 && (
                      <span style={{ color: '#60a5fa', fontSize: '0.75rem' }}>x{item.quantity}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9aa3be' }}>
                    {item.weight}kg • {rInfo.name}
                    {item.isUpgraded && ' • Upgraded ✔'}
                  </div>
                </div>

                {canUpgrade && (
                  <button
                    className="btn btn-upgrade"
                    disabled={isProcessingTurn}
                    onClick={() => onUpgradeItem(item.id, false)}
                    title="Upgrade this item using SSS Talent"
                  >
                    Upgrade ✨
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
