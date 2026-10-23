import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard } from '../ChessBoard';
import { VirtualKeypad } from '../VirtualKeypad';
import { DrillSettings, FileLetter, RankNumber, Square, UserStats } from '../../types';
import { FILES, getRandomSquare, RANKS } from '../../utils/chess';
import { recordAttempt, srsManager } from '../../utils/storage';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Keyboard, Play, RefreshCw, Zap } from 'lucide-react';

export interface DrillFastTypeProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (newSettings: DrillSettings) => void;
  targetSquareOverride?: Square | null;
}

export const DrillFastType: React.FC<DrillFastTypeProps> = ({
  stats,
  settings,
  onUpdateStats,
  onUpdateSettings,
  targetSquareOverride,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [targetSquare, setTargetSquare] = useState<Square>('e4');
  const [typedBuffer, setTypedBuffer] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streak, setStreak] = useState<number>(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [showKeypad, setShowKeypad] = useState<boolean>(true);

  // Visual cues
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
  const [successSquare, setSuccessSquare] = useState<Square | null>(null);

  const repCounterRef = useRef<number>(0);

  const ghostOpacity = settings.ghostMode
    ? Math.max(0, 1.0 - Math.floor(streak / 10) * 0.2)
    : 1.0;

  const nextSquare = useCallback(() => {
    const sq = targetSquareOverride || srsManager.getNextSquare(stats);
    setTargetSquare(sq);
    setTypedBuffer('');
    setStartTime(performance.now());

    repCounterRef.current += 1;
    if (settings.autoFlipPerspective && repCounterRef.current % 10 === 0) {
      onUpdateSettings({
        ...settings,
        perspective: settings.perspective === 'white' ? 'black' : 'white',
      });
    }
  }, [stats, targetSquareOverride, settings, onUpdateSettings]);

  const startGame = () => {
    setIsActive(true);
    setStreak(0);
    setLastReactionMs(null);
    setTypedBuffer('');
    setWrongFlash(false);
    setSuccessSquare(null);

    const firstSq = targetSquareOverride || getRandomSquare();
    setTargetSquare(firstSq);
    setStartTime(performance.now());
  };

  const processInputChar = useCallback(
    (char: string) => {
      if (!isActive) return;
      const lower = char.toLowerCase();

      soundEngine.playKeyClick();

      if (typedBuffer.length === 0) {
        // First character must be file (a-h)
        if (FILES.includes(lower as FileLetter)) {
          // Check if it matches target's file
          if (lower === targetSquare[0]) {
            setTypedBuffer(lower);
          } else {
            // Instant error on wrong file
            handleFailure();
          }
        }
      } else if (typedBuffer.length === 1) {
        // Second character must be rank (1-8)
        if (RANKS.includes(lower as RankNumber)) {
          const fullInput = `${typedBuffer}${lower}` as Square;
          if (fullInput === targetSquare) {
            handleSuccess();
          } else {
            handleFailure();
          }
        }
      }
    },
    [isActive, typedBuffer, targetSquare]
  );

  const handleSuccess = () => {
    const reaction = Math.round(performance.now() - startTime);
    setLastReactionMs(reaction);
    setSuccessSquare(targetSquare);
    const nextStreak = streak + 1;
    setStreak(nextStreak);

    const isReflexBonus = reaction < 500;
    soundEngine.playCorrect(nextStreak, isReflexBonus);

    if (nextStreak > 0 && nextStreak % 25 === 0) {
      confetti({ particleCount: 50, spread: 60 });
    }

    const { updatedStats } = recordAttempt(stats, targetSquare, reaction, true, 'fast-type');
    onUpdateStats(updatedStats);

    setTimeout(() => {
      setSuccessSquare(null);
      nextSquare();
    }, 150);
  };

  const handleFailure = () => {
    const reaction = Math.round(performance.now() - startTime);
    setWrongFlash(true);
    setStreak(0);
    setTypedBuffer('');
    soundEngine.playError();

    const { updatedStats } = recordAttempt(stats, targetSquare, reaction, false, 'fast-type');
    onUpdateStats(updatedStats);

    setTimeout(() => {
      setWrongFlash(false);
      nextSquare();
    }, 300);
  };

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!isActive) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      const key = e.key.toLowerCase();
      if ((key >= 'a' && key <= 'h') || (key >= '1' && key <= '8')) {
        e.preventDefault();
        processInputChar(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, processInputChar]);

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

        <button
          type="button"
          onClick={() => setShowKeypad(!showKeypad)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
            showKeypad ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>{showKeypad ? 'Hide Virtual Keypad' : 'Show Virtual Keypad'}</span>
        </button>
      </div>

      {/* Fast Type Input HUD */}
      <div
        className={`w-full max-w-[480px] bg-slate-900/90 border rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xl transition-colors duration-150 ${
          wrongFlash ? 'border-red-500 bg-red-950/30 animate-shake' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              TYPE SQUARE NAME
            </span>
            <div className="flex items-center gap-2 mt-1">
              {/* Box 1: File */}
              <div className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-2xl font-bold text-slate-100 uppercase">
                {typedBuffer[0] || (
                  <span className="w-2 h-0.5 bg-emerald-500 animate-pulse" />
                )}
              </div>
              {/* Box 2: Rank */}
              <div className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono text-2xl font-bold text-slate-100 uppercase">
                {typedBuffer[1] || (
                  typedBuffer.length === 1 ? <span className="w-2 h-0.5 bg-emerald-500 animate-pulse" /> : ''
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 font-mono text-xs">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Streak: {streak}
          </span>
          {lastReactionMs !== null && (
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {lastReactionMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Main Board with Highlighted Reticle */}
      <div className="relative w-full max-w-[480px]">
        <ChessBoard
          perspective={settings.perspective}
          themeId={settings.theme}
          showCoordinates={settings.showCoordinates}
          ghostOpacity={ghostOpacity}
          highlightSquares={isActive ? [targetSquare] : []}
          targetSquare={successSquare}
          interactive={false}
          size="lg"
        />

        {!isActive && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-slate-100 font-mono mb-2">
              Pillar 3: Fast Type
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              A square is highlighted on the board. Type its two-character coordinate (e.g. &quot;e&quot; then &quot;4&quot;) instantly without pressing Enter.
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

      {/* Mobile/Virtual Keypad */}
      {showKeypad && (
        <div className="mt-4 w-full max-w-[480px]">
          <VirtualKeypad
            onKeyPress={processInputChar}
            activeFile={typedBuffer.length === 1 ? (typedBuffer[0] as FileLetter) : null}
            disabled={!isActive}
          />
        </div>
      )}

      <div className="mt-4 text-xs font-mono text-slate-500 text-center">
        Type direct key combinations: <code>c4</code>, <code>f7</code>, <code>b3</code>. Auto-submits on 2nd key.
      </div>
    </div>
  );
};
