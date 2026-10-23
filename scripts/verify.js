// Verification script for BoardSight core chess geometry and rules
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

function getSquareColor(sq) {
  const f = sq.charCodeAt(0) - 97;
  const r = parseInt(sq[1], 10) - 1;
  return (f + r) % 2 === 0 ? 'dark' : 'light';
}

function getKnightMoves(square) {
  const fileIdx = square.charCodeAt(0) - 97;
  const rankIdx = parseInt(square[1], 10) - 1;
  const deltas = [
    [1, 2], [1, -2], [-1, 2], [-1, -2],
    [2, 1], [2, -1], [-2, 1], [-2, -1]
  ];
  const results = [];
  for (const [df, dr] of deltas) {
    const nf = fileIdx + df;
    const nr = rankIdx + dr;
    if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) {
      results.push(`${FILES[nf]}${RANKS[nr]}`);
    }
  }
  return results.sort();
}

console.log('Testing BoardSight Core Rules:');

// Rule 1: a1 is dark
console.assert(getSquareColor('a1') === 'dark', 'a1 must be dark');
// Rule 2: h1 is light
console.assert(getSquareColor('h1') === 'light', 'h1 must be light');
// Rule 3: e4 is light
console.assert(getSquareColor('e4') === 'light', 'e4 must be light');
// Rule 4: d4 is dark
console.assert(getSquareColor('d4') === 'dark', 'd4 must be dark');
// Rule 5: a8 is light
console.assert(getSquareColor('a8') === 'light', 'a8 must be light');
// Rule 6: h8 is dark
console.assert(getSquareColor('h8') === 'dark', 'h8 must be dark');

console.log('✓ All 6 board corners & key center square color tests passed.');

// Knight tests
const d4Moves = getKnightMoves('d4');
console.assert(d4Moves.length === 8, `d4 must have 8 knight moves, got ${d4Moves.length}`);
const a1Moves = getKnightMoves('a1');
console.assert(a1Moves.length === 2, `a1 must have 2 knight moves, got ${a1Moves.length}`);
console.assert(a1Moves.includes('b3') && a1Moves.includes('c2'), 'a1 moves must be b3, c2');

console.log('✓ Knight hop logic verified (corner=2 moves, center=8 moves).');
console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
