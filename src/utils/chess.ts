import { FileLetter, RankNumber, Square, SquareColor } from '../types';

export const FILES: FileLetter[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: RankNumber[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const ALL_SQUARES: Square[] = FILES.flatMap((file) =>
  RANKS.map((rank) => `${file}${rank}` as Square)
);

/**
 * Standard chess board rule:
 * a1 is dark.
 * Formula: (fileIndex + rankIndex) % 2 === 0 -> dark, !== 0 -> light.
 * Example: a1 -> 0 + 0 = 0 (dark)
 * Example: e4 -> 4 + 3 = 7 (light)
 * Example: d4 -> 3 + 3 = 6 (dark)
 */
export function getSquareColor(square: Square): SquareColor {
  const fileIdx = square.charCodeAt(0) - 97; // a=0, b=1, ...
  const rankIdx = parseInt(square[1], 10) - 1; // 1=0, 2=1, ...
  return (fileIdx + rankIdx) % 2 === 0 ? 'dark' : 'light';
}

export function getRandomSquare(exclude?: Square): Square {
  let sq: Square;
  do {
    const file = FILES[Math.floor(Math.random() * FILES.length)];
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    sq = `${file}${rank}` as Square;
  } while (exclude && sq === exclude);
  return sq;
}

export function getFile(sq: Square): FileLetter {
  return sq[0] as FileLetter;
}

export function getRank(sq: Square): RankNumber {
  return sq[1] as RankNumber;
}

export function getQuadrant(square: Square): 'White Queenside' | 'White Kingside' | 'Black Queenside' | 'Black Kingside' {
  const file = square[0];
  const rank = parseInt(square[1], 10);
  const isQueenside = ['a', 'b', 'c', 'd'].includes(file);
  const isWhite = rank <= 4;

  if (isWhite) {
    return isQueenside ? 'White Queenside' : 'White Kingside';
  } else {
    return isQueenside ? 'Black Queenside' : 'Black Kingside';
  }
}

/**
 * Calculate all valid knight jumps from a given square
 */
export function getKnightMoves(square: Square): Square[] {
  const fileIdx = square.charCodeAt(0) - 97;
  const rankIdx = parseInt(square[1], 10) - 1;
  const deltas = [
    [1, 2], [1, -2], [-1, 2], [-1, -2],
    [2, 1], [2, -1], [-2, 1], [-2, -1]
  ];

  const results: Square[] = [];
  for (const [df, dr] of deltas) {
    const nf = fileIdx + df;
    const nr = rankIdx + dr;
    if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) {
      results.push(`${FILES[nf]}${RANKS[nr]}` as Square);
    }
  }
  return results.sort();
}

/**
 * Check if two squares are on the same diagonal
 */
export function areOnSameDiagonal(sq1: Square, sq2: Square): boolean {
  const f1 = sq1.charCodeAt(0) - 97;
  const r1 = parseInt(sq1[1], 10) - 1;
  const f2 = sq2.charCodeAt(0) - 97;
  const r2 = parseInt(sq2[1], 10) - 1;
  return Math.abs(f1 - f2) === Math.abs(r1 - r2) && sq1 !== sq2;
}

/**
 * Get intermediate squares between two squares on the same diagonal or line
 */
export function getIntermediateSquares(sq1: Square, sq2: Square): Square[] {
  const f1 = sq1.charCodeAt(0) - 97;
  const r1 = parseInt(sq1[1], 10) - 1;
  const f2 = sq2.charCodeAt(0) - 97;
  const r2 = parseInt(sq2[1], 10) - 1;

  const df = Math.sign(f2 - f1);
  const dr = Math.sign(r2 - r1);

  if (Math.abs(f1 - f2) !== Math.abs(r1 - r2) && f1 !== f2 && r1 !== r2) {
    return [];
  }

  const intermediates: Square[] = [];
  let curF = f1 + df;
  let curR = r1 + dr;

  while (curF !== f2 || curR !== r2) {
    intermediates.push(`${FILES[curF]}${RANKS[curR]}` as Square);
    curF += df;
    curR += dr;
  }
  return intermediates;
}

export interface BlindfoldQuestion {
  id: string;
  type: 'diagonal-intersect' | 'color' | 'bishop-route' | 'knight-target';
  prompt: string;
  subtext?: string;
  targetAnswers: string[]; // lowercase coordinates or 'dark' | 'light'
  options?: string[]; // for multiple choice when suitable
  expectedType: 'coordinate' | 'color';
}

/**
 * Generates sharp mental projection questions for Mode 4
 */
export function generateBlindfoldQuestion(): BlindfoldQuestion {
  const questionType = Math.floor(Math.random() * 4);

  if (questionType === 0) {
    // Intermediate diagonal square
    const diagonals: [Square, Square][] = [
      ['c1', 'g5'], ['a1', 'h8'], ['f1', 'a6'], ['b2', 'g7'],
      ['h1', 'a8'], ['c8', 'g4'], ['a3', 'f8'], ['d1', 'h5'],
      ['b1', 'h7'], ['e1', 'a5'], ['b8', 'h2'], ['f8', 'a3']
    ];
    const pair = diagonals[Math.floor(Math.random() * diagonals.length)];
    const intermediates = getIntermediateSquares(pair[0], pair[1]);

    return {
      id: `diag-${Date.now()}`,
      type: 'diagonal-intersect',
      prompt: `Path from ${pair[0].toUpperCase()} to ${pair[1].toUpperCase()}`,
      subtext: `Name any square intersected between them on the diagonal`,
      targetAnswers: intermediates.map((s) => s.toLowerCase()),
      expectedType: 'coordinate',
    };
  } else if (questionType === 1) {
    // Color of intersection
    const sq = getRandomSquare();
    const color = getSquareColor(sq);
    return {
      id: `color-${Date.now()}`,
      type: 'color',
      prompt: `Intersection of ${sq[0].toUpperCase()}-file and Rank ${sq[1]}`,
      subtext: `Is this square Light or Dark?`,
      targetAnswers: [color],
      options: ['light', 'dark'],
      expectedType: 'color',
    };
  } else if (questionType === 2) {
    // Bishop 2-move route intermediate
    // Bishop from A to B: find a square C such that A and C are diagonal, and C and B are diagonal
    const bishops: { from: Square; to: Square; intermediates: Square[] }[] = [
      { from: 'c1', to: 'f7', intermediates: ['d2', 'e3', 'e1', 'd4', 'b2', 'a3', 'g5', 'h6'] },
      { from: 'f1', to: 'c7', intermediates: ['e2', 'd3', 'd1', 'e4', 'g2', 'h3', 'b5', 'a6'] },
      { from: 'c8', to: 'f2', intermediates: ['d7', 'e6', 'b7', 'a6', 'g4', 'h3'] },
      { from: 'f8', to: 'c2', intermediates: ['e7', 'd6', 'g7', 'h6', 'b4', 'a3'] },
    ];
    const item = bishops[Math.floor(Math.random() * bishops.length)];
    // Filter intermediates to those strictly sharing color and diagonal
    const valid = item.intermediates.filter(
      (sq) => areOnSameDiagonal(item.from, sq) && areOnSameDiagonal(sq, item.to)
    );

    return {
      id: `bishop-${Date.now()}`,
      type: 'bishop-route',
      prompt: `Bishop starts on ${item.from.toUpperCase()} and reaches ${item.to.toUpperCase()} in 2 moves`,
      subtext: `Name a valid intermediate diagonal pivot square`,
      targetAnswers: valid.length > 0 ? valid : item.intermediates,
      expectedType: 'coordinate',
    };
  } else {
    // Knight hop mental question
    const origins: Square[] = ['b1', 'g1', 'c3', 'f3', 'd4', 'e5', 'd5', 'e4'];
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const moves = getKnightMoves(origin);
    const targetRank = (Math.random() > 0.5 ? '3' : '4') as RankNumber;
    const matchingMoves = moves.filter((m) => m[1] === targetRank);

    if (matchingMoves.length > 0) {
      return {
        id: `knight-${Date.now()}`,
        type: 'knight-target',
        prompt: `Knight on ${origin.toUpperCase()}`,
        subtext: `Which square can it jump to on Rank ${targetRank}?`,
        targetAnswers: matchingMoves,
        expectedType: 'coordinate',
      };
    } else {
      // Pick random knight landing square
      return {
        id: `knight-${Date.now()}`,
        type: 'knight-target',
        prompt: `Knight on ${origin.toUpperCase()}`,
        subtext: `Name any legal square it can jump to`,
        targetAnswers: moves,
        expectedType: 'coordinate',
      };
    }
  }
}
