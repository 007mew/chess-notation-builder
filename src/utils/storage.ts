import { ALL_SQUARES, getQuadrant, getRandomSquare } from './chess';
import { DrillMode, DrillSettings, Square, SquareStats, UserStats } from '../types';

const STATS_KEY = 'boardsight_user_stats_v1';
const SETTINGS_KEY = 'boardsight_settings_v1';

export const DEFAULT_SETTINGS: DrillSettings = {
  soundEnabled: true,
  speechEnabled: false,
  speechRate: 1.15,
  theme: 'neo-green',
  perspective: 'white',
  autoFlipPerspective: false,
  ghostMode: false,
  showCoordinates: true,
  metronomeBpm: 0,
  crosshairGuide: true,
};

function createInitialSquareStats(square: Square): SquareStats {
  return {
    square,
    attempts: 0,
    hits: 0,
    misses: 0,
    totalReactionMs: 0,
    avgReactionMs: 0,
    isTrouble: false,
    consecutiveFastHits: 0,
    lastPracticed: 0,
  };
}

export function getInitialUserStats(): UserStats {
  const squares: Record<Square, SquareStats> = {} as Record<Square, SquareStats>;
  ALL_SQUARES.forEach((sq) => {
    squares[sq] = createInitialSquareStats(sq);
  });

  return {
    squares,
    totalAttempts: 0,
    totalHits: 0,
    totalMisses: 0,
    colorTestsAttempted: 0,
    colorTestsMissed: 0,
    highScores: {
      lightDarkSprint: 0,
      lightDarkBlitz: 0,
      targetStrikeSprint: 0,
      fastTypeSprint: 0,
      blindfoldStreak: 0,
      knightHopStreak: 0,
      deathrunScore: 0,
    },
    streak: 0,
    maxStreak: 0,
    recentReps: [],
  };
}

export function loadSettings(): DrillSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: DrillSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all 64 squares exist
      const initial = getInitialUserStats();
      ALL_SQUARES.forEach((sq) => {
        if (!parsed.squares[sq]) {
          parsed.squares[sq] = createInitialSquareStats(sq);
        }
      });
      return {
        ...initial,
        ...parsed,
        squares: { ...initial.squares, ...parsed.squares },
        highScores: { ...initial.highScores, ...(parsed.highScores || {}) },
      };
    }
  } catch {
    // ignore
  }
  return getInitialUserStats();
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Spaced Repetition Queue Manager
 * Injects trouble squares 3 times within the next 15 prompts
 */
class SRSManager {
  private queue: Square[] = [];

  public registerMiss(square: Square) {
    // Insert square 3 times spaced out across the upcoming queue
    const positions = [1, 4, 8];
    positions.forEach((pos) => {
      if (pos < this.queue.length) {
        this.queue.splice(pos, 0, square);
      } else {
        this.queue.push(square);
      }
    });
  }

