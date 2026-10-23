import React from 'react';
import { BoardThemeId, DrillSettings } from '../types';
import { BOARD_THEMES } from '../utils/themes';
import { soundEngine } from '../utils/audio';
import { Check, Crosshair, Moon, Play, RotateCcw, Sun, Timer, Volume2, X } from 'lucide-react';

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

  const metronomeOptions = [
    { label: 'Off', bpm: 0 },
    { label: '60 BPM', bpm: 60 },
    { label: '90 BPM', bpm: 90 },
    { label: '120 BPM', bpm: 120 },
    { label: '150 BPM', bpm: 150 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-pop">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
          {/* Day / Light Mode vs Dark Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Appearance / Day Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, appTheme: 'dark' })}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-bold cursor-pointer transition-all ${
                  settings.appTheme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
                {settings.appTheme === 'dark' && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, appTheme: 'light' })}
                className={`flex items-center gap-2 p-2.5 rounded-xl border font-bold cursor-pointer transition-all ${
                  settings.appTheme === 'light'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Day / Light</span>
                {settings.appTheme === 'light' && <Check className="w-3.5 h-3.5 ml-auto text-amber-500" />}
              </button>
            </div>
          </div>

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

          {/* Sensory Reinforcement */}
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

            {/* Metronome Speed */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  Rhythm Metronome
                </span>
                <span className="text-[11px] text-slate-400">Subconscious timing pulse</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {metronomeOptions.map((opt) => {
                  const isSelected = settings.metronomeBpm === opt.bpm;
                  return (
                    <button
                      key={opt.bpm}
                      type="button"
                      onClick={() => {
                        soundEngine.setMetronome(opt.bpm);
                        onUpdateSettings({ ...settings, metronomeBpm: opt.bpm });
                      }}
                      className={`py-1.5 text-center text-xs font-mono font-bold rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Sound Test Lab */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5 mb-2.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Sound Lab Previews
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => soundEngine.testSound('correct')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-bold border border-slate-700/60 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Correct Hit
              </button>
              <button
                type="button"
                onClick={() => soundEngine.testSound('bonus')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700/60 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Reflex Sparkle
              </button>
              <button
                type="button"
                onClick={() => soundEngine.testSound('error')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-red-400 font-bold border border-slate-700/60 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Error Buzz
              </button>
              <button
                type="button"
                onClick={() => soundEngine.testSound('tick')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 font-bold border border-slate-700/60 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Clock Tick
              </button>
              <button
                type="button"
                onClick={() => soundEngine.testSound('speech')}
                className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-purple-400 font-bold border border-slate-700/60 cursor-pointer flex items-center justify-center gap-1 sm:col-span-2"
              >
                <Play className="w-3 h-3 fill-current" />
                Speech Callout (&quot;E 4&quot;)
              </button>
            </div>
          </div>

          {/* Visual Guides & Conditioning Modes */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  Crosshair Ray Guide
                </div>
                <div className="text-[11px] text-slate-400">Hovering highlights rank & file intersection</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    crosshairGuide: !settings.crosshairGuide,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.crosshairGuide ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.crosshairGuide ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

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
