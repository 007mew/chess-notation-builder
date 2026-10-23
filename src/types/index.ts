export type FileLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type RankNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Square = `${FileLetter}${RankNumber}`;

export type SquareColor = 'light' | 'dark';

export type DrillMode =
  | 'light-dark'
  | 'target-strike'
  | 'fast-type'
  | 'blindfold'
  | 'knight-hop'
  | 'deathrun';

export type BoardThemeId =
  | 'classic-walnut'
  | 'clean-slate'
  | 'neo-green'
  | 'lichess-wood'
  | 'cyber-neon';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightBg: string;
  darkBg: string;
  lightText: string;
  darkText: string;
  borderClass?: string;
}

export interface BoardArrow {
  from: Square;
  to: Square;
  color?: string;
}

export interface SquareStats {
  square: Square;
  attempts: number;
  hits: number;
  misses: number;
  totalReactionMs: number;
  avgReactionMs: number;
  isTrouble: boolean;
  consecutiveFastHits: number;
  lastPracticed: number;
}

export interface UserStats {
  squares: Record<Square, SquareStats>;
  totalAttempts: number;
  totalHits: number;
  totalMisses: number;
  colorTestsAttempted: number;
  colorTestsMissed: number;
  highScores: {
    lightDarkSprint: number;
    lightDarkBlitz: number;
    targetStrikeSprint: number;
    fastTypeSprint: number;
    blindfoldStreak: number;
    knightHopStreak: number;
    deathrunScore: number;
  };
  streak: number;
  maxStreak: number;
  recentReps: {
    timestamp: number;
    square: Square;
    reactionMs: number;
    correct: boolean;
    mode: DrillMode;
  }[];
}

export interface DrillSettings {
  soundEnabled: boolean;
  speechEnabled: boolean;
  speechRate: number;
  theme: BoardThemeId;
  perspective: 'white' | 'black';
  autoFlipPerspective: boolean;
  ghostMode: boolean; // edge labels fade 20% every 10 streak
  showCoordinates: boolean;
  metronomeBpm: number; // 0 = off, 60, 90, 120, 150
  crosshairGuide: boolean; // Hover highlights file & rank
}

export interface SessionSummary {
  mode: DrillMode;
  totalReps: number;
  correctHits: number;
  accuracyPercent: number;
  avgReactionMs: number;
  maxStreak: number;
  slowestSquares: { square: Square; reactionMs: number }[];
  fastestSquares: { square: Square; reactionMs: number }[];
  troubleSquaresCreated: Square[];
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
}
