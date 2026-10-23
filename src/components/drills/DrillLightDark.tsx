import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DrillSettings, Square, SquareColor, UserStats } from '../../types';
import { getRandomSquare, getSquareColor } from '../../utils/chess';
import { recordAttempt, srsManager } from '../../utils/storage';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Play, RotateCcw, Timer, Trophy, Zap } from 'lucide-react';

export interface DrillLightDarkProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  targetSquareOverride?: Square | null;
}

type DrillSubmode = 'sprint-100' | 'blitz-60' | 'zen';

export const DrillLightDark: React.FC<DrillLightDarkProps> = ({
  stats,
  settings,
  onUpdateStats,
  targetSquareOverride,
}) => {
  const [submode, setSubmode] = useState<DrillSubmode>('sprint-100');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const [currentSquare, setCurrentSquare] = useState<Square>('e4');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [repsDone, setRepsDone] = useState<number>(0);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxSessionStreak, setMaxSessionStreak] = useState<number>(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [hadReflexBonus, setHadReflexBonus] = useState<boolean>(false);

  // Visual feedback states
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Timers
  const [timeLeftSec, setTimeLeftSec] = useState<number>(60);
  const timerRef = useRef<number | null>(null);

  // Audio voice
  const speakCurrentSquare = useCallback((sq: Square) => {
    if (settings.speechEnabled) {
      soundEngine.speakSquare(sq);
    }
  }, [settings.speechEnabled]);

  const nextPrompt = useCallback(() => {
    const nextSq = targetSquareOverride || srsManager.getNextSquare(stats);
    setCurrentSquare(nextSq);
    setStartTime(performance.now());
    speakCurrentSquare(nextSq);
  }, [stats, targetSquareOverride, speakCurrentSquare]);

  const startGame = () => {
    setIsActive(true);
    setIsGameOver(false);
    setRepsDone(0);
    setCorrectHits(0);
    setCurrentStreak(0);
    setMaxSessionStreak(0);
    setLastReactionMs(null);
    setTimeLeftSec(60);
    setFlashFeedback(null);

    const firstSq = targetSquareOverride || getRandomSquare();
    setCurrentSquare(firstSq);
    setStartTime(performance.now());
    speakCurrentSquare(firstSq);
  };

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsGameOver(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    soundEngine.playTick(1200);
  }, []);

  // Blitz Timer countdown
  useEffect(() => {
    if (isActive && submode === 'blitz-60') {
      timerRef.current = window.setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          if (prev <= 5) {
            soundEngine.playTick(750);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, submode, endGame]);

  // Answer handler
  const handleAnswer = useCallback(
    (chosenColor: SquareColor) => {
      if (!isActive || isGameOver) return;

      const reaction = Math.round(performance.now() - startTime);
      const actualColor = getSquareColor(currentSquare);
      const isCorrect = chosenColor === actualColor;
      const isReflexBonus = isCorrect && reaction < 500;

      setLastReactionMs(reaction);
      setHadReflexBonus(isReflexBonus);

      if (isCorrect) {
        setFlashFeedback('correct');
        const nextStreak = currentStreak + 1;
        setCurrentStreak(nextStreak);
        if (nextStreak > maxSessionStreak) {
          setMaxSessionStreak(nextStreak);
        }
        setCorrectHits((c) => c + 1);
        soundEngine.playCorrect(nextStreak, isReflexBonus);

        if (nextStreak > 0 && nextStreak % 25 === 0) {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        }
      } else {
        setFlashFeedback('wrong');
        setCurrentStreak(0);
        soundEngine.playError();
      }

      // Record in user persistent statistics
      const { updatedStats } = recordAttempt(stats, currentSquare, reaction, isCorrect, 'light-dark');
      onUpdateStats(updatedStats);

      setTimeout(() => setFlashFeedback(null), 180);

      const nextRep = repsDone + 1;
      setRepsDone(nextRep);

      // Check sprint end condition
      if (submode === 'sprint-100' && nextRep >= 100) {
        endGame();
        confetti({ particleCount: 100, spread: 70 });
        return;
      }

      nextPrompt();
    },
    [isActive, isGameOver, startTime, currentSquare, currentStreak, maxSessionStreak, stats, onUpdateStats, repsDone, submode, endGame, nextPrompt]
  );

  // Global Keyboard bindings: [F] for Dark, [J] for Light, [Space] to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (!isActive) {
        if (e.code === 'Space' || key === 'enter') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (key === 'f') {
        e.preventDefault();
        handleAnswer('dark');
      } else if (key === 'j') {
        e.preventDefault();
        handleAnswer('light');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleAnswer]);

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full px-4">
      {/* Submode Selector */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => { setSubmode('sprint-100'); setIsActive(false); }}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            submode === 'sprint-100' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          100 Rep Sprint
        </button>
        <button
          type="button"
          onClick={() => { setSubmode('blitz-60'); setIsActive(false); }}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            submode === 'blitz-60' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          60s Blitz
        </button>
        <button
          type="button"
          onClick={() => { setSubmode('zen'); setIsActive(false); }}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            submode === 'zen' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Endless Zen
        </button>
      </div>

      {/* Main Conditioning Arena */}
      <div
        className={`w-full bg-slate-900/90 border-2 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-between min-h-[380px] transition-all duration-150 relative overflow-hidden ${
          flashFeedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/20'
            : flashFeedback === 'wrong'
            ? 'border-red-500 bg-red-950/30 animate-shake'
            : 'border-slate-800'
        }`}
      >
        {/* HUD Header */}
        <div className="w-full flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Streak: {currentStreak}
            </span>
            {lastReactionMs !== null && (
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  hadReflexBonus
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                {lastReactionMs}ms {hadReflexBonus && '⚡ REFLEX BONUS'}
              </span>
            )}
          </div>

          <div>
            {submode === 'blitz-60' && (
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold font-mono ${timeLeftSec <= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
                <Timer className="w-3.5 h-3.5" />
                {timeLeftSec}s
              </span>
            )}
            {submode === 'sprint-100' && (
              <span className="text-slate-400 font-bold">
                {repsDone}/100 Reps
              </span>
            )}
          </div>
        </div>

        {/* Center Prompt */}
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
          {isActive ? (
            <div className="animate-pop">
              <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-slate-50 uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                {currentSquare}
              </span>
              <p className="text-slate-400 font-mono text-xs mt-3 tracking-widest uppercase">
                Identify square color instantly
              </p>
            </div>
          ) : isGameOver ? (
            <div className="flex flex-col items-center gap-3 animate-pop">
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
              <h3 className="text-2xl font-black text-slate-100 font-mono">DRILL COMPLETE</h3>
              <p className="text-sm font-mono text-slate-400">
                Score: <span className="text-emerald-400 font-bold">{correctHits}</span> / {repsDone} (
                {repsDone > 0 ? Math.round((correctHits / repsDone) * 100) : 0}%)
              </p>
              <p className="text-xs font-mono text-slate-500">Max Streak: {maxSessionStreak}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-slate-100 font-mono">Pillar 1: Color Conditioning</h3>
              <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
                Condition the subconscious grid. High-speed binary classification. Press <strong className="text-slate-200">[F]</strong> for Dark or <strong className="text-slate-200">[J]</strong> for Light.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls / Big Buttons */}
        {isActive ? (
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            {/* Dark Button mapped to [F] */}
            <button
              type="button"
              onClick={() => handleAnswer('dark')}
              className="py-6 sm:py-8 px-4 rounded-2xl bg-[#526f42] hover:bg-[#60834d] border-2 border-slate-700/80 active:scale-95 transition-all text-white font-mono flex flex-col items-center justify-center gap-1 shadow-xl cursor-pointer group"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-wider">DARK</span>
              <span className="text-[11px] font-bold text-emerald-200/70 tracking-widest bg-slate-900/50 px-2 py-0.5 rounded group-hover:bg-slate-900">
                KEY [F]
              </span>
            </button>

            {/* Light Button mapped to [J] */}
            <button
              type="button"
              onClick={() => handleAnswer('light')}
              className="py-6 sm:py-8 px-4 rounded-2xl bg-[#eeeed2] hover:bg-[#f7f7e6] border-2 border-slate-300 active:scale-95 transition-all text-slate-900 font-mono flex flex-col items-center justify-center gap-1 shadow-xl cursor-pointer group"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-wider">LIGHT</span>
              <span className="text-[11px] font-bold text-slate-700 tracking-widest bg-slate-200/80 px-2 py-0.5 rounded group-hover:bg-white">
                KEY [J]
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startGame}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
          >
            {isGameOver ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            {isGameOver ? 'RESTART DRILL' : 'START REPETITION [SPACE]'}
          </button>
        )}
      </div>

      {/* Helpful shortcut hint */}
      <div className="mt-4 text-xs font-mono text-slate-500 flex items-center gap-4">
        <span>[F] = Dark</span>
        <span>•</span>
        <span>[J] = Light</span>
        <span>•</span>
        <span>Sub-500ms = Reflex Bonus</span>
      </div>
    </div>
  );
};
