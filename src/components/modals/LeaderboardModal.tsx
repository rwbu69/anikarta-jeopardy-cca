import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import confetti from 'canvas-confetti';
import { Mascot } from '../common/Mascot';
import { Button, RankBadge } from '../ui';
import { X, RotateCcw } from 'lucide-react';

export const LeaderboardModal: React.FC = () => {
  const { isLeaderboardOpen, closeLeaderboard, teams, resetProgress, settings } = useGameStore();

  useEffect(() => {
    if (isLeaderboardOpen) {
      // Fire confetti celebration
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isLeaderboardOpen]);

  if (!isLeaderboardOpen) return null;

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winnerCount = settings.winnerCount || 3;

  return (
    <div className="modal-overlay">
      <div className="vn-modal-dialogue" style={{ textAlign: 'center' }}>
        <Button
          variant="secondary"
          isIconOnly
          size="sm"
          className="vn-modal-close-btn"
          onClick={closeLeaderboard}
          aria-label="Tutup"
          icon={<X size={16} />}
        />

        {/* Mascot Podium / Header */}
        {settings.showMascotModal !== false && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <Mascot 
              variant="podium"
              size={120}
              speechBubble="Selamat kepada para pemenang kuis."
            />
          </div>
        )}

        <h2 className="font-display" style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '24px' }}>
          Peringkat Akhir Kuis
        </h2>

        {/* Podium List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {sortedTeams.map((team, idx) => {
            const isWinner = idx < winnerCount;
            return (
              <div
                key={team.id}
                className="vn-panel-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderLeft: `8px solid ${team.color}`,
                  background: isWinner && idx === 0 ? '#FFFDF5' : 'var(--bg-card)',
                  transform: idx === 0 ? 'scale(1.02)' : 'none'
                }}
              >
                <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                  <RankBadge rank={idx + 1} />
                </div>

                <div style={{ textAlign: 'left', marginLeft: '14px', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                    {team.name}
                  </div>
                </div>

                <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {team.score} PTS
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Mulai ulang papan permainan sekarang?')) {
                resetProgress();
                closeLeaderboard();
              }
            }}
          >
            <RotateCcw size={16} />
            <span>Mulai Ulang Papan</span>
          </Button>

          <Button variant="primary" onClick={closeLeaderboard}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
