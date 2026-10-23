import React from 'react';
import { BoardThemeId, DrillSettings } from '../types';
import { BOARD_THEMES } from '../utils/themes';
import { soundEngine } from '../utils/audio';
import { Check, RotateCcw, X } from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DrillSettings;
  onUpdateSettings: (newSettings: DrillSettings) => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-pop">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold font-mono text-slate-100">Settings & Sensory Engine</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="py-4 space-y-5 text-sm font-mono">
          {/* Board Themes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Board Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeKey) => {
                const theme = BOARD_THEMES[themeKey];
                const isSelected = settings.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: themeKey })}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex w-6 h-6 rounded-md overflow-hidden border border-slate-700">
                      <div className="w-1/2 h-full" style={{ backgroundColor: theme.darkBg }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: theme.lightBg }} />
                    </div>
                    <span className="text-xs truncate">{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Reinforcement */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase">Sound Effects</div>
                <div className="text-[11px] text-slate-400">Synthesizer clicks, buzzes, and reflex bells</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !settings.soundEnabled;
                  soundEngine.setSoundEnabled(next);
                  onUpdateSettings({ ...settings, soundEnabled: next });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.soundEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase">Voice Audio Callouts</div>
                <div className="text-[11px] text-slate-400">Web Speech API reads coordinates aloud</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !settings.speechEnabled;
                  soundEngine.setSpeechEnabled(next);
                  onUpdateSettings({ ...settings, speechEnabled: next });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.speechEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.speechEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Conditioning Modes */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase">Perspective Inversion</div>
                <div className="text-[11px] text-slate-400">Auto-flip White/Black POV every 10 reps</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    autoFlipPerspective: !settings.autoFlipPerspective,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.autoFlipPerspective ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.autoFlipPerspective ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase">Ghost Mode</div>
                <div className="text-[11px] text-slate-400">Labels fade 20% every 10 streak until borderless</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    ghostMode: !settings.ghostMode,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.ghostMode ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.ghostMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Stats */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all user heatmap metrics and high scores?')) {
                  onResetStats();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Diagnostic Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
