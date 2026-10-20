import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Play } from 'lucide-react';
import { Button } from '../ui';

export const TiebreakerModal: React.FC = () => {
  const { 
    isTiebreakerModalOpen, 
    closeTiebreakerModal, 
    tiebreakers, 
    playedTiebreakerIndices, 
    openQuestion,
    teams 
  } = useGameStore();

  if (!isTiebreakerModalOpen) return null;

  // Find tied teams (teams that have the same highest score)
  const maxScore = Math.max(...teams.map(t => t.score));
  const tiedTeams = teams.filter(t => t.score === maxScore);

  return (
    <div className="modal-overlay">
      <div className="vn-modal-dialogue">
        <Button
          variant="ghost"
          isIconOnly
          size="sm"
          className="vn-modal-close-btn"
          onClick={closeTiebreakerModal}
          title="Tutup"
          icon={<X size={16} />}
        />

        <h2 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>
          Babak Penentu (Tie-Breaker)
        </h2>
        <p style={{ color: 'var(--text-sub)', marginBottom: '20px' }}>
          Skor tertinggi imbang. Tentukan pemenang lewat soal penentu berikut.
        </p>

        {/* Tied Teams Display */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>
            Tim yang Bersaing:
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {tiedTeams.map(t => (
              <div 
                key={t.id} 
                className="vn-panel-card"
                style={{ padding: '8px 16px', borderLeft: `6px solid ${t.color}`, fontWeight: 700 }}
              >
                {t.name} ({t.score} PTS)
              </div>
            ))}
          </div>
        </div>

        {/* Tiebreaker Questions Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>
            Kategori Soal:
          </div>
          {tiebreakers.map((tb, idx) => {
            const isPlayed = playedTiebreakerIndices.includes(idx);
            return (
              <div
                key={idx}
                className="vn-panel-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: isPlayed ? 0.6 : 1,
                  background: isPlayed ? '#EAE5DC' : 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{tb.category}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                    {isPlayed ? 'Soal ini sudah pernah dimainkan' : '100 Poin Penentu'}
                  </div>
                </div>

                {!isPlayed ? (
                  <Button
                    variant="primary"
                    icon={<Play size={16} />}
                    onClick={() => {
                      closeTiebreakerModal();
                      openQuestion(tb.question, tb.category, true, idx);
                    }}
                  >
                    Mulai Soal Ini
                  </Button>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    SELESAI
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'right' }}>
          <Button variant="secondary" onClick={closeTiebreakerModal}>
            Kembali ke Papan
          </Button>
        </div>
      </div>
    </div>
  );
};
