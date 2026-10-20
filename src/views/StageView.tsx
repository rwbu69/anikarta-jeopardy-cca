import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BoardGrid } from '../components/board/BoardGrid';
import { Scoreboard } from '../components/scoreboard/Scoreboard';
import { LeaderboardModal } from '../components/modals/LeaderboardModal';
import { Mascot } from '../components/common/Mascot';
import { Bell, Clock, Disc3 } from 'lucide-react';

export const StageView: React.FC = () => {
  const { 
    settings, 
    activeQuestion, 
    timerRemaining, 
    buzzerLockedTeamName 
  } = useGameStore();

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Projector Header (Cinema Clean) */}
      <header 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-7)',
          background: 'var(--bg-surface)',
          borderBottom: '2px solid var(--border-pastel)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {settings.showMascotStage !== false && (
            <Mascot variant="avatar" size={44} />
          )}
          <span className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {settings.eventTitle || 'CCA ANIKARTA'}
          </span>
          <span className="progress-pill" style={{ fontSize: '0.9rem' }}>
            STAGE VIEW
          </span>
        </div>

      </header>

      {/* Main Board Area */}
      <main className="board-container">
        <BoardGrid />
      </main>

      {/* Projector Question Overlay */}
      {activeQuestion && (
        <div className="modal-overlay">
          <div className="vn-modal-dialogue" style={{ maxWidth: 'var(--modal-max-lg)', textAlign: 'center' }}>
            {/* Category Nameplate */}
            <div className="dialogue-nameplate" style={{ fontSize: '1.1rem', padding: '8px 24px', marginBottom: 'var(--space-5)' }}>
              <span>{activeQuestion.categoryName}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#F6C967' }}>{activeQuestion.question.points} PTS</span>
            </div>

            {/* Buzzer Alert on Stage */}
            {buzzerLockedTeamName && (
              <div 
                style={{ 
                  background: '#FFF0F2', 
                  border: '3px solid var(--color-danger)', 
                  borderRadius: 'var(--border-radius)', 
                  padding: 'var(--space-4)', 
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <Bell size={28} color="var(--color-danger)" />
                <span style={{ color: 'var(--color-danger)', fontSize: '1.4rem', fontWeight: 800 }}>
                  BEL: {buzzerLockedTeamName.toUpperCase()} MENEBAK!
                </span>
              </div>
            )}

            {/* Question Dialogue Box or Revealed Answer */}
            <div className="dialogue-textbox" style={{ minHeight: '180px', padding: 'var(--space-7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)' }}>
              {settings.showMascotStage !== false && (
                <Mascot variant="compact" size={120} />
              )}
              <div style={{ flex: 1, textAlign: 'center' }}>
                {!activeQuestion.isRevealed ? (
                  <div>
                    <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
                      <Disc3 size={44} color="var(--color-accent-rose)" className="animate-spin" />
                    </div>
                    <div className="dialogue-text" style={{ fontSize: '1.8rem' }}>
                      Dengarkan Cuplikan Lagu
                    </div>
                  </div>
                ) : (
                  <div className="revealed-answer-box" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#175438', marginBottom: '6px' }}>
                      Jawaban:
                    </div>
                    <div className="revealed-title" style={{ fontSize: '2.2rem' }}>
                      {activeQuestion.question.title}
                    </div>
                    <div className="revealed-artist" style={{ fontSize: '1.5rem', marginTop: '6px' }}>
                      {activeQuestion.question.artist}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <div className={`timer-pill ${timerRemaining <= 5 && timerRemaining > 0 ? 'urgent' : ''}`} style={{ fontSize: '1.3rem' }}>
                <Clock size={18} />
                <span>{timerRemaining} detik</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Live Scoreboard */}
      <Scoreboard allowDirectAdjust={false} />

      {/* Podium Winner Modal */}
      <LeaderboardModal />
    </div>
  );
};
