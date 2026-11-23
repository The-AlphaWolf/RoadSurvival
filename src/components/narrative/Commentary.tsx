import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface CommentaryProps {
  commentary: string;
}

export const Commentary: React.FC<CommentaryProps> = ({ commentary }) => {
  const { theme } = useGameStore();
  const isClassic = theme === 'classic';

  return (
    <div className="commentary-box">
      <div style={{ fontWeight: 600, fontStyle: 'normal', marginBottom: '4px', color: '#f87171', fontSize: '0.8rem' }}>
        {isClassic ? '🗨️ ' : ''}Game Master Debrief
      </div>
      <div>"{commentary}"</div>
    </div>
  );
};
