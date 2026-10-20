import React, { useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { AudienceItem } from '../types/game';
import { Play, Pause, X, RotateCcw, Eye, Check } from 'lucide-react';
import { Button } from '../components/ui';

export const AudienceQuizView: React.FC = () => {
  const { 
    audienceQuestions, 
    playedAudienceIds, 
    toggleAudiencePlayed, 
    resetAudienceProgress 
  } = useGameStore();

  const [activeAudienceItem, setActiveAudienceItem] = useState<AudienceItem | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleOpenModal = (item: AudienceItem) => {
    setActiveAudienceItem(item);
    setIsRevealed(false);
    setIsPlaying(false);
  };

  const handleCloseModal = () => {
    if (audioRef.current) audioRef.current.pause();
    setActiveAudienceItem(null);
    setIsPlaying(false);
    setIsRevealed(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleFinish = (id: string) => {
    toggleAudiencePlayed(id);
    handleCloseModal();
  };

  return (
    <div className="board-container">
      <div className="content-container">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
              Kuis Penonton
            </h2>
          </div>

          <Button 
            variant="danger"
            icon={<RotateCcw size={16} />}
            onClick={() => {
              if (window.confirm('Reset status semua kartu kuis penonton?')) {
                resetAudienceProgress();
              }
            }}
          >
            Reset Kartu Penonton
          </Button>
        </div>

        {/* 20 Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 'var(--space-4)',
            width: '100%'
          }}
        >
          {audienceQuestions.map((item) => {
            const isPlayed = playedAudienceIds.includes(item.id);
            return (
              <button
                key={item.id}
                className={`point-tile tier-200 ${isPlayed ? 'played' : ''}`}
                style={{ minHeight: '90px' }}
                onClick={() => handleOpenModal(item)}
              >
                <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  #{item.number}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audience Question Modal */}
      {activeAudienceItem && (
        <div className="modal-overlay">
          <div className="vn-modal-dialogue" style={{ textAlign: 'center' }}>
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              className="vn-modal-close-btn"
              onClick={handleCloseModal}
              title="Tutup"
              icon={<X size={16} />}
            />

            <div className="dialogue-nameplate">
              Nomor {activeAudienceItem.number}
            </div>

            {/* Audio Player */}
            <div className="media-controller" style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'center' }}>
              <audio
                ref={audioRef}
                src={activeAudienceItem.audio}
                onEnded={() => setIsPlaying(false)}
              />
              <Button
                variant={isPlaying ? 'primary' : 'secondary'}
                size="lg"
                icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
                onClick={toggleAudio}
              >
                {isPlaying ? 'Jeda Lagu' : 'Putar Cuplikan Lagu'}
              </Button>
            </div>

            {/* Question Text / Answer */}
            <div className="dialogue-textbox">
              {!isRevealed ? (
                <div>
                  <div className="dialogue-text">Penonton, Tebak Lagu Ini</div>
                </div>
              ) : (
                <div className="revealed-answer-box">
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#175438', marginBottom: '4px' }}>
                    Jawaban:
                  </div>
                  <div className="revealed-title">{activeAudienceItem.title}</div>
                  <div className="revealed-artist">{activeAudienceItem.artist}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {!isRevealed ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Eye size={18} />}
                  onClick={() => setIsRevealed(true)}
                >
                  Buka Jawaban
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Check size={18} />}
                  onClick={() => handleFinish(activeAudienceItem.id)}
                >
                  Tandai Selesai
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
