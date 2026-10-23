import React from 'react';
import { FILES, RANKS } from '../utils/chess';
import { FileLetter, RankNumber } from '../types';

export interface VirtualKeypadProps {
  onKeyPress: (char: string) => void;
  activeFile?: FileLetter | null;
  disabled?: boolean;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({
  onKeyPress,
  activeFile = null,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-[480px] bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-2 select-none">
      {/* File Bar (a-h) */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-mono text-slate-400 font-semibold w-10">FILE</span>
        <div className="flex-1 grid grid-cols-8 gap-1">
          {FILES.map((f) => {
            const isSelected = activeFile === f;
            return (
              <button
                key={f}
                type="button"
                disabled={disabled}
                onClick={() => onKeyPress(f)}
                className={`py-2 text-center rounded-lg font-mono font-bold text-sm transition-all duration-100 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rank Bar (1-8) */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-mono text-slate-400 font-semibold w-10">RANK</span>
        <div className="flex-1 grid grid-cols-8 gap-1">
          {RANKS.map((r: RankNumber) => {
            return (
              <button
                key={r}
                type="button"
                disabled={disabled}
                onClick={() => onKeyPress(r)}
                className="py-2 text-center rounded-lg font-mono font-bold text-sm transition-all duration-100 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-95 active:bg-emerald-600"
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
