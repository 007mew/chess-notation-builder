import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessBoard } from '../ChessBoard';
import { VirtualKeypad } from '../VirtualKeypad';
import { DrillSettings, FileLetter, RankNumber, Square, SquareColor, UserStats } from '../../types';
import { FILES, getRandomSquare, getSquareColor, RANKS } from '../../utils/chess';
import { recordAttempt } from '../../utils/storage';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Heart, Play, RotateCcw, Skull, Trophy } from 'lucide-react';

export interface DrillDeathrunProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (newSettings: DrillSettings) => void;
}

type GauntletTaskType = 'click-square' | 'color-test' | 'type-square';

export const DrillDeathrun: React.FC<DrillDeathrunProps> = ({
  stats,
  settings,
  onUpdateStats,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(stats.highScores.deathrunScore || 0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(5.0);

  const [currentTask, setCurrentTask] = useState<GauntletTaskType>('click-square');
  const [targetSquare, setTargetSquare] = useState<Square>('e4');
  const [typedBuffer, setTypedBuffer] = useState<string>('');
  const [wrongSquare, setWrongSquare] = useState<Square | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const timerRef = useRef<number | null>(null);

  const nextTask = useCallback(() => {
    const tasks: GauntletTaskType[] = ['click-square', 'color-test', 'type-square'];
    const chosen = tasks[Math.floor(Math.random() * tasks.length)];
    const sq = getRandomSquare();

    setCurrentTask(chosen);
    setTargetSquare(sq);
    setTypedBuffer('');
    setStartTime(performance.now());
  }, []);

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsGameOver(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    soundEngine.playError();
  }, []);

  const startGame = () => {
    setIsActive(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setTimeLeftSec(5.0);
    setTypedBuffer('');
    setWrongSquare(null);
    nextTask();
  };

  // Timer countdown
  useEffect(() => {
    if (isActive) {
      const tickRate = 50; // ms
      timerRef.current = window.setInterval(() => {
        setTimeLeftSec((prev) => {
          const next = prev - tickRate / 1000;
          if (next <= 0) {
            endGame();
            return 0;
          }
          if (next <= 2.0 && Math.round(next * 10) % 5 === 0) {
            soundEngine.playTick(900);
          }
          return next;
        });
      }, tickRate);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, endGame]);

  // Handle Correct Answer
  const handleSuccess = useCallback(() => {
    const reaction = Math.round(performance.now() - startTime);
    const nextScore = score + 1;
    setScore(nextScore);

    // +0.8s added to clock
    setTimeLeftSec((prev) => Math.min(10.0, prev + 0.8));

    soundEngine.playCorrect(nextScore, reaction < 500);

    if (nextScore > highScore) {
      setHighScore(nextScore);
      const updated = {
        ...stats,
        highScores: { ...stats.highScores, deathrunScore: nextScore },
      };
      onUpdateStats(updated);
    }

    if (nextScore > 0 && nextScore % 20 === 0) {
      confetti({ particleCount: 60, spread: 70 });
    }

    recordAttempt(stats, targetSquare, reaction, true, 'deathrun');
    nextTask();
  }, [startTime, score, highScore, stats, onUpdateStats, targetSquare, nextTask]);

  // Handle Failure
  const handleFailure = useCallback(
    (wrongSq?: Square) => {
      const reaction = Math.round(performance.now() - startTime);
      soundEngine.playError();

      if (wrongSq) {
        setWrongSquare(wrongSq);
        setTimeout(() => setWrongSquare(null), 250);
      }

      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          endGame();
        }
        return next;
      });

      recordAttempt(stats, targetSquare, reaction, false, 'deathrun');
      setTypedBuffer('');
      nextTask();
    },
    [startTime, stats, targetSquare, nextTask, endGame]
  );

  // Click square handler
  const handleSquareClick = (clickedSquare: Square) => {
    if (!isActive || currentTask !== 'click-square') return;
    if (clickedSquare === targetSquare) {
      handleSuccess();
    } else {
      handleFailure(clickedSquare);
    }
  };

  // Color button handler
  const handleColorAnswer = (color: SquareColor) => {
    if (!isActive || currentTask !== 'color-test') return;
    const actual = getSquareColor(targetSquare);
    if (color === actual) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  // Virtual / Physical keypress for typing
  const handleCharInput = useCallback(
    (char: string) => {
      if (!isActive) return;
      const lower = char.toLowerCase();

      // If in color test mode, allow F/J
      if (currentTask === 'color-test') {
        if (lower === 'f') handleColorAnswer('dark');
        if (lower === 'j') handleColorAnswer('light');
        return;
      }

      // If in type-square mode
      if (currentTask === 'type-square') {
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
            if (`${typedBuffer}${lower}` === targetSquare) {
              handleSuccess();
            } else {
              handleFailure();
            }
          }
        }
      }
    },
    [isActive, currentTask, typedBuffer, targetSquare, handleColorAnswer, handleSuccess, handleFailure]
  );

  // Global Keydown
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
      handleCharInput(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleCharInput]);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-2 sm:px-4">
      {/* Survival HUD */}
      <div className="w-full max-w-[480px] bg-slate-900/90 border border-red-900/50 rounded-2xl p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1 uppercase">
              <Skull className="w-4 h-4" />
              SURVIVAL GAUNTLET
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-4 h-4 ${
                  heartIndex <= lives
                    ? 'text-red-500 fill-red-500'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-slate-400">SCORE</div>
            <div className="text-3xl font-black text-slate-100 flex items-center gap-1.5">
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
              {score}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">CLOCK (+0.8s / hit)</div>
            <div
              className={`text-3xl font-black ${
                timeLeftSec <= 2.0 ? 'text-red-500 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {timeLeftSec.toFixed(1)}s
            </div>
          </div>
        </div>
      </div>

      {/* Task Prompt Banner */}
      {isActive && (
        <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-xl p-3 mb-4 text-center animate-pop">
          {currentTask === 'click-square' && (
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                TASK: CLICK SQUARE
              </span>
              <div className="text-4xl font-black font-mono text-slate-100 uppercase">
                {targetSquare}
              </div>
            </div>
          )}

          {currentTask === 'color-test' && (
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                TASK: IS THIS SQUARE LIGHT OR DARK?
              </span>
              <div className="text-4xl font-black font-mono text-slate-100 uppercase mb-2">
                {targetSquare}
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => handleColorAnswer('dark')}
                  className="py-2.5 rounded-lg bg-[#526f42] text-white font-mono font-bold text-sm cursor-pointer shadow active:scale-95"
                >
                  DARK [F]
                </button>
                <button
                  type="button"
                  onClick={() => handleColorAnswer('light')}
                  className="py-2.5 rounded-lg bg-[#eeeed2] text-slate-950 font-mono font-bold text-sm cursor-pointer shadow active:scale-95"
                >
                  LIGHT [J]
                </button>
              </div>
            </div>
          )}

          {currentTask === 'type-square' && (
            <div>
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                TASK: TYPE HIGHLIGHTED SQUARE
              </span>
              <div className="text-2xl font-black font-mono text-slate-100 mt-1 uppercase flex items-center justify-center gap-1">
                <span>{typedBuffer[0] || '_'}</span>
                <span>{typedBuffer[1] || '_'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board Arena */}
      <div className="relative w-full max-w-[480px]">
        <ChessBoard
          perspective={settings.perspective}
          themeId={settings.theme}
          showCoordinates={settings.showCoordinates}
          highlightSquares={isActive && currentTask === 'type-square' ? [targetSquare] : []}
          wrongSquare={wrongSquare}
          onSquareClick={handleSquareClick}
          interactive={isActive && currentTask === 'click-square'}
          size="lg"
        />

        {!isActive && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <Skull className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-100 font-mono mb-2">
              Gauntlet Deathrun
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              5 seconds on the clock. Every correct answer adds +0.8s. Alternates between click, color, and typing. 3 strikes and you are out.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold font-mono text-sm flex items-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              ENTER GAUNTLET [SPACE]
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center animate-pop">
            <Trophy className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-3xl font-black text-red-500 font-mono">GAME OVER</h3>
            <p className="text-sm font-mono text-slate-300 mt-1">
              Surviving Reps: <span className="text-emerald-400 font-bold">{score}</span>
            </p>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Personal Best: {highScore}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-6 py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN [SPACE]
            </button>
          </div>
        )}
      </div>

      {/* Virtual Keypad for Type-Square tasks on mobile */}
      {isActive && currentTask === 'type-square' && (
        <div className="mt-4 w-full max-w-[480px]">
          <VirtualKeypad
            onKeyPress={handleCharInput}
            activeFile={typedBuffer.length === 1 ? (typedBuffer[0] as FileLetter) : null}
          />
        </div>
      )}
    </div>
  );
};
