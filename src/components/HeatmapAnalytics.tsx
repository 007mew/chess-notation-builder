import React, { useState } from 'react';
import { Square, SquareStats, UserStats } from '../types';
import { FILES, getQuadrant, getSquareColor, RANKS } from '../utils/chess';
import { calculateDiagnostics } from '../utils/storage';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Crosshair, Filter, HelpCircle, Play, TrendingUp, Zap } from 'lucide-react';

export interface HeatmapAnalyticsProps {
  stats: UserStats;
  onSelectTroubleSquare?: (sq: Square) => void;
  onDrillSubset?: (squares: Square[]) => void;
}

type FilterScope = 'all' | 'white-queenside' | 'white-kingside' | 'black-queenside' | 'black-kingside' | `rank-${string}` | `file-${string}`;

export const HeatmapAnalytics: React.FC<HeatmapAnalyticsProps> = ({
  stats,
  onSelectTroubleSquare,
  onDrillSubset,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>('e4');
  const [filterScope, setFilterScope] = useState<FilterScope>('all');
  const [hoveredSquareInfo, setHoveredSquareInfo] = useState<Square | null>(null);

  const diagnostics = calculateDiagnostics(stats);

  const getSquareMastery = (sqStat?: SquareStats): {
    level: 'mastered' | 'learning' | 'struggling' | 'untested';
    colorClass: string;
    description: string;
  } => {
    if (!sqStat || sqStat.attempts === 0) {
      return {
        level: 'untested',
        colorClass: 'bg-slate-800/60 border-slate-700/50 text-slate-500',
        description: 'Not tested yet',
      };
    }

    const accuracy = sqStat.attempts > 0 ? sqStat.hits / sqStat.attempts : 0;
    const avgSec = sqStat.avgReactionMs / 1000;

    // Deep Red: >2.0s or >15% error rate (<85% accuracy)
    if (avgSec > 2.0 || accuracy < 0.85 || sqStat.isTrouble) {
      return {
        level: 'struggling',
        colorClass: 'bg-red-500/80 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]',
        description: 'Needs training (>2.0s or high errors)',
      };
    }

    // Bright Emerald Green: <0.7s reaction time with >95% accuracy
    if (avgSec < 0.7 && accuracy >= 0.95 && sqStat.attempts >= 3) {
      return {
        level: 'mastered',
        colorClass: 'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]',
        description: 'Mastered (<0.7s sub-second reflex & >95% accuracy)',
      };
    }

    // Amber: 1.0s - 2.0s or developing
    return {
      level: 'learning',
      colorClass: 'bg-amber-500/80 border-amber-300 text-slate-950 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      description: 'Developing (1.0s – 2.0s reflex)',
    };
  };

  // Determine which squares match current filter
  const isSquareInFilter = (sq: Square): boolean => {
    if (filterScope === 'all') return true;
    const quad = getQuadrant(sq);
    if (filterScope === 'white-queenside') return quad === 'White Queenside';
    if (filterScope === 'white-kingside') return quad === 'White Kingside';
    if (filterScope === 'black-queenside') return quad === 'Black Queenside';
    if (filterScope === 'black-kingside') return quad === 'Black Kingside';
    if (filterScope.startsWith('rank-')) return sq[1] === filterScope.replace('rank-', '');
    if (filterScope.startsWith('file-')) return sq[0] === filterScope.replace('file-', '');
    return true;
  };

  // Collect list of filtered squares
  const filteredSquares: Square[] = [];
  RANKS.forEach((r) => {
    FILES.forEach((f) => {
      const sq = `${f}${r}` as Square;
      if (isSquareInFilter(sq)) filteredSquares.push(sq);
    });
  });

  const currentSquareStat = selectedSquare ? stats.squares[selectedSquare] : null;
  const currentMastery = currentSquareStat ? getSquareMastery(currentSquareStat) : null;
  const currentAccuracy = currentSquareStat && currentSquareStat.attempts > 0
    ? Math.round((currentSquareStat.hits / currentSquareStat.attempts) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-10">
      {/* Top Diagnostics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVG REACTION</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {diagnostics.avgReactionTime > 0 ? `${diagnostics.avgReactionTime}ms` : '--'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Across all verified hits</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACCURACY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {diagnostics.overallAccuracy}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1">{stats.totalHits}/{stats.totalAttempts} total reps</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COLOR CONFUSION</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {diagnostics.colorConfusionIndex}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Light/Dark error index</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>WEAKEST QUADRANT</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-sm sm:text-base font-bold font-mono text-red-400 truncate">
            {diagnostics.weakestQuadName}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {diagnostics.highestErrorRate > 0 ? `${diagnostics.highestErrorRate}% error rate` : 'Balanced'}
          </span>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-300">Filter Board:</span>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value as FilterScope)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All 64 Squares</option>
            <option value="white-queenside">White Queenside (a1-d4)</option>
            <option value="white-kingside">White Kingside (e1-h4)</option>
            <option value="black-queenside">Black Queenside (a5-d8)</option>
            <option value="black-kingside">Black Kingside (e5-h8)</option>
            <optgroup label="Filter by Rank">
              {RANKS.map((r) => (
                <option key={r} value={`rank-${r}`}>Rank {r}</option>
              ))}
            </optgroup>
            <optgroup label="Filter by File">
              {FILES.map((f) => (
                <option key={f} value={`file-${f}`}>File {f.toUpperCase()}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {filterScope !== 'all' && onDrillSubset && (
          <button
            type="button"
            onClick={() => onDrillSubset(filteredSquares)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Drill This Subset ({filteredSquares.length} squares)
          </button>
        )}
      </div>

      {/* Main Heatmap and Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid (8x8) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                8x8 Mastery Heatmap
                {hoveredSquareInfo && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pop">
                    Hover: {hoveredSquareInfo.toUpperCase()}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Click any square to inspect metrics or launch focused target drills
              </p>
            </div>
            {diagnostics.troubleList.length > 0 && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {diagnostics.troubleList.length} Trouble Squares
              </span>
            )}
          </div>

          {/* Board Grid */}
          <div className="relative aspect-square w-full max-w-[420px] mx-auto grid grid-cols-8 grid-rows-8 gap-1 p-2 rounded-xl bg-slate-950 border border-slate-800">
            {[...RANKS].reverse().map((rank) =>
              FILES.map((file) => {
                const sq: Square = `${file}${rank}` as Square;
                const sqStat = stats.squares[sq];
                const mastery = getSquareMastery(sqStat);
                const isSelected = selectedSquare === sq;
                const inFilter = isSquareInFilter(sq);

                return (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => setSelectedSquare(sq)}
                    onMouseEnter={() => setHoveredSquareInfo(sq)}
                    onMouseLeave={() => setHoveredSquareInfo(null)}
                    className={`relative rounded-md flex flex-col items-center justify-center transition-all duration-150 border cursor-pointer ${
                      inFilter ? mastery.colorClass : 'opacity-20 grayscale border-slate-800'
                    } ${
                      isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-102 hover:brightness-110'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">
                      {sq}
                    </span>
                    {sqStat && sqStat.attempts > 0 && (
                      <span className="text-[8px] sm:text-[9px] font-mono opacity-80 leading-none mt-0.5">
                        {sqStat.avgReactionMs ? `${(sqStat.avgReactionMs / 1000).toFixed(1)}s` : ''}
                      </span>
                    )}
                    {sqStat?.isTrouble && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Heatmap Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
              <span className="text-slate-300">&lt;0.7s &gt;95%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-500" />
              <span className="text-slate-300">1.0s – 2.0s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-red-500" />
              <span className="text-slate-300">&gt;2.0s / Error</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span className="text-slate-400">Untested</span>
            </div>
          </div>
        </div>

        {/* Square Deep-Dive Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Square Diagnostics</h4>
            
            {selectedSquare ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black font-mono text-emerald-400 uppercase">
                      {selectedSquare}
                    </span>
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-mono font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {getSquareColor(selectedSquare)} Square
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        {getQuadrant(selectedSquare)}
                      </div>
                    </div>
                  </div>

                  {currentSquareStat?.isTrouble ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      Trouble Square
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Calibrated
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="font-semibold text-slate-100">Status: </span>
                  {currentMastery?.description}
                </div>

                {/* Metric Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                    <div className="text-slate-400 text-[11px]">ATTEMPTS</div>
                    <div className="text-lg font-bold text-slate-100 mt-1">
                      {currentSquareStat?.attempts || 0}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                    <div className="text-slate-400 text-[11px]">ACCURACY</div>
                    <div className="text-lg font-bold text-slate-100 mt-1">
                      {currentSquareStat && currentSquareStat.attempts > 0 ? `${currentAccuracy}%` : 'N/A'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                    <div className="text-slate-400 text-[11px]">AVG REACTION</div>
                    <div className="text-lg font-bold text-slate-100 mt-1">
                      {currentSquareStat?.avgReactionMs ? `${currentSquareStat.avgReactionMs}ms` : 'N/A'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                    <div className="text-slate-400 text-[11px]">SUB-800MS STREAK</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {currentSquareStat?.consecutiveFastHits || 0} / 2
                    </div>
                  </div>
                </div>

                {/* Train this square button */}
                <button
                  type="button"
                  onClick={() => onSelectTroubleSquare?.(selectedSquare)}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Crosshair className="w-4 h-4" />
                  Target Strike: Practice {selectedSquare.toUpperCase()}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-slate-500 font-mono py-8 text-center">
                Select any square from the heatmap to view diagnostics.
              </div>
            )}
          </div>

          {/* Interactive Recent Reaction Sparkline */}
          {stats.recentReps.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Reaction Sparkline (Last {stats.recentReps.length} reps)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Speed trend
                </span>
              </div>

              {/* Sparkline Visual Bar Chart */}
              <div className="h-16 flex items-end gap-1 pt-2 border-b border-slate-800/80 pb-1">
                {stats.recentReps.slice(-30).map((rep, idx) => {
                  const ms = Math.min(2500, Math.max(200, rep.reactionMs));
                  const heightPercent = Math.max(15, Math.round(((2500 - ms) / 2300) * 100));
                  return (
                    <div
                      key={idx}
                      title={`${rep.square.toUpperCase()}: ${rep.reactionMs}ms (${rep.correct ? 'Correct' : 'Missed'})`}
                      className={`flex-1 rounded-xs transition-all duration-100 hover:scale-110 cursor-pointer ${
                        !rep.correct
                          ? 'bg-red-500'
                          : rep.reactionMs < 700
                          ? 'bg-emerald-400'
                          : rep.reactionMs < 1200
                          ? 'bg-amber-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                <span>Fast (&lt;700ms)</span>
                <span>Moderate (1.0s)</span>
                <span>Slow (&gt;2.0s)</span>
              </div>
            </div>
          )}

          {/* Trouble Squares Quick List */}
          {diagnostics.troubleList.length > 0 && (
            <div className="bg-slate-900/90 border border-red-900/40 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4" />
                Active Spaced-Repetition Queue ({diagnostics.troubleList.length})
              </h4>
              <p className="text-xs text-slate-400 mb-3 font-mono">
                These squares failed under pressure. The engine is prioritizing them:
              </p>
              <div className="flex flex-wrap gap-2">
                {diagnostics.troubleList.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => {
                      setSelectedSquare(sq);
                      onSelectTroubleSquare?.(sq);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-mono font-bold text-xs uppercase transition-all cursor-pointer"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
