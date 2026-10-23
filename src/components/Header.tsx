import React from 'react';
import { DrillMode, DrillSettings, UserStats } from '../types';
import { soundEngine } from '../utils/audio';
import { Activity, Command, Crosshair, Eye, Flame, Keyboard, Settings, Skull, Sparkles, Timer, Volume2, VolumeX, Zap } from 'lucide-react';

export interface HeaderProps {
  currentMode: DrillMode | 'heatmap';
  onSelectMode: (mode: DrillMode | 'heatmap') => void;
  settings: DrillSettings;
  onUpdateSettings: (settings: DrillSettings) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  stats: UserStats;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenShortcuts,
  stats,
}) => {
  const modes: { id: DrillMode | 'heatmap'; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'light-dark', label: '1. Light/Dark', icon: <Zap className="w-4 h-4" /> },
    { id: 'target-strike', label: '2. Target Strike', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'fast-type', label: '3. Fast Type', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'blindfold', label: '4. Blindfold', icon: <Eye className="w-4 h-4" /> },
    { id: 'knight-hop', label: '5. Knight Hop', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'deathrun', label: '6. Deathrun', icon: <Skull className="w-4 h-4 text-red-400" /> },
    { id: 'heatmap', label: '8x8 Heatmap', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
  ];

  const cycleMetronome = () => {
    const sequence = [0, 60, 90, 120, 150];
    const currentIndex = sequence.indexOf(settings.metronomeBpm);
    const nextBpm = sequence[(currentIndex + 1) % sequence.length];
    soundEngine.setMetronome(nextBpm);
    onUpdateSettings({ ...settings, metronomeBpm: nextBpm });
  };

  return (
    <header className="w-full bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-mono font-black text-slate-950 text-lg leading-none">B</span>
            </div>
            <div>
              <h1 className="text-base font-black font-mono tracking-tight text-slate-100 flex items-center gap-1.5 leading-none">
                BoardSight
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Sub-Second
                </span>
              </h1>
              <p className="text-[11px] font-mono text-slate-400 leading-none mt-1">
                Chess Coordinate Reflex Engine
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={cycleMetronome}
              className={`p-2 rounded-xl border text-xs font-mono font-bold ${
                settings.metronomeBpm > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Metronome"
            >
              <Timer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Shortcuts"
            >
              <Command className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEnabled;
                soundEngine.setSoundEnabled(next);
                onUpdateSettings({ ...settings, soundEnabled: next });
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Training Modes Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none text-xs font-mono">
          {modes.map((mode) => {
            const isSelected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Metronome Pill */}
          <button
            type="button"
            onClick={cycleMetronome}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              settings.metronomeBpm > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Click to cycle Metronome (Off / 60 / 90 / 120 / 150 BPM)"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>{settings.metronomeBpm > 0 ? `${settings.metronomeBpm} BPM` : 'BPM Off'}</span>
          </button>

          {/* Shortcuts Modal Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer"
            title="Keyboard Shortcuts [?]"
          >
            <Command className="w-3.5 h-3.5 text-emerald-400" />
            <span>Keys</span>
          </button>

          {/* Global Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{stats.streak}</span>
          </div>

          {/* Quick Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEnabled;
              soundEngine.setSoundEnabled(next);
              onUpdateSettings({ ...settings, soundEnabled: next });
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Toggle */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
