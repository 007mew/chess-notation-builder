import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard } from '../ChessBoard';
import { VirtualKeypad } from '../VirtualKeypad';
import { DrillSettings, FileLetter, RankNumber, SessionSummary, Square, UserStats } from '../../types';
import { FILES, getRandomSquare, RANKS } from '../../utils/chess';
import { calculateSessionSummary, recordAttempt, srsManager } from '../../utils/storage';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Keyboard, Play, RefreshCw, Zap } from 'lucide-react';

export interface DrillFastTypeProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (newSettings: DrillSettings) => void;
  targetSquareOverride?: Square | null;
  activeSubsetSquares?: Square[] | null;
  onDrillComplete?: (summary: SessionSummary) => void;
}

export const DrillFastType: React.FC<DrillFastTypeProps> = ({
  stats,
  settings,
  onUpdateStats,
  onUpdateSettings,
  targetSquareOverride,
  activeSubsetSquares,
  onDrillComplete,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [targetSquare, setTargetSquare] = useState<Square>('e4');
  const [typedBuffer, setTypedBuffer] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streak, setStreak] = useState<number>(0);
  const [sessionReps, setSessionReps] = useState<number>(0);
  const [sprintTarget, setSprintTarget] = useState<number | null>(30);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [showKeypad, setShowKeypad] = useState<boolean>(true);

  // Floating feedback
  const [floatingFeedback, setFloatingFeedback] = useState<{
    text: string;
    subtext?: string;
    type: 'bonus' | 'streak' | 'correct' | 'wrong';
  } | null>(null);

  // Session stats tracking
  const recordedRepsRef = useRef<{ square: Square; reactionMs: number; correct: boolean }[]>([]);
  const maxSessionStreakRef = useRef<number>(0);

  // Visual cues
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
  const [successSquare, setSuccessSquare] = useState<Square | null>(null);

  const repCounterRef = useRef<number>(0);

  const ghostOpacity = settings.ghostMode
    ? Math.max(0, 1.0 - Math.floor(streak / 10) * 0.2)
    : 1.0;

  const getNextTarget = useCallback((): Square => {
    if (targetSquareOverride) return targetSquareOverride;
    if (activeSubsetSquares && activeSubsetSquares.length > 0) {
      return activeSubsetSquares[Math.floor(Math.random() * activeSubsetSquares.length)];
    }
    return srsManager.getNextSquare(stats);
  }, [targetSquareOverride, activeSubsetSquares, stats]);

  const nextSquare = useCallback(() => {
    const sq = getNextTarget();
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
  }, [getNextTarget, settings, onUpdateSettings]);

  const startGame = () => {
    setIsActive(true);
    setStreak(0);
    setSessionReps(0);
    setLastReactionMs(null);
    setTypedBuffer('');
    setWrongFlash(false);
    setSuccessSquare(null);
    setFloatingFeedback(null);
    recordedRepsRef.current = [];
    maxSessionStreakRef.current = 0;

    const firstSq = getNextTarget() || getRandomSquare();
    setTargetSquare(firstSq);
    setStartTime(performance.now());
  };

  const handleSuccess = useCallback(() => {
    const reaction = Math.round(performance.now() - startTime);
    setLastReactionMs(reaction);
    setSuccessSquare(targetSquare);
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > maxSessionStreakRef.current) {
      maxSessionStreakRef.current = nextStreak;
    }

    recordedRepsRef.current.push({ square: targetSquare, reactionMs: reaction, correct: true });

    const isReflexBonus = reaction < 500;
    soundEngine.playCorrect(nextStreak, isReflexBonus);

    if (isReflexBonus) {
      setFloatingFeedback({
        text: `⚡ REFLEX SPEED (${reaction}ms)`,
        type: 'bonus',
      });
    } else if (nextStreak % 10 === 0) {
      setFloatingFeedback({
        text: `🔥 STREAK x${nextStreak}!`,
        type: 'streak',
      });
    } else {
      setFloatingFeedback({
        text: `✓ ${targetSquare.toUpperCase()} (${reaction}ms)`,
        type: 'correct',
      });
    }

    if (nextStreak > 0 && nextStreak % 25 === 0) {
      confetti({ particleCount: 50, spread: 60 });
    }

    const { updatedStats } = recordAttempt(stats, targetSquare, reaction, true, 'fast-type');
    onUpdateStats(updatedStats);

    const nextReps = sessionReps + 1;
    setSessionReps(nextReps);

    setTimeout(() => {
      setSuccessSquare(null);
      setFloatingFeedback(null);

      if (sprintTarget && nextReps >= sprintTarget) {
        setIsActive(false);
        const summary = calculateSessionSummary(
          'fast-type',
          recordedRepsRef.current,
          maxSessionStreakRef.current
        );
        onDrillComplete?.(summary);
        return;
      }

      nextSquare();
    }, 180);
  }, [startTime, targetSquare, streak, stats, onUpdateStats, sessionReps, sprintTarget, onDrillComplete, nextSquare]);

  const handleFailure = useCallback(() => {
    const reaction = Math.round(performance.now() - startTime);
    setWrongFlash(true);
    setStreak(0);
    setTypedBuffer('');
    soundEngine.playError();

    recordedRepsRef.current.push({ square: targetSquare, reactionMs: reaction, correct: false });

    setFloatingFeedback({
      text: `✕ Missed (${targetSquare.toUpperCase()})`,
      type: 'wrong',
    });

    const { updatedStats } = recordAttempt(stats, targetSquare, reaction, false, 'fast-type');
    onUpdateStats(updatedStats);

    const nextReps = sessionReps + 1;
    setSessionReps(nextReps);

    setTimeout(() => {
      setWrongFlash(false);
      setFloatingFeedback(null);

      if (sprintTarget && nextReps >= sprintTarget) {
        setIsActive(false);
        const summary = calculateSessionSummary(
          'fast-type',
          recordedRepsRef.current,
          maxSessionStreakRef.current
        );
        onDrillComplete?.(summary);
        return;
      }

      nextSquare();
    }, 320);
  }, [startTime, targetSquare, stats, onUpdateStats, sessionReps, sprintTarget, onDrillComplete, nextSquare]);

  const processInputChar = useCallback(
    (char: string) => {
      if (!isActive) return;
      const lower = char.toLowerCase();

      soundEngine.playKeyClick();

      if (typedBuffer.length === 0) {
        if (FILES.includes(lower as FileLetter)) {
          if (lower === targetSquare[0]) {
            setTypedBuffer(lower);
          } else {
            handleFailure();
          }
        }
      } else if (typedBuffer.length === 1) {
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
    [isActive, typedBuffer, targetSquare, handleFailure, handleSuccess]
  );

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
      <div className="flex flex-wrap items-center justify-between w-full max-w-[480px] mb-3 px-1 gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                perspective: settings.perspective === 'white' ? 'black' : 'white',
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-all"
            title="Flip POV [R]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="capitalize">{settings.perspective} POV</span>
          </button>

          <button
            type="button"
            onClick={() => setSprintTarget(sprintTarget === 30 ? 50 : sprintTarget === 50 ? null : 30)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer transition-all"
          >
            {sprintTarget ? `${sprintTarget} Reps` : 'Endless'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowKeypad(!showKeypad)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
            showKeypad ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>{showKeypad ? 'Keypad ON' : 'Keypad OFF'}</span>
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
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              TYPE SQUARE NAME
              {activeSubsetSquares && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">
                  Filtered Subset ({activeSubsetSquares.length})
                </span>
              )}
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
          {sprintTarget && (
            <span className="text-[10px] text-slate-500">
              Progress: {sessionReps}/{sprintTarget}
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
          crosshairGuide={settings.crosshairGuide}
          floatingFeedback={floatingFeedback}
          size="lg"
        />

        {!isActive && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center">
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
