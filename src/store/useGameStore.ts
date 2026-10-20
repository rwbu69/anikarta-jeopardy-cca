import { create } from 'zustand';
import type { 
  Category, 
  Question, 
  Team, 
  TiebreakerItem, 
  AudienceItem, 
  GameSettings, 
  ActiveQuestionState, 
  ScoreHistoryEntry,
  ViewMode 
} from '../types/game';
import { DEFAULT_GAME_DATA, DEFAULT_TIEBREAKER, DEFAULT_AUDIENCE_DATA } from '../data/defaultData';
import { sound } from '../lib/soundEngine';

// BroadcastChannel for instant inter-window synchronization (Host Screen <-> Stage Projector)
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  syncChannel = new BroadcastChannel('anikarta_stage_sync');
}

interface GameState {
  // Data
  categories: Category[];
  playedCellIds: string[];
  teams: Team[];
  tiebreakers: TiebreakerItem[];
  playedTiebreakerIndices: number[];
  audienceQuestions: AudienceItem[];
  playedAudienceIds: string[];
  settings: GameSettings;
  scoreHistory: ScoreHistoryEntry[];

  // Active runtime state
  activeQuestion: ActiveQuestionState | null;
  activeView: ViewMode;
  isSetupCompleted: boolean;
  isLeaderboardOpen: boolean;
  isTiebreakerModalOpen: boolean;

  // Timer
  timerRemaining: number;
  timerDuration: number;
  isTimerRunning: boolean;

  // Buzzer
  buzzerLockedTeamId: string | null;
  buzzerLockedTeamName: string | null;

  // Actions
  initFromStorage: () => void;
  setActiveView: (view: ViewMode) => void;
  setupGame: (teams: { name: string; color: string }[], winnerCount: number, enableTieBreaker: boolean) => void;
  openQuestion: (question: Question, categoryName: string, isTiebreaker?: boolean, tbIndex?: number) => void;
  revealAnswer: () => void;
  closeQuestion: (markAsPlayed?: boolean) => void;
  toggleMediaPlayback: (isPlaying?: boolean) => void;
  awardPoints: (teamId: string, points?: number) => void;
  penalizePoints: (teamId: string, points?: number) => void;
  adjustScore: (teamId: string, delta: number) => void;
  undoLastScore: () => void;
  resetProgress: () => void;
  resetEntireGame: () => void;
  
  // Timer Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newDuration?: number) => void;
  tickTimer: () => void;

  // Buzzer Actions
  triggerBuzzer: (teamId: string) => void;
  resetBuzzer: () => void;

  // Tiebreaker & Leaderboard
  openTiebreakerModal: () => void;
  closeTiebreakerModal: () => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;

  // Audience
  toggleAudiencePlayed: (id: string) => void;
  resetAudienceProgress: () => void;

  // Admin & Settings
  toggleSfx: () => void;
  saveCategories: (categories: Category[]) => void;
  saveTiebreakers: (tb: TiebreakerItem[]) => void;
  saveAudienceQuestions: (aud: AudienceItem[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  importAllData: (data: { categories?: Category[]; tiebreakers?: TiebreakerItem[]; audience?: AudienceItem[]; settings?: GameSettings }) => void;
  restoreDefaults: () => void;
}

const STORAGE_KEY = 'anikarta_v2_store';

function loadStoredState(): Partial<GameState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved state:', e);
  }
  return {};
}

