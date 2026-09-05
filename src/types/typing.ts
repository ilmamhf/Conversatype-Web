export type CharStatus = 'pending' | 'correct' | 'incorrect';

export interface TypedCharRecord {
  expected: string;
  typed: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface WpmSample {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TypingMetrics {
  wpm: number;
  rawWpm: number;
  accuracy: number; // 0 to 100
  errors: number;
  totalCharsTyped: number;
  correctCharsTyped: number;
  elapsedSeconds: number;
  wpmHistory: WpmSample[];
}

export type TypingStatus = 'idle' | 'typing' | 'waiting_npc' | 'finished';

export type RankTier = 'S' | 'A' | 'B' | 'C' | 'D';
