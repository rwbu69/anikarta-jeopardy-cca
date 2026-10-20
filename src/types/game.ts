export interface Question {
  id: string;
  points: number;
  title: string;
  artist: string;
  audio: string;
  video?: string;
  snippetStart?: number; // seconds
  snippetDuration?: number; // seconds
  trivia?: string;
}

export interface Category {
  id: string;
  category: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
  isBuzzed?: boolean;
  buzzedAt?: number;
}

export interface TiebreakerItem {
  category: string;
  question: Question;
}

export interface AudienceItem {
  id: string;
  number: number;
  title: string;
  artist: string;
  audio: string;
  video?: string;
  isPlayed?: boolean;
}

export interface GameSettings {
  winnerCount: number;
  enableTieBreaker: boolean;
  enableBuzzer: boolean;
  timerDuration: number;
  penaltyOnWrong: boolean;
  eventTitle: string;
  logoPath?: string;
  theme: 'visual-novel' | 'retro-karaoke';
  // SFX Customization
  sfxEnabled: boolean;
  sfxVolume: number; // 0.0 - 1.0
  sfxProfile: 'arcade' | 'gameshow' | 'minimal';
  // Mascot Customization
  showMascotNavbar: boolean;
  showMascotModal: boolean;
  showMascotStage: boolean;
  showMascotSetup: boolean;
}

export interface ActiveQuestionState {
  question: Question;
  categoryName: string;
  isRevealed: boolean;
  isPlaying: boolean;
  isTiebreaker?: boolean;
  tbIndex?: number;
}

export interface ScoreHistoryEntry {
  id: string;
  teamId: string;
  teamName: string;
  delta: number;
  questionTitle?: string;
  timestamp: number;
}

export type ViewMode = 'game' | 'host' | 'stage' | 'audience' | 'admin';
