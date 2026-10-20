import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { Navbar } from './components/common/Navbar';
import { BoardGrid } from './components/board/BoardGrid';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { HostQuestionModal } from './components/modals/HostQuestionModal';
import { SetupModal } from './components/modals/SetupModal';
import { TiebreakerModal } from './components/modals/TiebreakerModal';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { StageView } from './views/StageView';
import { HostView } from './views/HostView';
import { AudienceQuizView } from './views/AudienceQuizView';
import { AdminView } from './views/AdminView';

export function App() {
  const { 
    activeView, 
    setActiveView, 
    initFromStorage, 
    triggerBuzzer, 
    teams 
  } = useGameStore();

  useEffect(() => {
    initFromStorage();

    // Check URL parameters for direct view routing (e.g. ?view=stage for projector)
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'stage') {
      setActiveView('stage');
    } else if (viewParam === 'host') {
      setActiveView('host');
    } else if (viewParam === 'audience') {
      setActiveView('audience');
    } else if (viewParam === 'admin') {
      setActiveView('admin');
    }

    // Keyboard listener for buzzer hotkeys (Key 1 to 6)
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= teams.length) {
        triggerBuzzer(teams[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If in dedicated Stage Mode, render StageView directly
  if (activeView === 'stage') {
    return <StageView />;
  }

  return (
    <div className="app-container">
      <Navbar />

      {activeView === 'game' && (
        <>
          <main className="board-container">
            <BoardGrid />
          </main>
          <Scoreboard />
          <HostQuestionModal />
          <SetupModal />
          <TiebreakerModal />
          <LeaderboardModal />
        </>
      )}

      {activeView === 'host' && <HostView />}
      {activeView === 'audience' && <AudienceQuizView />}
      {activeView === 'admin' && <AdminView />}
    </div>
  );
}

export default App;
