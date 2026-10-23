import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard } from '../ChessBoard';
import { DrillSettings, SessionSummary, Square, UserStats } from '../../types';
import { getRandomSquare } from '../../utils/chess';
import { calculateSessionSummary, recordAttempt, srsManager } from '../../utils/storage';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Eye, EyeOff, Flame, Play, RefreshCw, Volume2, VolumeX, Zap } from 'lucide-react';

export interface DrillTargetStrikeProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (newSettings: DrillSettings) => void;
  targetSquareOverride?: Square | null;
  activeSubsetSquares?: Square[] | null;
  onDrillComplete?: (summary: SessionSummary) => void;
}

export const DrillTargetStrike: React.FC<DrillTargetStrikeProps> = ({
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
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streak, setStreak] = useState<number>(0);
  const [sessionReps, setSessionReps] = useState<number>(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [sprintTarget, setSprintTarget] = useState<number | null>(30); // 30 reps or null for endless

  // Floating feedback
  const [floatingFeedback, setFloatingFeedback] = useState<{
    text: string;
    subtext?: string;
    type: 'bonus' | 'streak' | 'correct' | 'wrong';
  } | null>(null);

  // Session reps tracking for recap summary
  const recordedRepsRef = useRef<{ square: Square; reactionMs: number; correct: boolean }[]>([]);
  const maxSessionStreakRef = useRef<number>(0);

  // Ghost mode progressive opacity: drops 20% every 10 streak
  const ghostOpacity = settings.ghostMode
    ? Math.max(0, 1.0 - Math.floor(streak / 10) * 0.2)
    : 1.0;

  // Flash states
  const [successSquare, setSuccessSquare] = useState<Square | null>(null);
  const [wrongSquare, setWrongSquare] = useState<Square | null>(null);

  const repCounterRef = useRef<number>(0);

  const speakSquare = useCallback((sq: Square) => {
    if (settings.speechEnabled) {
      soundEngine.speakSquare(sq);
    }
  }, [settings.speechEnabled]);

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
    setStartTime(performance.now());
    speakSquare(sq);

    repCounterRef.current += 1;
    if (settings.autoFlipPerspective && repCounterRef.current % 10 === 0) {
      onUpdateSettings({
        ...settings,
        perspective: settings.perspective === 'white' ? 'black' : 'white',
      });
    }
  }, [getNextTarget, speakSquare, settings, onUpdateSettings]);

  const startGame = () => {
    setIsActive(true);
    setStreak(0);
    setSessionReps(0);
    setLastReactionMs(null);
    setWrongSquare(null);
    setSuccessSquare(null);
    setFloatingFeedback(null);
    repCounterRef.current = 0;
    recordedRepsRef.current = [];
    maxSessionStreakRef.current = 0;

    const firstSq = getNextTarget() || getRandomSquare();
    setTargetSquare(firstSq);
    setStartTime(performance.now());
    speakSquare(firstSq);
  };

  const handleSquareClick = (clickedSquare: Square) => {
    if (!isActive) return;

    const reaction = Math.round(performance.now() - startTime);
    const isCorrect = clickedSquare === targetSquare;
    const isReflexBonus = isCorrect && reaction < 500;

    setLastReactionMs(reaction);
    recordedRepsRef.current.push({ square: targetSquare, reactionMs: reaction, correct: isCorrect });

    if (isCorrect) {
      setSuccessSquare(clickedSquare);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxSessionStreakRef.current) {
        maxSessionStreakRef.current = nextStreak;
      }

      soundEngine.playCorrect(nextStreak, isReflexBonus);

      if (isReflexBonus) {
        setFloatingFeedback({
          text: `⚡ REFLEX BONUS (${reaction}ms)`,
          subtext: `Streak x${nextStreak}`,
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

      setTimeout(() => setSuccessSquare(null), 180);
    } else {
      setWrongSquare(clickedSquare);
      setStreak(0);
      soundEngine.playError();
      setFloatingFeedback({
        text: `✕ Missed ${targetSquare.toUpperCase()} (Tapped ${clickedSquare.toUpperCase()})`,
        type: 'wrong',
      });
      setTimeout(() => setWrongSquare(null), 300);
    }

    const { updatedStats } = recordAttempt(stats, targetSquare, reaction, isCorrect, 'target-strike');
    onUpdateStats(updatedStats);

    const nextReps = sessionReps + 1;
    setSessionReps(nextReps);

    setTimeout(() => setFloatingFeedback(null), 650);

    // Check sprint completion
    if (sprintTarget && nextReps >= sprintTarget) {
      setIsActive(false);
      const summary = calculateSessionSummary(
        'target-strike',
        recordedRepsRef.current,
        maxSessionStreakRef.current
      );
      onDrillComplete?.(summary);
      return;
    }

    nextSquare();
  };

  // Keyboard shortcut Space to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!isActive && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-2 sm:px-4">
      {/* Board Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-[480px] mb-3 px-1 gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          {/* Flip Perspective */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                perspective: settings.perspective === 'white' ? 'black' : 'white',
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-all"
            title="Flip Board Perspective [R]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="capitalize">{settings.perspective} POV</span>
          </button>

          {/* Toggle Edge Coordinates */}
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                showCoordinates: !settings.showCoordinates,
              })
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-all"
            title="Toggle Coordinates Edge Visibility"
          >
            {settings.showCoordinates ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Labels</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sprint Length Picker */}
          <button
            type="button"
            onClick={() => setSprintTarget(sprintTarget === 30 ? 50 : sprintTarget === 50 ? null : 30)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer transition-all"
          >
            {sprintTarget ? `${sprintTarget} Reps` : 'Endless'}
          </button>

          {/* Audio Voice Callout Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.speechEnabled;
              onUpdateSettings({ ...settings, speechEnabled: next });
              if (next && isActive) {
                soundEngine.speakSquare(targetSquare);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
              settings.speechEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Voice Callout: Speak coordinate aloud"
          >
            {settings.speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice</span>
          </button>
        </div>
      </div>

      {/* Target Prompt HUD */}
      <div className="w-full max-w-[480px] bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              TARGET SQUARE
              {activeSubsetSquares && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">
                  Filtered Subset ({activeSubsetSquares.length})
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 uppercase tracking-tight">
                {isActive ? targetSquare : '--'}
              </span>
              {isActive && (
                <button
                  type="button"
                  onClick={() => soundEngine.speakSquare(targetSquare)}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Re-play voice callout"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
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

      {/* Main Board with Floating Feedback */}
      <div className="relative w-full max-w-[480px]">
        <ChessBoard
          perspective={settings.perspective}
          themeId={settings.theme}
          showCoordinates={settings.showCoordinates}
          ghostOpacity={ghostOpacity}
          targetSquare={successSquare}
          wrongSquare={wrongSquare}
          onSquareClick={handleSquareClick}
          interactive={isActive}
          crosshairGuide={settings.crosshairGuide}
          floatingFeedback={floatingFeedback}
          size="lg"
        />

        {/* Start Overlay if not active */}
        {!isActive && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-slate-100 font-mono mb-2">
              Pillar 2: Target Strike
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Hear or see the coordinate, then tap the exact square with zero hesitation. Right-click drag to annotate arrows!
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

      <div className="mt-4 text-xs font-mono text-slate-500 text-center flex items-center gap-3">
        <span>Right-click & drag for arrows</span>
        <span>•</span>
        <span>Crosshair Ray Guide: {settings.crosshairGuide ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
};
