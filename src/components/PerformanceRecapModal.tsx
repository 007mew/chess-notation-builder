import React from 'react';
import { SessionSummary, Square } from '../types';
import { Activity, Award, CheckCircle2, ChevronRight, RotateCcw, Target, Trophy, X, Zap } from 'lucide-react';

export interface PerformanceRecapModalProps {
  summary: SessionSummary | null;
  onClose: () => void;
  onPlayAgain: () => void;
  onTrainWeakest: (squares: Square[]) => void;
  onViewHeatmap: () => void;
}

export const PerformanceRecapModal: React.FC<PerformanceRecapModalProps> = ({
  summary,
  onClose,
  onPlayAgain,
  onTrainWeakest,
  onViewHeatmap,
}) => {
  if (!summary) return null;

  const gradeColors: Record<string, { bg: string; text: string; ring: string; title: string }> = {
    'S+': {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      ring: 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)]',
      title: 'Grandmaster Reflex (<650ms)',
    },
    'S': {
      bg: 'bg-teal-500/20',
      text: 'text-teal-400',
      ring: 'border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.3)]',
      title: 'Master Class Reflex (<850ms)',
    },
    'A': {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      ring: 'border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)]',
      title: 'Expert Tactician (<1.1s)',
    },
    'B': {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      ring: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
      title: 'Solid Club Player (<1.5s)',
    },
    'C': {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      ring: 'border-orange-400',
      title: 'Developing Vision (<2.0s)',
    },
    'D': {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      ring: 'border-red-400',
      title: 'Needs Calibrated Conditioning',
    },
  };

  const currentGrade = gradeColors[summary.grade] || gradeColors['C'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-pop">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Grade Badge Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 mb-3 ${currentGrade.bg} ${currentGrade.ring}`}
          >
            <span className={`text-4xl font-black font-mono tracking-tighter ${currentGrade.text}`}>
              {summary.grade}
            </span>
          </div>

          <h3 className="text-xl font-black font-mono text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Performance Analysis
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {currentGrade.title}
          </p>
        </div>

        {/* Core KPIs */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold">AVG REACTION</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {summary.avgReactionMs}ms
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold">ACCURACY</span>
            <span className="text-xl font-bold font-mono text-slate-100 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {summary.accuracyPercent}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold">MAX STREAK</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1">
              {summary.maxStreak}
            </span>
          </div>
        </div>

        {/* Fastest vs Slowest Squares Breakdown */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* Fastest */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-900/30">
            <div className="text-[11px] font-mono text-emerald-400 font-bold mb-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Fastest Squares
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              {summary.fastestSquares.length > 0 ? (
                summary.fastestSquares.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300">
                    <span className="font-bold uppercase text-emerald-300">{item.square}</span>
                    <span className="text-slate-400">{item.reactionMs}ms</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-500 text-xs">No data</span>
              )}
            </div>
          </div>

          {/* Slowest */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-red-900/30">
            <div className="text-[11px] font-mono text-red-400 font-bold mb-2 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Slowest Squares
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              {summary.slowestSquares.length > 0 ? (
                summary.slowestSquares.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300">
                    <span className="font-bold uppercase text-red-300">{item.square}</span>
                    <span className="text-slate-400">{item.reactionMs}ms</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-500 text-xs">No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-col gap-2 mt-5">
          {summary.slowestSquares.length > 0 && (
            <button
              type="button"
              onClick={() => onTrainWeakest(summary.slowestSquares.map((s) => s.square))}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Target className="w-4 h-4" />
              Retrain Slowest Squares Now ({summary.slowestSquares.map((s) => s.square.toUpperCase()).join(', ')})
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again [Space]
            </button>

            <button
              type="button"
              onClick={onViewHeatmap}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              View on Heatmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
