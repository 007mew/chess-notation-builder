import React, { useState } from 'react';
import { DrillSettings, Square, SquareColor } from '../../types';
import { BOARD_THEMES } from '../../utils/themes';
import { FILES, getQuadrant, getSquareColor, RANKS } from '../../utils/chess';
import { soundEngine } from '../../utils/audio';
import { Eye, EyeOff, HelpCircle, Layers, RefreshCw, Sparkles } from 'lucide-react';

export interface DrillMemorizeGridProps {
  settings: DrillSettings;
  onUpdateSettings: (newSettings: DrillSettings) => void;
}

type NamingConvention = 'black-white' | 'dark-light';
type DisplayStyle = 'full' | 'color-only' | 'initial' | 'coordinate-only';
type DiagonalHighlight = 'none' | 'a1-h8' | 'h1-a8' | 'c1-h6' | 'f1-a6';

export const DrillMemorizeGrid: React.FC<DrillMemorizeGridProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [naming, setNaming] = useState<NamingConvention>('black-white');
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('full');
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [revealedSquares, setRevealedSquares] = useState<Square[]>([]);
  const [activeDiagonal, setActiveDiagonal] = useState<DiagonalHighlight>('none');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>('e4');

  const theme = BOARD_THEMES[settings.theme] || BOARD_THEMES['neo-green'];

  const displayedFiles = settings.perspective === 'white' ? [...FILES] : [...FILES].reverse();
  const displayedRanks = settings.perspective === 'white' ? [...RANKS].reverse() : [...RANKS];

  const getColorLabel = (color: SquareColor) => {
    if (naming === 'black-white') {
      return color === 'dark' ? 'Black' : 'White';
    }
    return color === 'dark' ? 'Dark' : 'Light';
  };

  const getInitial = (color: SquareColor) => {
    if (naming === 'black-white') {
      return color === 'dark' ? 'B' : 'W';
    }
    return color === 'dark' ? 'D' : 'L';
  };

  // Diagonal square sets
  const getDiagonalSquares = (diag: DiagonalHighlight): Square[] => {
    switch (diag) {
      case 'a1-h8':
        return ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'];
      case 'h1-a8':
        return ['h1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7', 'a8'];
      case 'c1-h6':
        return ['c1', 'd2', 'e3', 'f4', 'g5', 'h6'];
      case 'f1-a6':
        return ['f1', 'e2', 'd3', 'c4', 'b5', 'a6'];
      default:
        return [];
    }
  };

  const highlightedDiagSquares = getDiagonalSquares(activeDiagonal);

  const handleSquareClick = (sq: Square) => {
    setSelectedSquare(sq);
    soundEngine.playKeyClick();

    if (isMasked) {
      // Toggle reveal in masked mode
      setRevealedSquares((prev) =>
        prev.includes(sq) ? prev.filter((s) => s !== sq) : [...prev, sq]
      );
    }
  };

  const revealAll = () => {
    const all: Square[] = [];
    FILES.forEach((f) => RANKS.forEach((r) => all.push(`${f}${r}` as Square)));
    setRevealedSquares(all);
  };

  const hideAll = () => {
    setRevealedSquares([]);
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full px-2 sm:px-4 pb-8">
      {/* Header Banner */}
      <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800 rounded-3xl p-5 mb-5 shadow-xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Section 8 • Grid Memorization Matrix
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-100">
          Chess Board Square Color Chart
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1 max-w-md mx-auto">
          Every square explicitly labeled with its coordinate and color (Black / White). Study the patterns, diagonals, and subconscious grid alignment.
        </p>
      </div>

      {/* Control Bar */}
      <div className="w-full max-w-[560px] bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          {/* Flip Perspective */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                perspective: settings.perspective === 'white' ? 'black' : 'white',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer transition-all"
            title="Flip Board Perspective"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="capitalize">{settings.perspective} POV</span>
          </button>

          {/* Black/White vs Dark/Light toggle */}
          <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setNaming('black-white')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                naming === 'black-white' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Black / White
            </button>
            <button
              type="button"
              onClick={() => setNaming('dark-light')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                naming === 'dark-light' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark / Light
            </button>
          </div>
        </div>

        {/* Display Style & Masking */}
        <div className="flex items-center gap-2">
          {/* Label style toggle */}
          <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setDisplayStyle('full')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                displayStyle === 'full' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full
            </button>
            <button
              type="button"
              onClick={() => setDisplayStyle('initial')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                displayStyle === 'initial' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Initials
            </button>
          </div>

          {/* Mask toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isMasked;
              setIsMasked(next);
              if (next) hideAll();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-all ${
              isMasked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-slate-100'
            }`}
            title="Mask board colors to test your active recall"
          >
            {isMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isMasked ? 'Mask ON (Recall)' : 'Mask Colors'}</span>
          </button>
        </div>
      </div>

      {/* Diagonal Pattern Filters */}
      <div className="w-full max-w-[560px] bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 mb-4 flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Diagonal Anchors:
        </span>
        {[
          { id: 'none', label: 'All Squares' },
          { id: 'a1-h8', label: 'a1–h8 (All Black)' },
          { id: 'h1-a8', label: 'h1–a8 (All White)' },
          { id: 'c1-h6', label: 'c1–h6' },
          { id: 'f1-a6', label: 'f1–a6' },
        ].map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveDiagonal(d.id as DiagonalHighlight)}
            className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              activeDiagonal === d.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Main 8x8 Memorization Board */}
      <div className="relative w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full select-none">
          {displayedRanks.map((rank, rankRowIdx) =>
            displayedFiles.map((file, fileColIdx) => {
              const square: Square = `${file}${rank}` as Square;
              const color = getSquareColor(square);
              const isDark = color === 'dark';
              const colorText = getColorLabel(color);
              const initialText = getInitial(color);

              const isSelected = selectedSquare === square;
              const isDiagActive = highlightedDiagSquares.includes(square);
              const isRevealed = !isMasked || revealedSquares.includes(square);

              const isBottomRow = rankRowIdx === 7;
              const isLeftCol = fileColIdx === 0;

              // Background styling
              let bgStyle = isDark
                ? { backgroundColor: theme.darkBg }
                : { backgroundColor: theme.lightBg };

              if (isMasked && !isRevealed) {
                bgStyle = { backgroundColor: '#1e293b' }; // neutral gray slate-800
              }

              return (
                <button
                  key={square}
                  type="button"
                  onClick={() => handleSquareClick(square)}
                  style={bgStyle}
                  className={`relative flex flex-col items-center justify-center p-0.5 cursor-pointer focus:outline-none transition-all duration-150 border border-black/10 group ${
                    isSelected ? 'ring-3 ring-emerald-400 z-10 scale-102 shadow-lg' : 'hover:brightness-105'
                  } ${isDiagActive ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                >
                  {/* Coordinate Label (e.g. e4) */}
                  <span
                    className={`font-mono font-black text-xs sm:text-sm tracking-tight leading-none uppercase ${
                      isMasked && !isRevealed
                        ? 'text-slate-300'
                        : isDark
                        ? theme.darkText
                        : theme.lightText
                    }`}
                  >
                    {square}
                  </span>

                  {/* Explicit Color Name (e.g. BLACK / WHITE) */}
                  {isRevealed ? (
                    <span
                      className={`font-mono font-bold text-[9px] sm:text-[11px] leading-tight mt-1 tracking-wider uppercase px-1 py-0.5 rounded shadow-xs ${
                        isDark
                          ? 'bg-slate-950/80 text-white border border-slate-700/80'
                          : 'bg-white/90 text-slate-950 border border-slate-300'
                      }`}
                    >
                      {displayStyle === 'initial' ? initialText : colorText}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-amber-400/80 mt-1 font-bold">
                      Tap to reveal
                    </span>
                  )}

                  {/* Edge Coordinates */}
                  {settings.showCoordinates && isBottomRow && (
                    <span
                      style={{ color: isDark ? theme.darkText : theme.lightText }}
                      className="absolute bottom-0.5 right-1 font-mono font-bold text-[8px] pointer-events-none opacity-50"
                    >
                      {file}
                    </span>
                  )}
                  {settings.showCoordinates && isLeftCol && (
                    <span
                      style={{ color: isDark ? theme.darkText : theme.lightText }}
                      className="absolute top-0.5 left-1 font-mono font-bold text-[8px] pointer-events-none opacity-50"
                    >
                      {rank}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Mask Controls if in Mask Mode */}
      {isMasked && (
        <div className="flex items-center gap-3 mt-4 text-xs font-mono">
          <button
            type="button"
            onClick={revealAll}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer"
          >
            Reveal All Squares
          </button>
          <button
            type="button"
            onClick={hideAll}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 font-bold transition-all cursor-pointer"
          >
            Hide All (Restart Test)
          </button>
          <span className="text-slate-400">
            Revealed: {revealedSquares.length} / 64
          </span>
        </div>
      )}

      {/* Selected Square Diagnostic Card */}
      {selectedSquare && (
        <div className="w-full max-w-[560px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mt-5 flex items-center justify-between shadow-xl font-mono">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-400 uppercase">
              {selectedSquare}
            </span>
            <div>
              <div className="text-xs font-bold text-slate-200">
                {getColorLabel(getSquareColor(selectedSquare)).toUpperCase()} SQUARE
              </div>
              <div className="text-[11px] text-slate-400">
                Quadrant: {getQuadrant(selectedSquare)} • File {selectedSquare[0].toUpperCase()}, Rank {selectedSquare[1]}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Formula</div>
            <div className="text-xs text-slate-300 font-bold">
              {selectedSquare[0].charCodeAt(0) - 97} + {parseInt(selectedSquare[1]) - 1} ={' '}
              {(selectedSquare[0].charCodeAt(0) - 97 + parseInt(selectedSquare[1]) - 1) % 2 === 0
                ? 'Even (Dark)'
                : 'Odd (Light)'}
            </div>
          </div>
        </div>
      )}

      {/* Rules / Memory Hacks Accordion */}
      <div className="w-full max-w-[560px] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mt-4 font-mono text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Mastery Memory Anchors:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
          <li>
            <strong className="text-slate-300">White on Right:</strong> The bottom-right corner square (<strong className="text-emerald-300">h1</strong>) is ALWAYS Light (White).
          </li>
          <li>
            <strong className="text-slate-300">a1 is Dark (Black):</strong> Top-left of rank 1 is always Dark.
          </li>
          <li>
            <strong className="text-slate-300">Long Diagonals:</strong> The main diagonal <strong className="text-emerald-300">a1 to h8</strong> is 100% Dark (Black). The counter-diagonal <strong className="text-emerald-300">h1 to a8</strong> is 100% Light (White).
          </li>
          <li>
            <strong className="text-slate-300">Center Quad:</strong> <code>d4</code> and <code>e5</code> are Dark (Black); <code>e4</code> and <code>d5</code> are Light (White).
          </li>
        </ul>
      </div>
    </div>
  );
};
