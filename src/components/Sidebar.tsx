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
  LayoutGrid,
  Menu,
  Moon,
  Settings,
  Skull,
  Sparkles,
  Sun,
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
  const isLight = settings.appTheme === 'light';

  const modes: {
    id: DrillMode | 'heatmap';
    label: string;
    sublabel: string;
    shortcut: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'light-dark',
      label: '1. Light or Dark?',
      sublabel: 'Color Conditioning',
      shortcut: '1',
      icon: <Zap className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'target-strike',
      label: '2. Target Strike',
      sublabel: 'Coordinate → Click',
      shortcut: '2',
      icon: <Crosshair className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'fast-type',
      label: '3. Fast Type',
      sublabel: 'Square → Coordinate',
      shortcut: '3',
      icon: <Keyboard className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'blindfold',
      label: '4. Blindfold Commando',
      sublabel: 'Mental Projection',
      shortcut: '4',
      icon: <Eye className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'knight-hop',
      label: '5. Knight Hop Reflex',
      sublabel: 'Spatial Movement',
      shortcut: '5',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'deathrun',
      label: '6. Gauntlet Deathrun',
      sublabel: 'Survival Mode',
      shortcut: '6',
      icon: <Skull className="w-4 h-4 text-red-500" />,
    },
    {
      id: 'heatmap',
      label: '7. 8x8 Mastery Heatmap',
      sublabel: 'Diagnostics & Trends',
      shortcut: '7',
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'memorize',
      label: '8. Memorize Grid',
      sublabel: 'Black & White Matrix',
      shortcut: '8',
      icon: <LayoutGrid className="w-4 h-4 text-teal-500" />,
    },
  ];

  const cycleMetronome = () => {
    const sequence = [0, 60, 90, 120, 150];
    const currentIndex = sequence.indexOf(settings.metronomeBpm);
    const nextBpm = sequence[(currentIndex + 1) % sequence.length];
    soundEngine.setMetronome(nextBpm);
    onUpdateSettings({ ...settings, metronomeBpm: nextBpm });
  };

  const toggleAppTheme = () => {
    const nextTheme = settings.appTheme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, appTheme: nextTheme });
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
      <div
        className={`md:hidden w-full px-4 py-3 sticky top-0 z-40 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-slate-950/95 border-slate-800/80 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-mono font-black text-slate-950 text-base leading-none">B</span>
          </div>
          <div>
            <h1 className="text-sm font-black font-mono tracking-tight flex items-center gap-1.5 leading-none">
              BoardSight
              <span className="text-[9px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30">
                Reflex
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Day / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleAppTheme}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Day / Light Mode'}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Quick Streak Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-mono text-emerald-500 font-bold ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
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
            className={`p-1.5 rounded-lg border ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-500" /> : <Menu className="w-5 h-5" />}
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
            className={`w-4/5 max-w-xs h-full border-r p-5 flex flex-col justify-between ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/20 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="font-mono font-black text-slate-950 text-base">B</span>
                  </div>
                  <span className="font-mono font-bold">Drill Modes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400"
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
                          : isLight
                          ? 'text-slate-700 hover:bg-slate-100'
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

            <div className="pt-4 border-t border-slate-800/20 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenShortcuts();
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-mono font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Command className="w-4 h-4 text-emerald-500" />
                Keyboard Shortcuts [?]
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-mono font-bold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
                }`}
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
      <aside
        className={`hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 p-4 select-none shrink-0 z-30 justify-between border-r backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-slate-50/95 border-slate-200 text-slate-900'
            : 'bg-slate-950/95 border-slate-800/80 text-slate-100'
        }`}
      >
        {/* Brand / Logo Top */}
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800/20 px-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <span className="font-mono font-black text-slate-950 text-xl leading-none">B</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black font-mono tracking-tight leading-none">
                  BoardSight
                </h1>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Reflex
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 leading-none mt-1.5">
                Coordinate Mastery Engine
              </p>
            </div>
          </div>

          {/* Navigation Items (Modes 1 to 8) */}
          <nav className="mt-4 space-y-1 font-mono">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-2 mb-1.5">
              Training Pillars
            </div>

            {modes.map((mode) => {
              const isSelected = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectMode(mode.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl font-bold transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
                        : isLight
                        ? 'bg-slate-200 text-slate-600 border border-slate-300'
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
        <div className="pt-3 border-t border-slate-800/20 space-y-2 font-mono">
          {/* Day / Light Mode Toggle Bar */}
          <button
            type="button"
            onClick={toggleAppTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isLight
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle Day / Light Mode vs Dark Mode"
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{isLight ? 'Day / Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-500/10">
              {isLight ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Global Streak Counter */}
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
              <Flame className="w-3.5 h-3.5 text-emerald-500 fill-current" />
              GLOBAL STREAK
            </span>
            <span className="text-emerald-500 font-black text-sm">{stats.streak}</span>
          </div>

          {/* Quick Metronome & Sound Row */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {/* Metronome */}
            <button
              type="button"
              onClick={cycleMetronome}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                settings.metronomeBpm > 0
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-sm'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Click to cycle Metronome (Off / 60 / 90 / 120 / 150 BPM)"
            >
              <Timer className="w-3.5 h-3.5 text-amber-500" />
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
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={settings.soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{settings.soundEnabled ? 'Audio ON' : 'Muted'}</span>
            </button>
          </div>

          {/* Shortcuts & Settings Row */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={onOpenShortcuts}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Keyboard Shortcuts [?]"
            >
              <Command className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px]">Keys [?]</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
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
