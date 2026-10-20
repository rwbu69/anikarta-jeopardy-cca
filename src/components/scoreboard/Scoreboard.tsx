import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Plus, Minus, BellRing } from 'lucide-react';
import { Button } from '../ui';

interface ScoreboardProps {
  allowDirectAdjust?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ allowDirectAdjust = false }) => {
  const { teams, buzzerLockedTeamId, adjustScore } = useGameStore();

  // Sort descending by score, tiebreaker alphabetical
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.score === a.score) return a.id.localeCompare(b.id);
    return b.score - a.score;
  });

  return (
    <div className="floating-scoreboard-dock" aria-label="Papan Skor Tim">
      {sortedTeams.map((team, index) => {
        const isRank1 = index === 0 && team.score > 0;
        const isBuzzed = buzzerLockedTeamId === team.id;

        return (
          <div 
            key={team.id} 
            className={`team-pill-card ${isRank1 ? 'rank-1' : ''} ${isBuzzed ? 'buzzed' : ''}`}
            title={`Peringkat #${index + 1}: ${team.name} (${team.score} Poin)`}
          >
            <div 
              className="team-pill-swatch" 
              style={{ backgroundColor: team.color }} 
            />
            
            <span className="team-pill-name">
              {team.name}
            </span>


            {isBuzzed && (
              <span title="Menebak!" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <BellRing size={13} color="var(--color-danger)" className="animate-bounce" />
              </span>
            )}

            <span className="team-pill-score">
              {team.score}
            </span>

            {allowDirectAdjust && (
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'var(--space-2)' }}>
                <Button
                  size="sm"
                  isIconOnly
                  style={{ padding: '2px 4px', minWidth: '22px', minHeight: '22px', borderRadius: '999px' }}
                  onClick={() => adjustScore(team.id, 100)}
                  title="Tambah 100 poin"
                  icon={<Plus size={11} />}
                />
                <Button
                  size="sm"
                  isIconOnly
                  style={{ padding: '2px 4px', minWidth: '22px', minHeight: '22px', borderRadius: '999px' }}
                  onClick={() => adjustScore(team.id, -100)}
                  title="Kurang 100 poin"
                  icon={<Minus size={11} />}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
