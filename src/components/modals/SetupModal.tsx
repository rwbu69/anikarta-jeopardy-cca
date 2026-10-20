import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { AVAILABLE_TEAM_COLORS } from '../../data/defaultData';
import { Mascot } from '../common/Mascot';
import { Button } from '../ui';


export const SetupModal: React.FC = () => {
  const { isSetupCompleted, setupGame, settings } = useGameStore();
  const [teamCount, setTeamCount] = useState<number>(3);
  const [winnerCount, setWinnerCount] = useState<number>(settings.winnerCount || 3);
  const [enableTieBreaker, setEnableTieBreaker] = useState<boolean>(settings.enableTieBreaker !== false);

  const [teamConfigs, setTeamConfigs] = useState<{ name: string; color: string }[]>([
    { name: 'Tim Merah', color: AVAILABLE_TEAM_COLORS[0] },
    { name: 'Tim Biru', color: AVAILABLE_TEAM_COLORS[5] },
    { name: 'Tim Kuning', color: AVAILABLE_TEAM_COLORS[2] },
    { name: 'Tim Hijau', color: AVAILABLE_TEAM_COLORS[3] },
    { name: 'Tim Ungu', color: AVAILABLE_TEAM_COLORS[6] },
    { name: 'Tim Oranye', color: AVAILABLE_TEAM_COLORS[1] }
  ]);

  if (isSetupCompleted) return null;

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
  };

  const updateTeamName = (index: number, name: string) => {
    setTeamConfigs(prev => {
      const copy = [...prev];
      copy[index].name = name;
      return copy;
    });
  };

  const updateTeamColor = (index: number, color: string) => {
    setTeamConfigs(prev => {
      const copy = [...prev];
      copy[index].color = color;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTeams = teamConfigs.slice(0, teamCount);
    setupGame(activeTeams, winnerCount, enableTieBreaker);
  };

  return (
    <div className="modal-overlay">
      <div className="vn-modal-dialogue">
        {/* Welcoming Header (Single source of truth) */}
        {settings.showMascotSetup !== false ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Mascot 
              variant="companion" 
              size={110} 
              speechBubble="Selamat datang di Kuis Musik Anime. Tentukan konfigurasi tim untuk memulai permainan." 
            />
          </div>
        ) : (
          <h2 className="font-display" style={{ fontSize: '1.8rem', marginBottom: 'var(--space-5)', color: 'var(--text-main)' }}>
            Konfigurasi Tim
          </h2>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div>
              <label className="form-label">Jumlah Tim</label>
              <select
                className="form-input"
                value={teamCount}
                onChange={(e) => handleTeamCountChange(parseInt(e.target.value))}
              >
                <option value={2}>2 Tim</option>
                <option value={3}>3 Tim</option>
                <option value={4}>4 Tim</option>
                <option value={5}>5 Tim</option>
                <option value={6}>6 Tim</option>
              </select>
            </div>

            <div>
              <label className="form-label">Tampilkan Juara</label>
              <select
                className="form-input"
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value))}
              >
                <option value={1}>Juara 1 Saja</option>
                <option value={2}>Juara 1 & 2</option>
                <option value={3}>Juara 1, 2, & 3</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input
              type="checkbox"
              id="cbTieBreaker"
              checked={enableTieBreaker}
              onChange={(e) => setEnableTieBreaker(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="cbTieBreaker" style={{ fontWeight: 600, cursor: 'pointer' }}>
              Aktifkan Babak Tie-Breaker jika terjadi skor seri
            </label>
          </div>

          {/* Teams Input List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {Array.from({ length: teamCount }).map((_, idx) => (
              <div 
                key={idx} 
                className="vn-panel-card"
                style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    TIM {idx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={teamConfigs[idx].name}
                  onChange={(e) => updateTeamName(idx, e.target.value)}
                  placeholder={`Nama Tim ${idx + 1}`}
                  required
                  style={{ borderLeft: `6px solid ${teamConfigs[idx].color}` }}
                />
                
                {/* Color Swatches */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  {AVAILABLE_TEAM_COLORS.map(color => {
                    const isSelected = teamConfigs[idx].color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '999px',
                          backgroundColor: color,
                          border: '2px solid #FFFFFF',
                          boxShadow: isSelected ? '0 0 0 2.5px var(--color-accent-rose)' : '0 1px 4px rgba(66, 50, 41, 0.15)',
                          cursor: 'pointer',
                          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => updateTeamColor(idx, color)}
                        aria-label={`Pilih warna ${color}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth
          >
            Mulai Permainan
          </Button>
        </form>
      </div>
    </div>
  );
};
