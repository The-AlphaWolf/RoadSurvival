import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY_DISPLAY } from '../../engine/constants';
import { isChestEligibleForUpgrade, isItemEligibleForUpgrade, calculateInventoryWeight } from '../../engine/inventory';

interface InventoryProps {
  onUpgradeItem: (targetId: string, isChest: boolean) => void;
  onOpenChest: (targetId: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onUpgradeItem, onOpenChest }) => {
  const { gameState, theme, isProcessingTurn } = useGameStore();
  const { inventory, player } = gameState;
  const isClassic = theme === 'classic';
  const currentWeight = calculateInventoryWeight(inventory.items, inventory.chests);

  const canUseTalent = player.talent.charges > 0 && !isProcessingTurn;

  return (
    <div className="panel-container" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>{isClassic ? '🎒 ' : ''}Supplies & Gear ({inventory.items.length})</span>
        <span
          style={{
            fontSize: '0.72rem',
            color: currentWeight > inventory.maxCarryWeight ? 'var(--meter-health)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {currentWeight}/{inventory.maxCarryWeight} kg
        </span>
      </div>

      <div className="panel-body">
        {/* Unopened Chests */}
        {inventory.chests.some((c) => !c.isOpened) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '6px' }}>
              {isClassic ? '🎁 ' : '● '}Treasure Chests
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
                    style={{ marginBottom: '6px' }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {isClassic ? `${rInfo.emoji} ` : ''}{chest.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {chest.isUpgraded ? 'Upgraded' : 'Unopened container'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {canUpgrade && (
                        <button
                          className="btn btn-accent"
                          disabled={isProcessingTurn}
                          onClick={() => onUpgradeItem(chest.id, true)}
                          title="Upgrade chest tier with SSS Talent"
                        >
                          {isClassic ? 'Upgrade ✨' : 'Upgrade'}
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        disabled={isProcessingTurn}
                        onClick={() => onOpenChest(chest.id)}
                      >
                        {isClassic ? 'Open 🎁' : 'Open'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Inventory Items List */}
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Manifest
        </div>
        <div className="inventory-grid">
          {inventory.items.map((item) => {
            const rInfo = RARITY_DISPLAY[item.rarity];
            const canUpgrade = isItemEligibleForUpgrade(item) && canUseTalent;

            return (
              <div key={item.id} className={`item-card ${item.rarity}`}>
                <div style={{ flex: 1, paddingRight: '6px' }}>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isClassic && <span>{rInfo.emoji}</span>}
                    <span>{item.name}</span>
                    {item.quantity > 1 && (
                      <span style={{ color: 'var(--text-accent)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        ×{item.quantity}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.weight} kg • {rInfo.name}
                    {item.isUpgraded && ' • Upgraded'}
                  </div>
                </div>

                {canUpgrade && (
                  <button
                    className="btn btn-accent"
                    disabled={isProcessingTurn}
                    onClick={() => onUpgradeItem(item.id, false)}
                    title="Upgrade this item using SSS Talent"
                  >
                    {isClassic ? 'Upgrade ✨' : 'Upgrade'}
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
