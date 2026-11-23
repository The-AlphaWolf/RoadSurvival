import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { useGameTurn } from './hooks/useGameTurn';
import { TopBar } from './components/layout/TopBar';
import { PlayerStatus } from './components/panels/PlayerStatus';
import { VehicleStatus } from './components/panels/VehicleStatus';
import { Inventory } from './components/panels/Inventory';
import { RollHistory } from './components/panels/RollHistory';
import { NarrativePanel } from './components/narrative/NarrativePanel';
import { ChoicePanel } from './components/narrative/ChoicePanel';
import { Settings } from './components/meta/Settings';
import { DiceRoll } from './components/overlays/DiceRoll';
import { GameChoice } from './engine/types';
import { getMockNarrateResponse } from './ai/mock';
import './styles/global.css';
import './styles/panels.css';
import './styles/animations.css';

export const App: React.FC = () => {
  const { gameState, theme, setGameState, resetNewGame } = useGameStore();
  const { executeAction, activeRollOverlay, dismissRollOverlay } = useGameTurn();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme with html root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Ensure arrival scene and choices are present (recovers seamlessly if any state has empty choices)
  useEffect(() => {
    if (!gameState.flags.currentChoices || gameState.flags.currentChoices.length === 0) {
      const initialNarrative = getMockNarrateResponse(gameState, []);
      setGameState({
        ...gameState,
        flags: {
          ...gameState.flags,
          currentScenario: gameState.flags.currentScenario || initialNarrative.narrative,
          currentCommentary: gameState.flags.currentCommentary || initialNarrative.commentary || null,
          currentChoices: initialNarrative.choices,
        },
      });
    }
  }, [gameState.flags.currentChoices]);

  const handleSelectChoice = (choice: GameChoice) => {
    executeAction(choice.text, choice.action);
  };

  const handleCustomAction = (text: string) => {
    executeAction(text, { type: 'freeform' });
  };

  const handleUpgradeItem = (targetId: string, isChest: boolean) => {
    const actionText = isChest ? 'Upgrade Treasure Chest with Talent' : 'Upgrade item with Talent';
    executeAction(actionText, { type: 'upgrade', targetId });
  };

  const handleOpenChest = (targetId: string) => {
    executeAction('Open Treasure Chest', { type: 'open_chest', targetId });
  };

  return (
    <div className="game-layout">
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewGame={() => {
          resetNewGame();
        }}
      />

      <main className="main-grid">
        {/* Left Sidebar: Player & Vehicle Stats */}
        <aside style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <PlayerStatus />
          <VehicleStatus />
        </aside>

        {/* Center: Narrative & Choices */}
        <section className="narrative-container">
          <NarrativePanel />
          <ChoicePanel
            onSelectChoice={handleSelectChoice}
            onSubmitCustomAction={handleCustomAction}
          />
        </section>

        {/* Right Sidebar: Inventory & Roll History */}
        <aside className="sidebar-right" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Inventory
            onUpgradeItem={handleUpgradeItem}
            onOpenChest={handleOpenChest}
          />
          <div style={{ height: '12px' }} />
          <RollHistory />
        </aside>
      </main>

      {/* Overlays */}
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DiceRoll roll={activeRollOverlay} onDismiss={dismissRollOverlay} />
    </div>
  );
};

export default App;
