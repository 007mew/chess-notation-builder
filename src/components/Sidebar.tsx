import React, { useState } from 'react';
import { DrillMode, DrillSettings, UserStats } from '../types';
import { soundEngine } from '../utils/audio';
import {
  Activity,
  Command,
  Crosshair,
  Eye,
  Flame,
  Keyboard,
  Menu,
  Settings,
  Skull,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

export interface SidebarProps {
  currentMode: DrillMode | 'heatmap';
  onSelectMode: (mode: DrillMode | 'heatmap') => void;
  settings: DrillSettings;
  onUpdateSettings: (settings: DrillSettings) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  stats: UserStats;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenShortcuts,
  stats,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modes: {
    id: DrillMode | 'heatmap';
    label: string;
    sublabel: string;
    shortcut: string;
    icon: React.ReactNode;
    color?: string;
  }[] = [
    {
      id: 'light-dark',
      label: 'Light or Dark?',
      sublabel: 'Color Conditioning',
      shortcut: '1',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'target-strike',
      label: 'Target Strike',
      sublabel: 'Coordinate → Click',
      shortcut: '2',
      icon: <Crosshair className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'fast-type',
      label: 'Fast Type',
      sublabel: 'Square → Coordinate',
      shortcut: '3',
      icon: <Keyboard className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'blindfold',
      label: 'Blindfold Commando',
      sublabel: 'Mental Projection',
      shortcut: '4',
      icon: <Eye className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'knight-hop',
      label: 'Knight Hop Reflex',
      sublabel: 'Spatial Movement',
      shortcut: '5',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'deathrun',
      label: 'Gauntlet Deathrun',
      sublabel: 'Survival Mode',
      shortcut: '6',
      icon: <Skull className="w-4 h-4 text-red-400" />,
    },
    {
      id: 'heatmap',
      label: '8x8 Mastery Heatmap',
      sublabel: 'Analytics & Training',
      shortcut: '7',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const cycleMetronome = () => {
    const sequence = [0, 60, 90, 120, 150];
    const currentIndex = sequence.indexOf(settings.metronomeBpm);
    const nextBpm = sequence[(currentIndex + 1) % sequence.length];
    soundEngine.setMetronome(nextBpm);
    onUpdateSettings({ ...settings, metronomeBpm: nextBpm });
  };

  const handleSelectModeAndCloseMobile = (mode: DrillMode | 'heatmap') => {
    onSelectMode(mode);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========================================================
          MOBILE TOP BAR (Visible on small screens only)
          ======================================================== */}
      <div className="md:hidden w-full bg-slate-950/95 border-b border-slate-800/80 px-4 py-3 sticky top-0 z-40 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-mono font-black text-slate-950 text-base leading-none">B</span>
          </div>
          <div>
            <h1 className="text-sm font-black font-mono tracking-tight text-slate-100 flex items-center gap-1.5 leading-none">
              BoardSight
              <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30">
                Reflex
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Streak Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold">
            <Flame className="w-3 h-3 fill-current" />
            <span>{stats.streak}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEnabled;
              soundEngine.setSoundEnabled(next);
              onUpdateSettings({ ...settings, soundEnabled: next });
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden animate-pop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="font-mono font-black text-slate-950 text-base">B</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100">Drill Modes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {modes.map((mode) => {
                  const isSelected = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleSelectModeAndCloseMobile(mode.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {mode.icon}
                      <div>
                        <div>{mode.label}</div>
                        <div className="text-[10px] opacity-70 font-normal">{mode.sublabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenShortcuts();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono font-bold"
              >
                <Command className="w-4 h-4 text-emerald-400" />
                Keyboard Shortcuts [?]
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono font-bold"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Themes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP LEFT SIDEBAR NAVIGATION
          ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-md p-4 select-none shrink-0 z-30 justify-between">
        {/* Brand / Logo Top */}
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800/80 px-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <span className="font-mono font-black text-slate-950 text-xl leading-none">B</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black font-mono tracking-tight text-slate-100 leading-none">
                  BoardSight
                </h1>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Reflex
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-none mt-1.5">
                Coordinate Mastery Engine
              </p>
            </div>
          </div>

          {/* Navigation Items (Modes 1 to 6 + Heatmap) */}
          <nav className="mt-5 space-y-1.5 font-mono">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-2 mb-2">
              Training Pillars
            </div>

            {modes.map((mode) => {
              const isSelected = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectMode(mode.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-slate-950' : ''}>
                      {mode.icon}
                    </span>
                    <div>
                      <div className="text-xs leading-tight font-black">{mode.label}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight mt-0.5 ${
                          isSelected ? 'text-slate-800' : 'text-slate-500'
                        }`}
                      >
                        {mode.sublabel}
                      </div>
                    </div>
                  </div>

                  <kbd
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-emerald-600 text-emerald-100 font-bold'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 group-hover:border-slate-700'
                    }`}
                  >
                    {mode.shortcut}
                  </kbd>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Controls & Sensory Status */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5 font-mono">
          {/* Global Streak Counter */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-2 text-slate-400 font-bold">
              <Flame className="w-4 h-4 text-emerald-400 fill-current" />
              GLOBAL STREAK
            </span>
            <span className="text-emerald-400 font-black text-sm">{stats.streak}</span>
          </div>

          {/* Quick Metronome & Sound Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Metronome */}
            <button
              type="button"
              onClick={cycleMetronome}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                settings.metronomeBpm > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
              title="Click to cycle Metronome (Off / 60 / 90 / 120 / 150 BPM)"
            >
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">{settings.metronomeBpm > 0 ? `${settings.metronomeBpm} BPM` : 'BPM Off'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEnabled;
                soundEngine.setSoundEnabled(next);
                onUpdateSettings({ ...settings, soundEnabled: next });
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 font-bold transition-all cursor-pointer"
              title={settings.soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{settings.soundEnabled ? 'Audio ON' : 'Muted'}</span>
            </button>
          </div>

          {/* Shortcuts & Settings Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 font-bold transition-all cursor-pointer"
              title="Keyboard Shortcuts [?]"
            >
              <Command className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Keys [?]</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 font-bold transition-all cursor-pointer"
              title="Settings & Themes"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
