import React from 'react';
import { Command, X } from 'lucide-react';

export interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 – 6', description: 'Switch training modes (Mode 1 to Mode 6)' },
    { key: '7', description: 'View 8x8 Mastery Heatmap & Diagnostics' },
    { key: 'F / J', description: 'Light or Dark? ([F] = Dark, [J] = Light)' },
    { key: 'a–h then 1–8', description: 'Fast Type: Direct coordinate keystrokes' },
    { key: 'Space', description: 'Start / Restart current drill' },
    { key: 'R', description: 'Flip Board Perspective (White ↔ Black)' },
    { key: 'M', description: 'Toggle Sound Effects (Mute / Unmute)' },
    { key: 'Right Click & Drag', description: 'Draw tactical arrows on board' },
    { key: 'Right Click Square', description: 'Mark square with circle ring' },
    { key: 'Left Click Board', description: 'Clear custom arrows & markers' },
    { key: '?', description: 'Toggle this Shortcuts Guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-pop">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <Command className="w-4 h-4 text-emerald-400" />
            Tactile Keyboard Shortcuts
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono"
            >
              <span className="text-slate-300">{item.description}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold tracking-wider">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            Keys are active globally during all drill modes for zero-latency reflexes.
          </p>
        </div>
      </div>
    </div>
  );
};
