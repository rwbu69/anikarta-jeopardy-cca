import React from 'react';

export interface RankBadgeProps {
  rank: number;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  // Pastel styles based on rank tier
  let bg = '#F4EFE7';
  let color = '#8D7A6F';
  let border = 'var(--border-pastel)';

  if (rank === 1) {
    bg = '#FCE9BE'; // Honey Butter Pastel
    color = '#8A6818';
    border = '#F2D38A';
  } else if (rank === 2) {
    bg = '#EFEAE2'; // Silver Cream Pastel
    color = '#5C4E44';
    border = '#DDD4C7';
  } else if (rank === 3) {
    bg = '#FCDCCF'; // Peach Sorbet Pastel
    color = '#964228';
    border = '#F5BFAF';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        backgroundColor: bg,
        color: color,
        border: `1.5px solid ${border}`,
        boxShadow: rank === 1 ? '0 2px 8px rgba(240, 195, 95, 0.25)' : '0 1px 4px rgba(66, 50, 41, 0.06)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: '1.25rem',
        userSelect: 'none'
      }}
      title={`Peringkat ${rank}`}
    >
      {rank}
    </div>
  );
};
