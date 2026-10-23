import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard } from '../ChessBoard';
import { DrillSettings, Square, UserStats } from '../../types';
import { getKnightMoves, getRandomSquare } from '../../utils/chess';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Play, RefreshCw, Timer } from 'lucide-react';

export interface DrillKnightHopProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (newSettings: DrillSettings) => void;
}

export const DrillKnightHop: React.FC<DrillKnightHopProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [knightSquare, setKnightSquare] = useState<Square>('d4');
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [foundMoves, setFoundMoves] = useState<Square[]>([]);
  const [wrongSquare, setWrongSquare] = useState<Square | null>(null);

  const [streak, setStreak] = useState<number>(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(6000);
  const timerRef = useRef<number | null>(null);

  const nextKnight = useCallback(() => {
    const sq = getRandomSquare();
    const moves = getKnightMoves(sq);
    setKnightSquare(sq);
    setLegalMoves(moves);
    setFoundMoves([]);
    setTimeLeftMs(6000);
  }, []);

  const startGame = () => {
    setIsActive(true);
    setStreak(0);
    setWrongSquare(null);
    nextKnight();
  };

  const handleSquareClick = (clickedSquare: Square) => {
    if (!isActive) return;

    if (legalMoves.includes(clickedSquare)) {
      if (!foundMoves.includes(clickedSquare)) {
        const nextFound = [...foundMoves, clickedSquare];
        setFoundMoves(nextFound);
        soundEngine.playCorrect(nextFound.length, true);

        // Check if all knight moves found
        if (nextFound.length === legalMoves.length) {
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          if (nextStreak % 5 === 0) {
            confetti({ particleCount: 40, spread: 60 });
          }
          setTimeout(() => {
            nextKnight();
          }, 250);
        }
      }
    } else {
      // Wrong square
      setWrongSquare(clickedSquare);
      soundEngine.playError();
      setTimeout(() => setWrongSquare(null), 300);
    }
  };

  // Pacing countdown timer
  useEffect(() => {
    if (isActive) {
      const interval = 100;
      timerRef.current = window.setInterval(() => {
        setTimeLeftMs((prev) => {
          if (prev <= 100) {
            // Time out on this knight position
            soundEngine.playError();
            setStreak(0);
            nextKnight();
            return 6000;
          }
          return prev - interval;
        });
      }, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, nextKnight]);

  const timerPercent = Math.max(0, Math.min(100, (timeLeftMs / 6000) * 100));

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-2 sm:px-4">
      {/* Board Controls Toolbar */}
      <div className="flex items-center justify-between w-full max-w-[480px] mb-3 px-1 gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              ...settings,
              perspective: settings.perspective === 'white' ? 'black' : 'white',
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="capitalize">{settings.perspective} POV</span>
        </button>

        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
          <Flame className="w-3.5 h-3.5 fill-current" />
          Streak: {streak}
        </span>
      </div>

      {/* Knight Status HUD */}
      <div className="w-full max-w-[480px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black font-mono text-emerald-400 uppercase">
              {isActive ? knightSquare : '--'}
            </span>
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">KNIGHT ON {knightSquare.toUpperCase()}</div>
              <div className="text-[11px] font-mono text-slate-400">
                Found {foundMoves.length} of {legalMoves.length} landing squares
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
            <Timer className="w-4 h-4 text-amber-400" />
            <span>{(timeLeftMs / 1000).toFixed(1)}s</span>
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              timerPercent > 40 ? 'bg-emerald-500' : timerPercent > 20 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-[480px]">
        <ChessBoard
          perspective={settings.perspective}
          themeId={settings.theme}
          showCoordinates={settings.showCoordinates}
          knightSquare={isActive ? knightSquare : null}
          selectedSquares={foundMoves}
          wrongSquare={wrongSquare}
          onSquareClick={handleSquareClick}
          interactive={isActive}
          crosshairGuide={settings.crosshairGuide}
          size="lg"
        />

        {!isActive && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-slate-100 font-mono mb-2">
              Pillar 4: Knight Hop Reflex
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              A knight is placed on the board. Tap all of its legal jumping squares before the rapid 6-second timer expires.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              START DRILL [SPACE]
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs font-mono text-slate-500 text-center">
        Tap all valid L-shaped squares. Knight hops form an octagon of potential destinations in open center squares.
      </div>
    </div>
  );
};