  public getNextSquare(stats: UserStats): Square {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    // Prioritize trouble squares if any exist in stats with low probability
    const troubleSquares = ALL_SQUARES.filter((sq) => stats.squares[sq]?.isTrouble);
    if (troubleSquares.length > 0 && Math.random() < 0.35) {
      return troubleSquares[Math.floor(Math.random() * troubleSquares.length)];
    }

    return getRandomSquare();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const srsManager = new SRSManager();

/**
 * Updates stats after an attempt
 */
export function recordAttempt(
  stats: UserStats,
  square: Square,
  reactionMs: number,
  isCorrect: boolean,
  mode: DrillMode
): { updatedStats: UserStats; clearedTrouble: boolean; becameTrouble: boolean } {
  const nextStats: UserStats = {
    ...stats,
    squares: { ...stats.squares },
    recentReps: [...stats.recentReps],
  };

  const sqStat = { ...(nextStats.squares[square] || createInitialSquareStats(square)) };
  sqStat.attempts += 1;
  sqStat.lastPracticed = Date.now();

  let clearedTrouble = false;
  let becameTrouble = false;

  if (isCorrect) {
    sqStat.hits += 1;
    sqStat.totalReactionMs += reactionMs;
    sqStat.avgReactionMs = Math.round(sqStat.totalReactionMs / sqStat.hits);

    // Fast hit condition (<800ms)
    if (reactionMs < 800) {
      sqStat.consecutiveFastHits += 1;
      if (sqStat.isTrouble && sqStat.consecutiveFastHits >= 2) {
        sqStat.isTrouble = false;
        clearedTrouble = true;
      }
    } else {
      sqStat.consecutiveFastHits = 0;
    }

    nextStats.totalHits += 1;
    nextStats.streak += 1;
    if (nextStats.streak > nextStats.maxStreak) {
      nextStats.maxStreak = nextStats.streak;
    }
  } else {
    sqStat.misses += 1;
    sqStat.consecutiveFastHits = 0;
    if (!sqStat.isTrouble) {
      sqStat.isTrouble = true;
      becameTrouble = true;
    }
    srsManager.registerMiss(square);

    nextStats.totalMisses += 1;
    nextStats.streak = 0;
  }

  nextStats.totalAttempts += 1;
  nextStats.squares[square] = sqStat;

  // Track color confusion specifically for Mode 1
  if (mode === 'light-dark') {
    nextStats.colorTestsAttempted += 1;
    if (!isCorrect) {
      nextStats.colorTestsMissed += 1;
    }
  }

  // Keep last 40 reps for performance curve
  nextStats.recentReps.push({
    timestamp: Date.now(),
    square,
    reactionMs,
    correct: isCorrect,
    mode,
  });
  if (nextStats.recentReps.length > 50) {
    nextStats.recentReps.shift();
  }

  saveUserStats(nextStats);

  return { updatedStats: nextStats, clearedTrouble, becameTrouble };
}

/**
 * Diagnostics calculations
 */
export function calculateDiagnostics(stats: UserStats) {
  const quadrants: Record<string, { attempts: number; misses: number; totalTime: number; squares: Square[] }> = {
    'White Queenside': { attempts: 0, misses: 0, totalTime: 0, squares: [] },
    'White Kingside': { attempts: 0, misses: 0, totalTime: 0, squares: [] },
    'Black Queenside': { attempts: 0, misses: 0, totalTime: 0, squares: [] },
    'Black Kingside': { attempts: 0, misses: 0, totalTime: 0, squares: [] },
  };

  ALL_SQUARES.forEach((sq) => {
    const quad = getQuadrant(sq);
    const sqStat = stats.squares[sq];
    quadrants[quad].squares.push(sq);
    if (sqStat) {
      quadrants[quad].attempts += sqStat.attempts;
      quadrants[quad].misses += sqStat.misses;
      quadrants[quad].totalTime += sqStat.totalReactionMs;
    }
  });

  // Calculate error rate per quadrant
  let weakestQuadName = 'White Queenside';
  let highestErrorRate = -1;

  Object.entries(quadrants).forEach(([name, data]) => {
    const errorRate = data.attempts > 0 ? data.misses / data.attempts : 0;
    if (errorRate > highestErrorRate) {
      highestErrorRate = errorRate;
      weakestQuadName = name;
    }
  });

  // Trouble squares list
  const troubleList = ALL_SQUARES.filter((sq) => stats.squares[sq]?.isTrouble);

  // Color Confusion Index (% of light/dark tests missed)
  const colorConfusionIndex =
    stats.colorTestsAttempted > 0
      ? Math.round((stats.colorTestsMissed / stats.colorTestsAttempted) * 100)
      : 0;

  // Overall accuracy
  const overallAccuracy =
    stats.totalAttempts > 0
      ? Math.round((stats.totalHits / stats.totalAttempts) * 100)
      : 100;

  // Average reaction time of all hits
  let totalTime = 0;
  let totalHits = 0;
  ALL_SQUARES.forEach((sq) => {
    const s = stats.squares[sq];
    if (s && s.hits > 0) {
      totalTime += s.totalReactionMs;
      totalHits += s.hits;
    }
  });
  const avgReactionTime = totalHits > 0 ? Math.round(totalTime / totalHits) : 0;

  return {
    weakestQuadName,
    highestErrorRate: Math.round(highestErrorRate * 100),
    troubleList,
    colorConfusionIndex,
    overallAccuracy,
    avgReactionTime,
  };
}

/**
 * Builds an interactive post-drill performance summary with letter grades
 */
export function calculateSessionSummary(
  mode: DrillMode,
  reps: { square: Square; reactionMs: number; correct: boolean }[],
  maxStreak: number
): import('../types').SessionSummary {
  const totalReps = reps.length;
  const correctHits = reps.filter((r) => r.correct).length;
  const accuracyPercent = totalReps > 0 ? Math.round((correctHits / totalReps) * 100) : 0;

  const hitReps = reps.filter((r) => r.correct);
  const avgReactionMs = hitReps.length > 0
    ? Math.round(hitReps.reduce((acc, curr) => acc + curr.reactionMs, 0) / hitReps.length)
    : 0;

  const sortedHits = [...hitReps].sort((a, b) => a.reactionMs - b.reactionMs);
  const fastestSquares = sortedHits.slice(0, 3).map((r) => ({ square: r.square, reactionMs: r.reactionMs }));
  const slowestSquares = sortedHits.slice(-3).reverse().map((r) => ({ square: r.square, reactionMs: r.reactionMs }));
  const troubleSquaresCreated = reps.filter((r) => !r.correct).map((r) => r.square);

  // Grade calculation:
  // S+: <650ms, >=95% accuracy
  // S: <850ms, >=90% accuracy
  // A: <1100ms, >=85% accuracy
  // B: <1500ms, >=75% accuracy
  // C: <2000ms, >=60% accuracy
  // D: otherwise
  let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (accuracyPercent >= 95 && avgReactionMs < 650) {
    grade = 'S+';
  } else if (accuracyPercent >= 90 && avgReactionMs < 850) {
    grade = 'S';
  } else if (accuracyPercent >= 85 && avgReactionMs < 1100) {
    grade = 'A';
  } else if (accuracyPercent >= 75 && avgReactionMs < 1500) {
    grade = 'B';
  } else if (accuracyPercent >= 60 && avgReactionMs < 2000) {
    grade = 'C';
  }

  return {
    mode,
    totalReps,
    correctHits,
    accuracyPercent,
    avgReactionMs,
    maxStreak,
    slowestSquares,
    fastestSquares,
    troubleSquaresCreated: Array.from(new Set(troubleSquaresCreated)),
    grade,
  };
}
