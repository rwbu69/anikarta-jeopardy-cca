import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Scoreboard } from '../components/scoreboard/Scoreboard';
import { HostQuestionModal } from '../components/modals/HostQuestionModal';
import { LeaderboardModal } from '../components/modals/LeaderboardModal';
import { TiebreakerModal } from '../components/modals/TiebreakerModal';
import { Button } from '../components/ui';

import { 
  Bell, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Swords, 
  Trophy, 
  Undo2 
} from 'lucide-react';

export const HostView: React.FC = () => {
  const { 
    categories, 
    playedCellIds, 
    openQuestion, 
    teams, 
    triggerBuzzer, 
    resetBuzzer, 
    buzzerLockedTeamName, 
    timerRemaining, 
    isTimerRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    openLeaderboard, 
    openTiebreakerModal, 
    undoLastScore,
    scoreHistory
  } = useGameStore();

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Host Quick Action Bar */}
      <div 
        style={{
          background: '#241C18',
          color: '#FFF',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          flexWrap: 'wrap'
        }}
      >
        {/* Buzzer Trigger Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D4C5B9', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={14} color="#E57A93" />
            Buzzer Tim:
          </span>
          {teams.map((t, idx) => (
            <Button
              key={t.id}
              variant="primary"
              size="sm"
              style={{
                borderLeft: `4px solid ${t.color}`,
                borderColor: '#4D3E35'
              }}
              onClick={() => triggerBuzzer(t.id)}
              title={`Tekan bel untuk ${t.name} (Hotkey: ${idx + 1})`}
            >
              <span>{t.name}</span>
            </Button>
          ))}
          <Button 
            variant="danger" 
            size="sm" 
            onClick={resetBuzzer}
          >
            Reset Bel
          </Button>
        </div>

        {/* Stage Timer Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F6C967', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={16} />
            {timerRemaining}s
          </span>
          <Button
            variant="primary"
            isIconOnly
            size="sm"
            onClick={isTimerRunning ? pauseTimer : startTimer}
            aria-label={isTimerRunning ? 'Jeda Waktu' : 'Mulai Waktu'}
          >
            {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
          </Button>
          <Button
            variant="primary"
            isIconOnly
            size="sm"
            onClick={() => resetTimer()}
            aria-label="Ulangi Waktu"
          >
            <RotateCcw size={12} />
          </Button>
        </div>

        {/* Global Host Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {scoreHistory.length > 0 && (
            <Button 
              variant="primary"
              size="sm"
              onClick={undoLastScore}
              title="Batalkan penambahan skor terakhir"
            >
              <Undo2 size={14} />
              <span>Undo Skor</span>
            </Button>
          )}

          <Button 
            variant="primary"
            size="sm"
            onClick={openTiebreakerModal}
          >
            <Swords size={14} />
            <span>Tiebreaker</span>
          </Button>

          <Button 
            variant="rose"
            size="sm"
            onClick={openLeaderboard}
          >
            <Trophy size={14} />
            <span>Podium</span>
          </Button>
        </div>
      </div>

      {/* Buzzer Active Alert */}
      {buzzerLockedTeamName && (
        <div style={{ background: '#DC2646', color: '#FFF', padding: 'var(--space-3) var(--space-6)', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
          <Bell size={18} />
          <span>{buzzerLockedTeamName.toUpperCase()} MENEKAN BEL LEBIH DULU</span>
        </div>
      )}

      {/* Host Board Grid with Answer Previews */}
      <main className="board-container">
        <div style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
          <h2 className="font-display" style={{ fontSize: '1.4rem' }}>
            Kunci Jawaban Papan Host
          </h2>
        </div>

        <div 
          className="jeopardy-grid"
          style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(180px, 1fr))` }}
        >
          {categories.map(cat => (
            <div key={cat.id || cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="category-header-cell" style={{ minHeight: '64px' }}>
                {cat.category}
              </div>

              {cat.questions.map(q => {
                const isPlayed = playedCellIds.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    className="vn-panel"
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      textAlign: 'left',
                      cursor: isPlayed ? 'default' : 'pointer',
                      opacity: isPlayed ? 0.5 : 1,
                      borderLeft: isPlayed ? '4px solid #C4B5A5' : '4px solid var(--color-accent-rose)',
                      background: isPlayed ? '#F4EFE7' : 'var(--bg-surface)'
                    }}
                    onClick={() => {
                      if (!isPlayed) openQuestion(q, cat.category);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ fontWeight: 800, color: 'var(--color-accent-rose)', fontSize: '0.88rem' }}>
                        {q.points} PTS
                      </span>
                      {isPlayed && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          SELESAI
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.title || '(Tanpa Judul)'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.artist || '-'}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Floating Scoreboard */}
      <Scoreboard allowDirectAdjust={true} />

      {/* Modals */}
      <HostQuestionModal />
      <LeaderboardModal />
      <TiebreakerModal />
    </div>
  );
};
