import React, { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../ChessBoard';
import { DrillSettings, UserStats } from '../../types';
import { BlindfoldQuestion, generateBlindfoldQuestion } from '../../utils/chess';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Eye, EyeOff, Flame, HelpCircle, Play, ShieldAlert, Zap } from 'lucide-react';

export interface DrillBlindfoldProps {
  stats: UserStats;
  settings: DrillSettings;
  onUpdateStats: (newStats: UserStats) => void;
}

export const DrillBlindfold: React.FC<DrillBlindfoldProps> = ({
  settings,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [question, setQuestion] = useState<BlindfoldQuestion | null>(null);
  const [typedInput, setTypedInput] = useState<string>('');
  const [streak, setStreak] = useState<number>(0);
  const [peekFaintBoard, setPeekFaintBoard] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [lastTimeMs, setLastTimeMs] = useState<number | null>(null);

  const nextQuestion = useCallback(() => {
    const q = generateBlindfoldQuestion();
    setQuestion(q);
    setTypedInput('');
    setStartTime(performance.now());
  }, []);

  const startGame = () => {
    setIsActive(true);
    setStreak(0);
    setFeedback(null);
    nextQuestion();
  };

  const evaluateAnswer = useCallback(
    (input: string) => {
      if (!question || !isActive) return;
      const normalized = input.trim().toLowerCase();
      const reaction = Math.round(performance.now() - startTime);
      setLastTimeMs(reaction);

      const isCorrect = question.targetAnswers.some(
        (target) => target.toLowerCase() === normalized
      );

      if (isCorrect) {
        setFeedback('correct');
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        soundEngine.playCorrect(nextStreak, reaction < 800);

        if (nextStreak > 0 && nextStreak % 10 === 0) {
          confetti({ particleCount: 50, spread: 60 });
        }

        setTimeout(() => {
          setFeedback(null);
          nextQuestion();
        }, 350);
      } else {
        setFeedback('wrong');
        setStreak(0);
        soundEngine.playError();

        setTimeout(() => {
          setFeedback(null);
          nextQuestion();
        }, 1200);
      }
    },
    [question, isActive, startTime, streak, nextQuestion]
  );

  // Auto-submit coordinate when 2 characters typed
  useEffect(() => {
    if (question && question.expectedType === 'coordinate' && typedInput.length === 2) {
      evaluateAnswer(typedInput);
    }
  }, [typedInput, question, evaluateAnswer]);

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full px-2 sm:px-4">
      {/* HUD Header */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            Mental Streak: {streak}
          </span>
          {lastTimeMs !== null && (
            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Zap className="w-3 h-3 text-amber-400" />
              {lastTimeMs}ms
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPeekFaintBoard(!peekFaintBoard)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
        >
          {peekFaintBoard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{peekFaintBoard ? 'Hide Faint Grid' : 'Peek Faint Grid'}</span>
        </button>
      </div>

      {/* Main Blindfold Card / Arena */}
      <div
        className={`w-full max-w-[480px] bg-slate-900/90 border-2 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-between min-h-[340px] transition-all relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/20'
            : feedback === 'wrong'
            ? 'border-red-500 bg-red-950/30 animate-shake'
            : 'border-slate-800'
        }`}
      >
        {!isActive ? (
          <div className="flex flex-col items-center text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3">
              <ShieldAlert className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-100 font-mono mb-2">
              Pillar 4: Blindfold Commando
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              No physical board. Test pure internal mental projection: diagonals, bishop intersection paths, knight hop coordinates, and invisible square geometries.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="py-3 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              START BLINDFOLD CHALLENGE
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center my-auto">
            <div className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Mental Geometry Query
            </div>

            <h4 className="text-2xl sm:text-3xl font-black font-mono text-slate-100 mb-2 leading-tight">
              {question?.prompt}
            </h4>
            <p className="text-xs font-mono text-slate-400 max-w-sm mb-6">
              {question?.subtext}
            </p>

            {/* Answer Interface */}
            {question?.expectedType === 'color' ? (
              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => evaluateAnswer('dark')}
                  className="py-4 rounded-xl bg-[#526f42] hover:bg-[#60834d] border border-slate-700 text-white font-mono font-bold text-lg active:scale-95 cursor-pointer shadow-lg"
                >
                  DARK
                </button>
                <button
                  type="button"
                  onClick={() => evaluateAnswer('light')}
                  className="py-4 rounded-xl bg-[#eeeed2] hover:bg-[#f7f7e6] border border-slate-300 text-slate-900 font-mono font-bold text-lg active:scale-95 cursor-pointer shadow-lg"
                >
                  LIGHT
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <input
                  type="text"
                  maxLength={2}
                  value={typedInput}
                  autoFocus
                  onChange={(e) => setTypedInput(e.target.value.toLowerCase())}
                  placeholder="e.g. d4"
                  className="w-36 py-3 text-center text-3xl font-black font-mono tracking-widest bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl text-slate-100 uppercase focus:outline-none shadow-inner"
                />
                <span className="text-[11px] font-mono text-slate-500">
                  Type 2-character square (auto-submits)
                </span>
              </div>
            )}

            {feedback === 'wrong' && question && (
              <div className="mt-4 text-xs font-mono text-red-400 font-bold animate-pop">
                Correct answer was: {question.targetAnswers.map((s) => s.toUpperCase()).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Faint Board for Training Reference */}
      {peekFaintBoard && (
        <div className="mt-6 w-full max-w-[480px] flex flex-col items-center animate-pop">
          <span className="text-[11px] font-mono text-slate-500 mb-2">Faint Outline Reference</span>
          <ChessBoard
            perspective={settings.perspective}
            themeId={settings.theme}
            showCoordinates={true}
            faintOutline={true}
            interactive={false}
            size="md"
          />
        </div>
      )}
    </div>
  );
};
