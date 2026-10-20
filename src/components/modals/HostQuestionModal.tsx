import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui';
import { 
  Play, 
  Pause, 
  Clock, 
  RotateCcw, 
  X, 
  Undo2, 
  Bell, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { sound } from '../../lib/soundEngine';
import { Mascot } from '../common/Mascot';

export const HostQuestionModal: React.FC = () => {
  const { 
    settings,
    activeQuestion, 
    revealAnswer, 
    closeQuestion, 
    teams, 
    awardPoints, 
    undoLastScore,
    scoreHistory,
    timerRemaining, 
    isTimerRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    tickTimer,
    buzzerLockedTeamName, 
    resetBuzzer 
  } = useGameStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Handle timer tick interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  // Handle audio playback & snippet trimming
  useEffect(() => {
    if (!activeQuestion) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = activeQuestion.question.snippetStart || 0;
      setIsPlaying(false);
      setCurrentTime(audio.currentTime);
    }
  }, [activeQuestion]);

  // Global Keyboard listener: Space to toggle audio, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeQuestion) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleAudio();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeQuestion(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, isPlaying]);

  if (!activeQuestion) return null;

  const { question, categoryName, isRevealed } = activeQuestion;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);

    // Handle snippet end
    if (question.snippetDuration && question.snippetStart !== undefined) {
      const snippetEnd = question.snippetStart + question.snippetDuration;
      if (curr >= snippetEnd) {
        audioRef.current.pause();
        audioRef.current.currentTime = question.snippetStart;
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  return (
    <div className="modal-overlay">
      <div className="vn-modal-dialogue">
        {/* Close Button Top-Right */}
        <Button
          variant="secondary"
          isIconOnly
          size="sm"
          className="vn-modal-close-btn"
          onClick={() => closeQuestion(false)}
          title="Tutup (Batal / Salah Klik)"
          aria-label="Tutup"
          icon={<X size={16} />}
        />

        {/* Nameplate */}
        <div className="dialogue-nameplate">
          <span>{categoryName}</span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span style={{ color: 'var(--color-accent-rose)', fontWeight: 800 }}>{question.points} PTS</span>
        </div>

        {/* Audio Player Capsule Bar */}
        <div className="media-controller">
          <audio
            ref={audioRef}
            src={question.audio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (audioRef.current) setDuration(audioRef.current.duration);
            }}
            onEnded={() => setIsPlaying(false)}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={isPlaying ? 'primary' : 'secondary'}
                size="sm"
                onClick={toggleAudio}
                title="Putar / Jeda Audio (Spasi)"
                style={{ minWidth: '95px', borderRadius: '999px' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
              </Button>

              <Button
                variant="secondary"
                isIconOnly
                size="sm"
                onClick={toggleMute}
                title={isMuted ? 'Buka Suara SFX' : 'Bisukan Suara SFX'}
                aria-label={isMuted ? 'Buka Suara SFX' : 'Bisukan Suara SFX'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </Button>
            </div>

            {/* Egg-Shaped Cute Timer Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={`timer-pill ${timerRemaining <= 5 && timerRemaining > 0 ? 'urgent' : ''}`}>
                <Clock size={15} />
                <span>{timerRemaining}s</span>
              </div>

              <Button
                variant="secondary"
                isIconOnly
                size="sm"
                onClick={isTimerRunning ? pauseTimer : startTimer}
                title={isTimerRunning ? 'Jeda Waktu' : 'Mulai Waktu'}
                aria-label={isTimerRunning ? 'Jeda Waktu' : 'Mulai Waktu'}
              >
                {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
              </Button>

              <Button
                variant="secondary"
                isIconOnly
                size="sm"
                onClick={() => resetTimer()}
                title="Ulangi Waktu"
                aria-label="Ulangi Waktu"
              >
                <RotateCcw size={13} />
              </Button>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <input
            type="range"
            className="progress-slider"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>
            <span className="font-mono">{formatSeconds(currentTime)}</span>
            <span className="font-mono">{formatSeconds(duration)}</span>
          </div>

          {/* Playing Audio Visualizer */}
          {isPlaying && (
            <div className="audio-visualizer">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="vis-bar"
                  style={{
                    height: `${Math.max(10, Math.sin((currentTime * 4) + i) * 32 + 16)}px`,
                    opacity: 0.85
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buzzer Alert Banner */}
        {buzzerLockedTeamName && (
          <div 
            style={{ 
              background: '#FFF0F2', 
              border: '2px solid var(--color-danger)', 
              borderRadius: 'var(--border-radius-sm)', 
              padding: '12px 18px', 
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--color-danger)" />
              <strong style={{ color: 'var(--color-danger)', fontSize: '1rem' }}>
                BEL: {buzzerLockedTeamName.toUpperCase()} MENEBAK!
              </strong>
            </div>
            <Button 
              variant="danger" 
              size="sm" 
              style={{ borderRadius: '999px' }} 
              onClick={resetBuzzer}
            >
              Reset Bel
            </Button>
          </div>
        )}

        {/* ========================================================
            PROGRESSIVE DISCLOSURE: 
            PHASE 1: LISTENING & GUESSING (when !isRevealed)
            PHASE 2: ANSWER REVEALED & SCORING (when isRevealed)
           ======================================================== */}
        
        {!isRevealed ? (
          /* PHASE 1: LISTENING */
          <div>
            {settings.showMascotModal !== false && (
              <div className="dialogue-textbox" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '18px', padding: '18px 22px', marginBottom: '16px' }}>
                <Mascot 
                  variant="companion" 
                  size={105}
                  speechBubble="Dengarkan lagu yang diputar, lalu tentukan tim yang berhasil menebak dengan tepat."
                />
              </div>
            )}

            {/* Primary Action Button: Buka Jawaban */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <Button 
                variant="rose" 
                size="lg" 
                fullWidth 
                style={{ borderRadius: '999px' }} 
                onClick={revealAnswer}
              >
                <span>Buka Jawaban Lagu</span>
              </Button>

              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => closeQuestion(true)}
                >
                  Lewati Soal Tanpa Poin
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* PHASE 2: ANSWER REVEALED & SCORING */
          <div>
            <div className="revealed-answer-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1B6342', marginBottom: '4px' }}>
                    Jawaban Benar:
                  </div>
                  <div className="revealed-title">{question.title}</div>
                  <div className="revealed-artist">{question.artist}</div>
                  {question.trivia && (
                    <p style={{ marginTop: '6px', fontSize: '0.88rem', color: '#2F7C58', fontStyle: 'italic' }}>
                      Catatan: {question.trivia}
                    </p>
                  )}
                </div>

                {settings.showMascotModal !== false && (
                  <Mascot variant="compact" size={85} />
                )}
              </div>
            </div>

            {/* Award Points Section */}
            <div style={{ marginTop: '18px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '10px' }}>
                Pilih Tim Pemenang ({question.points} Poin):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {teams.map(t => (
                  <Button
                    key={t.id}
                    variant="secondary"
                    style={{
                      borderLeft: `5px solid ${t.color}`,
                      justifyContent: 'center',
                      padding: '12px 16px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 700
                    }}
                    onClick={() => {
                      awardPoints(t.id, question.points);
                      closeQuestion(true);
                    }}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-divider)' }}>
                {scoreHistory.length > 0 ? (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    style={{ borderRadius: '999px' }} 
                    onClick={undoLastScore} 
                    title="Batalkan pemberian poin terakhir"
                  >
                    <Undo2 size={13} />
                    <span>Undo Skor</span>
                  </Button>
                ) : <div />}

                <Button 
                  variant="secondary" 
                  size="sm" 
                  style={{ borderRadius: '999px', padding: '8px 18px' }} 
                  onClick={() => closeQuestion(true)}
                >
                  Lewati Tanpa Poin
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
