import React from 'react';

interface CommentaryProps {
  commentary: string;
}

export const Commentary: React.FC<CommentaryProps> = ({ commentary }) => {
  return (
    <div className="commentary-box">
      <div style={{ fontWeight: 700, fontStyle: 'normal', marginBottom: '4px', color: '#f87171' }}>
        🗨️ Game Master Commentary:
      </div>
      <div>"{commentary}"</div>
    </div>
  );
};
