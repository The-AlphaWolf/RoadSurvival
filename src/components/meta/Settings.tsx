import React, { useState } from 'react';
import { gameAIClient } from '../../ai/client';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('ROAD_SURVIVAL_GEMINI_KEY') || '' : ''
  );
  const [model, setModel] = useState(gameAIClient.getModelName());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    gameAIClient.setApiKey(apiKey.trim());
    gameAIClient.setModelName(model);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-bright)',
          borderRadius: '8px',
          padding: '24px',
          width: '460px',
          maxWidth: '90vw',
        }}
      >
        <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>⚙️ Game Master Settings</h3>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Road Survival uses Google Gemini to stream narrative, generate tactical choices, and roast/praise your decisions. If no key is entered, the game runs smoothly using the high-fidelity offline mock Game Master.
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
            Gemini API Key:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-dim)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>
            Model Selection:
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-dim)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Free Tier Recommended)</option>
            <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Generation)</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro (High Detail / Pro)</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn" onClick={onClose} style={{ background: '#374151', color: 'white' }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? 'Saved ✅' : 'Save Key'}
          </button>
        </div>
      </div>
    </div>
  );
};
