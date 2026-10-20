import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Question } from '../../types/game';

// Cute column pastel accent colors
const COLUMN_ACCENTS = [
  '#E57A93', // Sakura Pink
  '#EB8E76', // Soft Coral
  '#E8BE5A', // Buttercup
  '#45B779', // Mint
  '#4D9EE3', // Sky
  '#9E7EE2'  // Lavender
];

export const BoardGrid: React.FC = () => {
  const { categories, playedCellIds, openQuestion } = useGameStore();

  const activeCategories = categories.filter(c => c.questions.length > 0);
  if (activeCategories.length === 0) {
    return (
      <div className="vn-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
        <h3 className="font-display" style={{ fontSize: '1.4rem' }}>Belum ada soal pada papan permainan.</h3>
        <p style={{ marginTop: '8px' }}>Silakan tambahkan kategori dan pertanyaan melalui menu Admin.</p>
      </div>
    );
  }

  // Find maximum rows across all categories
  const maxRows = Math.max(...activeCategories.map(c => c.questions.length), 0);

  return (
    <div 
      className="jeopardy-grid"
      style={{
        gridTemplateColumns: `repeat(${activeCategories.length}, minmax(140px, 1fr))`
      }}
    >
      {/* Category Headers */}
      {activeCategories.map((cat, idx) => {
        const accent = COLUMN_ACCENTS[idx % COLUMN_ACCENTS.length];
        return (
          <div 
            key={cat.id || cat.category} 
            className="category-header-cell"
            style={{ borderTop: `4px solid ${accent}` }}
          >
            {cat.category}
          </div>
        );
      })}

      {/* Point Tiles (Row by Row) */}
      {Array.from({ length: maxRows }).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {activeCategories.map((cat) => {
            const q: Question | undefined = cat.questions[rowIndex];
            if (!q) {
              return (
                <div 
                  key={`empty-${cat.category}-${rowIndex}`} 
                  className="point-tile played" 
                  style={{ visibility: 'hidden' }} 
                />
              );
            }

            const isPlayed = playedCellIds.includes(q.id);

            return (
              <button
                key={q.id}
                type="button"
                className={`point-tile tier-${q.points} ${isPlayed ? 'played' : ''}`}
                onClick={() => {
                  if (!isPlayed) {
                    openQuestion(q, cat.category);
                  }
                }}
                disabled={isPlayed}
                title={`${cat.category} - ${q.points} Poin`}
              >
                {!isPlayed && q.points}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
