import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Mascot } from './Mascot';
import { Button } from '../ui';
import { 
  Trophy, 
  RotateCcw, 
  Settings, 
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    settings, 
    categories, 
    playedCellIds, 
    activeView, 
    setActiveView, 
    openLeaderboard, 
    resetProgress,
    toggleSfx
  } = useGameStore();

  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const playedCount = playedCellIds.length;

  const handleOpenStageWindow = () => {
    window.open(`${window.location.origin}${window.location.pathname}?view=stage`, '_blank', 'width=1280,height=720');
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang skor semua tim dan status kartu soal?')) {
      resetProgress();
    }
  };

  return (
    <header className="top-navbar">
      {/* Brand & Mascot */}
      <div className="nav-left">
        {settings.showMascotNavbar !== false && (
          <Mascot variant="avatar" size={38} />
        )}
        <span className="nav-title">{settings.eventTitle || 'CCA ANIKARTA'}</span>
        <span className="progress-pill">
          Lagu: {playedCount} / {totalQuestions}
        </span>
      </div>

      {/* Middle: Clean Text-Only Primary View Tabs */}
      <nav 
        style={{
          display: 'flex',
          background: 'var(--bg-card-alt)',
          border: '1.5px solid var(--border-pastel)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '3px',
          gap: '3px'
        }}
        aria-label="Navigasi Halaman Utama"
      >
        <Button
          variant="ghost"
          size="sm"
          isActive={activeView === 'game'}
          onClick={() => setActiveView('game')}
        >
          Papan
        </Button>

        <Button
          variant="ghost"
          size="sm"
          isActive={activeView === 'host'}
          onClick={() => setActiveView('host')}
        >
          Host
        </Button>

        <Button
          variant="ghost"
          size="sm"
          isActive={activeView === 'stage'}
          onClick={() => setActiveView('stage')}
        >
          Stage
        </Button>

        <Button
          variant="ghost"
          size="sm"
          isActive={activeView === 'audience'}
          onClick={() => setActiveView('audience')}
        >
          Kuis Penonton
        </Button>
      </nav>

      {/* Right: Icon-Only Quick Utility Actions (Standardized with Button Component) */}
      <div className="nav-right">
        {/* SFX Quick Toggle */}
        <Button
          variant={settings.sfxEnabled ? 'success' : 'secondary'}
          isIconOnly
          size="sm"
          onClick={toggleSfx}
          title={settings.sfxEnabled ? 'Suara SFX: Aktif (Klik untuk Mematikan)' : 'Suara SFX: Mati (Klik untuk Menyalakan)'}
          aria-label={settings.sfxEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
        >
          {settings.sfxEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </Button>

        {/* External Projector Screen Launcher */}
        <Button
          variant="secondary"
          isIconOnly
          size="sm"
          onClick={handleOpenStageWindow}
          title="Buka Layar Panggung di Tab/Jendela Baru (Untuk Proyektor)"
          aria-label="Buka Layar Panggung di Tab Baru"
        >
          <ExternalLink size={16} />
        </Button>

        {/* Podium Modal */}
        <Button
          variant="rose"
          isIconOnly
          size="sm"
          onClick={openLeaderboard}
          title="Buka Papan Peringkat Podium"
          aria-label="Buka Podium Juara"
        >
          <Trophy size={16} />
        </Button>

        {/* Admin Panel */}
        <Button
          variant={activeView === 'admin' ? 'primary' : 'secondary'}
          isIconOnly
          size="sm"
          onClick={() => setActiveView('admin')}
          title="Pengaturan Acara, SFX, & Bank Soal"
          aria-label="Buka Menu Admin"
        >
          <Settings size={16} />
        </Button>

        {/* Reset Progress */}
        <Button
          variant="danger"
          isIconOnly
          size="sm"
          onClick={handleReset}
          title="Mulai Ulang Skor & Papan Soal"
          aria-label="Reset Permainan"
        >
          <RotateCcw size={16} />
        </Button>
      </div>
    </header>
  );
};
