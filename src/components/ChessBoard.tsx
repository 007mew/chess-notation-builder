import React from 'react';
import { BoardThemeId, Square } from '../types';
import { BOARD_THEMES } from '../utils/themes';
import { FILES, getSquareColor, RANKS } from '../utils/chess';

export interface ChessBoardProps {
  perspective?: 'white' | 'black';
  themeId?: BoardThemeId;
  showCoordinates?: boolean;
  ghostOpacity?: number; // 0 to 1
  highlightSquares?: Square[];
  targetSquare?: Square | null;
  wrongSquare?: Square | null;
  knightSquare?: Square | null;
  legalKnightMoves?: Square[];
  selectedSquares?: Square[];
  onSquareClick?: (square: Square) => void;
  interactive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  faintOutline?: boolean; // for Blindfold Commando mode
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  perspective = 'white',
  themeId = 'neo-green',
  showCoordinates = true,
  ghostOpacity = 1.0,
  highlightSquares = [],
  targetSquare = null,
  wrongSquare = null,
  knightSquare = null,
  legalKnightMoves = [],
  selectedSquares = [],
  onSquareClick,
  interactive = true,
  className = '',
  size = 'lg',
  faintOutline = false,
}) => {
  const theme = BOARD_THEMES[themeId] || BOARD_THEMES['neo-green'];

  const displayedFiles = perspective === 'white' ? [...FILES] : [...FILES].reverse();
  const displayedRanks = perspective === 'white' ? [...RANKS].reverse() : [...RANKS];

  const sizeClasses = {
    sm: 'w-64 h-64 text-[10px]',
    md: 'w-80 h-80 sm:w-96 sm:h-96 text-xs',
    lg: 'w-full max-w-[480px] aspect-square text-xs sm:text-sm',
  };

  return (
    <div
      className={`relative select-none rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-700/60 ${theme.borderClass || ''} ${sizeClasses[size]} ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Board Grid */}
      <div className={`grid grid-cols-8 grid-rows-8 w-full h-full ${faintOutline ? 'opacity-20 blur-[1px]' : 'opacity-100'} transition-opacity duration-300`}>
        {displayedRanks.map((rank, rankRowIdx) =>
          displayedFiles.map((file, fileColIdx) => {
            const square: Square = `${file}${rank}` as Square;
            const color = getSquareColor(square);
            const isDark = color === 'dark';

            const isTarget = targetSquare === square;
            const isWrong = wrongSquare === square;
            const isHighlighted = highlightSquares.includes(square);
            const isKnight = knightSquare === square;
            const isLegalKnightMove = legalKnightMoves.includes(square);
            const isSelected = selectedSquares.includes(square);

            const isBottomRow = rankRowIdx === 7;
            const isLeftCol = fileColIdx === 0;

            const bgStyle = isDark
              ? { backgroundColor: theme.darkBg }
              : { backgroundColor: theme.lightBg };

            return (
              <button
                key={square}
                type="button"
                onClick={() => interactive && onSquareClick?.(square)}
                disabled={!interactive}
                data-square={square}
                aria-label={`Square ${square}`}
                style={bgStyle}
                className={`relative flex items-center justify-center p-0 m-0 cursor-pointer focus:outline-none transition-colors duration-150 group ${
                  !interactive ? 'cursor-default' : 'active:brightness-90'
                }`}
              >
                {/* Edge File Labels (along bottom edge of board) */}
                {showCoordinates && isBottomRow && (
                  <span
                    style={{
                      opacity: ghostOpacity,
                      color: isDark ? theme.darkText : theme.lightText,
                    }}
                    className="absolute bottom-0.5 right-1 font-mono font-bold pointer-events-none transition-opacity duration-300 text-[10px] sm:text-xs leading-none"
                  >
                    {file}
                  </span>
                )}

                {/* Edge Rank Labels (along left edge of board) */}
                {showCoordinates && isLeftCol && (
                  <span
                    style={{
                      opacity: ghostOpacity,
                      color: isDark ? theme.darkText : theme.lightText,
                    }}
                    className="absolute top-0.5 left-1 font-mono font-bold pointer-events-none transition-opacity duration-300 text-[10px] sm:text-xs leading-none"
                  >
                    {rank}
                  </span>
                )}

                {/* Target Reticle / Highlight Indicator */}
                {isTarget && (
                  <div className="absolute inset-0 bg-emerald-500/40 border-2 border-emerald-400 flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </div>
                )}

                {/* Highlighted square (e.g. for Fast Type prompt or review) */}
                {isHighlighted && !isTarget && !isWrong && (
                  <div className="absolute inset-0 bg-amber-400/35 border-2 border-amber-300 ring-2 ring-amber-400/20" />
                )}

                {/* Wrong Square flash */}
                {isWrong && (
                  <div className="absolute inset-0 bg-red-600/70 border-2 border-red-500 animate-shake flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✕</span>
                  </div>
                )}

                {/* Selected square mark */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/45 border-2 border-blue-400 flex items-center justify-center">
                    <span className="text-white font-black text-sm">✓</span>
                  </div>
                )}

                {/* Legal Knight Move Dot Marker */}
                {isLegalKnightMove && !isSelected && (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500/75 ring-2 ring-emerald-300/40 animate-pulse" />
                )}

                {/* Knight Piece SVG */}
                {isKnight && (
                  <div className="relative w-4/5 h-4/5 flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    <svg viewBox="0 0 45 45" className="w-full h-full fill-white stroke-black stroke-[1.5]">
                      <path
                        d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
                        style={{ fill: '#ffffff', stroke: '#000000', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                      />
                      <path
                        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,6.5 19,7 C 20.5,7.5 21,9 22,10"
                        style={{ fill: '#ffffff', stroke: '#000000', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                      />
                      <circle cx="14" cy="12" r="1.5" style={{ fill: '#000000' }} />
                      <circle cx="27" cy="16" r="1.2" style={{ fill: '#000000' }} />
                    </svg>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Blindfold Overlay if completely invisible */}
      {faintOutline && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px] pointer-events-none">
          <div className="text-emerald-400 font-mono text-sm tracking-widest uppercase font-semibold px-4 py-2 rounded-lg bg-slate-900/80 border border-emerald-500/30">
            Blindfold Active
          </div>
          <p className="text-slate-400 text-xs mt-2 font-mono">Mental Board Projection</p>
        </div>
      )}
    </div>
  );
};