function persistState(state: Partial<GameState>) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      categories: state.categories,
      playedCellIds: state.playedCellIds,
      teams: state.teams,
      tiebreakers: state.tiebreakers,
      playedTiebreakerIndices: state.playedTiebreakerIndices,
      audienceQuestions: state.audienceQuestions,
      playedAudienceIds: state.playedAudienceIds,
      settings: state.settings,
      isSetupCompleted: state.isSetupCompleted,
      scoreHistory: state.scoreHistory
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Broadcast helper
function broadcastSync(type: string, payload: unknown) {
  if (syncChannel) {
    syncChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  categories: DEFAULT_GAME_DATA,
  playedCellIds: [],
  teams: [
    { id: 't1', name: 'Tim Merah', score: 0, color: '#FF3B30' },
    { id: 't2', name: 'Tim Biru', score: 0, color: '#007AFF' },
    { id: 't3', name: 'Tim Kuning', score: 0, color: '#FFCC00' }
  ],
  tiebreakers: DEFAULT_TIEBREAKER,
  playedTiebreakerIndices: [],
  audienceQuestions: DEFAULT_AUDIENCE_DATA,
  playedAudienceIds: [],
  settings: {
    winnerCount: 3,
    enableTieBreaker: true,
    enableBuzzer: true,
    timerDuration: 20,
    penaltyOnWrong: false,
    eventTitle: 'CCA ANIKARTA',
    theme: 'visual-novel',
    sfxEnabled: false, // Default is disabled per user request
    sfxVolume: 0.7,
    sfxProfile: 'arcade',
    showMascotNavbar: true,
    showMascotModal: true,
    showMascotStage: true,
    showMascotSetup: true
  },
  scoreHistory: [],

  activeQuestion: null,
  activeView: 'game',
  isSetupCompleted: false,
  isLeaderboardOpen: false,
  isTiebreakerModalOpen: false,

  timerRemaining: 20,
  timerDuration: 20,
  isTimerRunning: false,

  buzzerLockedTeamId: null,
  buzzerLockedTeamName: null,

  initFromStorage: () => {
    const saved = loadStoredState();
    if (saved && Object.keys(saved).length > 0) {
      set(state => ({
        ...state,
        ...saved,
        timerDuration: saved.settings?.timerDuration ?? state.timerDuration,
        timerRemaining: saved.settings?.timerDuration ?? state.timerDuration
      }));

      // Sync sound settings to SoundEngine
      const sfxOn = saved.settings?.sfxEnabled ?? false;
      const sfxVol = saved.settings?.sfxVolume ?? 0.7;
      const sfxProf = saved.settings?.sfxProfile ?? 'arcade';
      sound.setEnabled(sfxOn);
      sound.setVolume(sfxVol);
      sound.setProfile(sfxProf);
    } else {
      sound.setEnabled(false);
      sound.setVolume(0.7);
      sound.setProfile('arcade');
    }

    // Setup broadcast listener for multi-screen real-time sync
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (!type) return;

        switch (type) {
          case 'SYNC_STATE':
            set(state => ({ ...state, ...payload }));
            break;
          case 'OPEN_QUESTION':
            set({ activeQuestion: payload });
            break;
          case 'REVEAL_ANSWER':
            set(state => state.activeQuestion ? { activeQuestion: { ...state.activeQuestion, isRevealed: true } } : {});
            break;
          case 'CLOSE_QUESTION':
            set({ activeQuestion: null });
            break;
          case 'BUZZER_HIT':
            set({ buzzerLockedTeamId: payload.teamId, buzzerLockedTeamName: payload.teamName });
            sound.playBuzzer();
            break;
          case 'BUZZER_RESET':
            set({ buzzerLockedTeamId: null, buzzerLockedTeamName: null });
            break;
          case 'TIMER_ACTION':
            if (payload.action === 'start') set({ isTimerRunning: true });
            if (payload.action === 'pause') set({ isTimerRunning: false });
            if (payload.action === 'reset') set({ isTimerRunning: false, timerRemaining: payload.duration });
            break;
        }
      };
    }
  },

  setActiveView: (view: ViewMode) => {
    set({ activeView: view });
  },

  setupGame: (teamConfigs, winnerCount, enableTieBreaker) => {
    const teams: Team[] = teamConfigs.map((t, idx) => ({
      id: `t${idx + 1}`,
      name: t.name.trim() || `Tim ${idx + 1}`,
      score: 0,
      color: t.color
    }));

    set(state => {
      const updated = {
        teams,
        playedCellIds: [],
        playedTiebreakerIndices: [],
        scoreHistory: [],
        isSetupCompleted: true,
        settings: {
          ...state.settings,
          winnerCount,
          enableTieBreaker
        }
      };
      persistState(updated);
      broadcastSync('SYNC_STATE', updated);
      return updated;
    });
  },

  openQuestion: (question, categoryName, isTiebreaker = false, tbIndex = 0) => {
    sound.playClick();
    const active: ActiveQuestionState = {
      question,
      categoryName,
      isRevealed: false,
      isPlaying: false,
      isTiebreaker,
      tbIndex
    };
    const duration = get().settings.timerDuration || 20;

    set({ 
      activeQuestion: active,
      timerRemaining: duration,
      timerDuration: duration,
      isTimerRunning: false,
      buzzerLockedTeamId: null,
      buzzerLockedTeamName: null
    });

    broadcastSync('OPEN_QUESTION', active);
    broadcastSync('TIMER_ACTION', { action: 'reset', duration });
    broadcastSync('BUZZER_RESET', {});
  },

  revealAnswer: () => {
    sound.playClick();
    set(state => {
      if (!state.activeQuestion) return {};
      const active = { ...state.activeQuestion, isRevealed: true };
      broadcastSync('REVEAL_ANSWER', {});
      return { activeQuestion: active };
    });
  },

  closeQuestion: (markAsPlayed = true) => {
    const { activeQuestion, playedCellIds, playedTiebreakerIndices, categories } = get();
    if (!activeQuestion) return;

    let updatedPlayed = [...playedCellIds];
    let updatedTbPlayed = [...playedTiebreakerIndices];

    if (markAsPlayed) {
      if (activeQuestion.isTiebreaker && typeof activeQuestion.tbIndex === 'number') {
        if (!updatedTbPlayed.includes(activeQuestion.tbIndex)) {
          updatedTbPlayed.push(activeQuestion.tbIndex);
        }
      } else {
        if (!updatedPlayed.includes(activeQuestion.question.id)) {
          updatedPlayed.push(activeQuestion.question.id);
        }
      }
    }

    // Check completion
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const isCompleted = updatedPlayed.length >= totalQuestions && totalQuestions > 0;

    set({
      activeQuestion: null,
      playedCellIds: updatedPlayed,
      playedTiebreakerIndices: updatedTbPlayed,
      isTimerRunning: false,
      isLeaderboardOpen: isCompleted
    });

    persistState({ playedCellIds: updatedPlayed, playedTiebreakerIndices: updatedTbPlayed });
    broadcastSync('CLOSE_QUESTION', {});
    broadcastSync('SYNC_STATE', { playedCellIds: updatedPlayed, playedTiebreakerIndices: updatedTbPlayed, isLeaderboardOpen: isCompleted });

    if (isCompleted) {
      sound.playFanfare();
    }
  },

  toggleMediaPlayback: (isPlaying) => {
    set(state => {
      if (!state.activeQuestion) return {};
      const newStatus = isPlaying !== undefined ? isPlaying : !state.activeQuestion.isPlaying;
      return { activeQuestion: { ...state.activeQuestion, isPlaying: newStatus } };
    });
  },

  awardPoints: (teamId, customPoints) => {
    const { activeQuestion, teams, scoreHistory } = get();
    const points = customPoints ?? activeQuestion?.question.points ?? 100;
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    sound.playCorrect();

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, score: t.score + points } : t
    );

    const historyEntry: ScoreHistoryEntry = {
      id: 'hist_' + Date.now(),
      teamId,
      teamName: targetTeam.name,
      delta: points,
      questionTitle: activeQuestion?.question.title,
      timestamp: Date.now()
    };

    const newHistory = [historyEntry, ...scoreHistory].slice(0, 30);

    set({ teams: updatedTeams, scoreHistory: newHistory });
    persistState({ teams: updatedTeams, scoreHistory: newHistory });
    broadcastSync('SYNC_STATE', { teams: updatedTeams });
  },

  penalizePoints: (teamId, customPoints) => {
    const { activeQuestion, teams, scoreHistory } = get();
    const points = customPoints ?? activeQuestion?.question.points ?? 100;
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    sound.playWrong();

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, score: t.score - points } : t
    );

    const historyEntry: ScoreHistoryEntry = {
      id: 'hist_' + Date.now(),
      teamId,
      teamName: targetTeam.name,
      delta: -points,
      questionTitle: activeQuestion?.question.title,
      timestamp: Date.now()
    };

    const newHistory = [historyEntry, ...scoreHistory].slice(0, 30);

    set({ teams: updatedTeams, scoreHistory: newHistory });
    persistState({ teams: updatedTeams, scoreHistory: newHistory });
    broadcastSync('SYNC_STATE', { teams: updatedTeams });
  },

  adjustScore: (teamId, delta) => {
    const { teams, scoreHistory } = get();
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    if (delta > 0) sound.playCorrect();
    else sound.playWrong();

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, score: t.score + delta } : t
    );

    const historyEntry: ScoreHistoryEntry = {
      id: 'hist_' + Date.now(),
      teamId,
      teamName: targetTeam.name,
      delta,
      timestamp: Date.now()
    };

    set({ teams: updatedTeams, scoreHistory: [historyEntry, ...scoreHistory].slice(0, 30) });
    persistState({ teams: updatedTeams });
    broadcastSync('SYNC_STATE', { teams: updatedTeams });
  },

  undoLastScore: () => {
    const { scoreHistory, teams } = get();
    if (scoreHistory.length === 0) return;

    const [lastEntry, ...remainingHistory] = scoreHistory;
    const updatedTeams = teams.map(t => 
      t.id === lastEntry.teamId ? { ...t, score: t.score - lastEntry.delta } : t
    );

    sound.playClick();
    set({ teams: updatedTeams, scoreHistory: remainingHistory });
    persistState({ teams: updatedTeams, scoreHistory: remainingHistory });
    broadcastSync('SYNC_STATE', { teams: updatedTeams, scoreHistory: remainingHistory });
  },

  resetProgress: () => {
    const updatedTeams = get().teams.map(t => ({ ...t, score: 0 }));
    set({ 
      playedCellIds: [], 
      playedTiebreakerIndices: [], 
      teams: updatedTeams,
      scoreHistory: [],
      activeQuestion: null,
      isLeaderboardOpen: false 
    });
    persistState({ 
      playedCellIds: [], 
      playedTiebreakerIndices: [], 
      teams: updatedTeams, 
      scoreHistory: [] 
    });
    broadcastSync('SYNC_STATE', { 
      playedCellIds: [], 
      playedTiebreakerIndices: [], 
      teams: updatedTeams,
      isLeaderboardOpen: false 
    });
  },

  resetEntireGame: () => {
    get().resetProgress();
    set({ isSetupCompleted: false });
    persistState({ isSetupCompleted: false });
    broadcastSync('SYNC_STATE', { isSetupCompleted: false });
  },

  // Timer
  startTimer: () => {
    set({ isTimerRunning: true });
    broadcastSync('TIMER_ACTION', { action: 'start' });
  },

  pauseTimer: () => {
    set({ isTimerRunning: false });
    broadcastSync('TIMER_ACTION', { action: 'pause' });
  },

  resetTimer: (newDuration) => {
    const dur = newDuration ?? get().settings.timerDuration ?? 20;
    set({ timerRemaining: dur, timerDuration: dur, isTimerRunning: false });
    broadcastSync('TIMER_ACTION', { action: 'reset', duration: dur });
  },

  tickTimer: () => {
    const { timerRemaining, isTimerRunning } = get();
    if (!isTimerRunning) return;

    if (timerRemaining <= 1) {
      sound.playTimeUp();
      set({ timerRemaining: 0, isTimerRunning: false });
      broadcastSync('TIMER_ACTION', { action: 'pause' });
    } else {
      const next = timerRemaining - 1;
      if (next <= 5) sound.playTick();
      set({ timerRemaining: next });
    }
  },

  // Buzzer
  triggerBuzzer: (teamId) => {
    const { buzzerLockedTeamId, teams } = get();
    if (buzzerLockedTeamId) return; // Locked out!

    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    sound.playBuzzer();
    set({ buzzerLockedTeamId: team.id, buzzerLockedTeamName: team.name });
    broadcastSync('BUZZER_HIT', { teamId: team.id, teamName: team.name });
  },

  resetBuzzer: () => {
    sound.playClick();
    set({ buzzerLockedTeamId: null, buzzerLockedTeamName: null });
    broadcastSync('BUZZER_RESET', {});
  },

  // Modals
  openTiebreakerModal: () => set({ isTiebreakerModalOpen: true }),
  closeTiebreakerModal: () => set({ isTiebreakerModalOpen: false }),
  openLeaderboard: () => {
    sound.playFanfare();
    set({ isLeaderboardOpen: true });
    broadcastSync('SYNC_STATE', { isLeaderboardOpen: true });
  },
  closeLeaderboard: () => {
    set({ isLeaderboardOpen: false });
    broadcastSync('SYNC_STATE', { isLeaderboardOpen: false });
  },

  // Audience
  toggleAudiencePlayed: (id) => {
    const current = get().playedAudienceIds;
    const updated = current.includes(id) 
      ? current.filter(x => x !== id) 
      : [...current, id];
    set({ playedAudienceIds: updated });
    persistState({ playedAudienceIds: updated });
  },

  resetAudienceProgress: () => {
    set({ playedAudienceIds: [] });
    persistState({ playedAudienceIds: [] });
  },

  // Admin
  saveCategories: (categories) => {
    set({ categories });
    persistState({ categories });
    broadcastSync('SYNC_STATE', { categories });
  },

  saveTiebreakers: (tiebreakers) => {
    set({ tiebreakers });
    persistState({ tiebreakers });
    broadcastSync('SYNC_STATE', { tiebreakers });
  },

  saveAudienceQuestions: (audienceQuestions) => {
    set({ audienceQuestions });
    persistState({ audienceQuestions });
    broadcastSync('SYNC_STATE', { audienceQuestions });
  },

  toggleSfx: () => {
    const next = !get().settings.sfxEnabled;
    sound.setEnabled(next);
    get().updateSettings({ sfxEnabled: next });
    if (next) sound.playClick();
  },

  updateSettings: (newSettings) => {
    if (newSettings.sfxEnabled !== undefined) sound.setEnabled(newSettings.sfxEnabled);
    if (newSettings.sfxVolume !== undefined) sound.setVolume(newSettings.sfxVolume);
    if (newSettings.sfxProfile !== undefined) sound.setProfile(newSettings.sfxProfile);

    set(state => {
      const merged = { ...state.settings, ...newSettings };
      persistState({ settings: merged });
      broadcastSync('SYNC_STATE', { settings: merged });
      return { settings: merged };
    });
  },

  importAllData: (data) => {
    set(state => {
      const updated = {
        categories: data.categories || state.categories,
        tiebreakers: data.tiebreakers || state.tiebreakers,
        audienceQuestions: data.audience || state.audienceQuestions,
        settings: data.settings ? { ...state.settings, ...data.settings } : state.settings
      };
      persistState(updated);
      broadcastSync('SYNC_STATE', updated);
      return updated;
    });
  },

  restoreDefaults: () => {
    const def = {
      categories: DEFAULT_GAME_DATA,
      tiebreakers: DEFAULT_TIEBREAKER,
      audienceQuestions: DEFAULT_AUDIENCE_DATA,
      playedCellIds: [],
      playedTiebreakerIndices: [],
      playedAudienceIds: []
    };
    set(def);
    persistState(def);
    broadcastSync('SYNC_STATE', def);
  }
}));
