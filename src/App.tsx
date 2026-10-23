import { useState, useEffect, useCallback } from 'react';
import { DrillMode, DrillSettings, SessionSummary, Square, UserStats } from './types';
import {
  getInitialUserStats,
  loadSettings,
  loadUserStats,
  saveSettings,
  saveUserStats,
} from './utils/storage';
import { soundEngine } from './utils/audio';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PerformanceRecapModal } from './components/PerformanceRecapModal';
import { DrillLightDark } from './components/drills/DrillLightDark';
import { DrillTargetStrike } from './components/drills/DrillTargetStrike';
import { DrillFastType } from './components/drills/DrillFastType';
import { DrillBlindfold } from './components/drills/DrillBlindfold';
import { DrillKnightHop } from './components/drills/DrillKnightHop';
import { DrillDeathrun } from './components/drills/DrillDeathrun';
import { HeatmapAnalytics } from './components/HeatmapAnalytics';

export function App() {
  const [currentMode, setCurrentMode] = useState<DrillMode | 'heatmap'>('light-dark');
  const [settings, setSettings] = useState<DrillSettings>(loadSettings);
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [targetSquareOverride, setTargetSquareOverride] = useState<Square | null>(null);
  const [activeSubsetSquares, setActiveSubsetSquares] = useState<Square[] | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // Sync sound engine config on initial load & settings change
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    soundEngine.setSpeechEnabled(settings.speechEnabled);
    soundEngine.setSpeechRate(settings.speechRate);
    soundEngine.setMetronome(settings.metronomeBpm);
  }, [settings]);

  const handleUpdateSettings = useCallback((newSettings: DrillSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleUpdateStats = useCallback((newStats: UserStats) => {
    setStats(newStats);
    saveUserStats(newStats);
  }, []);

  const handleResetStats = useCallback(() => {
    const initial = getInitialUserStats();
    setStats(initial);
    saveUserStats(initial);
  }, []);

  // Launch target training directly from Heatmap or trouble square clicks
  const handleSelectTroubleSquare = (sq: Square) => {
    setTargetSquareOverride(sq);
    setActiveSubsetSquares(null);
    setCurrentMode('target-strike');
  };

  // Launch subset training from Heatmap filter
  const handleDrillSubset = (squares: Square[]) => {
    setActiveSubsetSquares(squares);
    setTargetSquareOverride(null);
    setCurrentMode('target-strike');
  };

  // Drill completed handler
  const handleDrillComplete = (summary: SessionSummary) => {
    setSessionSummary(summary);
  };

  // Retrain weakest squares from recap
  const handleTrainWeakest = (squares: Square[]) => {
    setSessionSummary(null);
    setActiveSubsetSquares(squares);
    setTargetSquareOverride(null);
    setCurrentMode('target-strike');
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();

      // Number keys 1-7 for instant mode switching
      if (e.key === '1') {
        setCurrentMode('light-dark');
        setTargetSquareOverride(null);
        setActiveSubsetSquares(null);
      } else if (e.key === '2') {
        setCurrentMode('target-strike');
        setTargetSquareOverride(null);
        setActiveSubsetSquares(null);
      } else if (e.key === '3') {
        setCurrentMode('fast-type');
        setTargetSquareOverride(null);
        setActiveSubsetSquares(null);
      } else if (e.key === '4') {
        setCurrentMode('blindfold');
      } else if (e.key === '5') {
        setCurrentMode('knight-hop');
      } else if (e.key === '6') {
        setCurrentMode('deathrun');
      } else if (e.key === '7') {
        setCurrentMode('heatmap');
      } else if (key === 'r') {
        // Toggle board perspective
        handleUpdateSettings({
          ...settings,
          perspective: settings.perspective === 'white' ? 'black' : 'white',
        });
      } else if (key === 'm') {
        // Toggle sound mute
        const next = !settings.soundEnabled;
        soundEngine.setSoundEnabled(next);
        handleUpdateSettings({
          ...settings,
          soundEnabled: next,
        });
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setSessionSummary(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, handleUpdateSettings]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setTargetSquareOverride(null);
          setActiveSubsetSquares(null);
          setCurrentMode(mode);
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
          {currentMode === 'light-dark' && (
            <DrillLightDark
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
              targetSquareOverride={targetSquareOverride}
              onDrillComplete={handleDrillComplete}
            />
          )}

          {currentMode === 'target-strike' && (
            <DrillTargetStrike
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
              onUpdateSettings={handleUpdateSettings}
              targetSquareOverride={targetSquareOverride}
              activeSubsetSquares={activeSubsetSquares}
              onDrillComplete={handleDrillComplete}
            />
          )}

          {currentMode === 'fast-type' && (
            <DrillFastType
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
              onUpdateSettings={handleUpdateSettings}
              targetSquareOverride={targetSquareOverride}
              activeSubsetSquares={activeSubsetSquares}
              onDrillComplete={handleDrillComplete}
            />
          )}

          {currentMode === 'blindfold' && (
            <DrillBlindfold
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
            />
          )}

          {currentMode === 'knight-hop' && (
            <DrillKnightHop
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentMode === 'deathrun' && (
            <DrillDeathrun
              stats={stats}
              settings={settings}
              onUpdateStats={handleUpdateStats}
              onUpdateSettings={handleUpdateSettings}
              onDrillComplete={handleDrillComplete}
            />
          )}

          {currentMode === 'heatmap' && (
            <HeatmapAnalytics
              stats={stats}
              onSelectTroubleSquare={handleSelectTroubleSquare}
              onDrillSubset={handleDrillSubset}
            />
          )}
        </main>
      </div>

      {/* Performance Recap Modal */}
      <PerformanceRecapModal
        summary={sessionSummary}
        onClose={() => setSessionSummary(null)}
        onPlayAgain={() => setSessionSummary(null)}
        onTrainWeakest={handleTrainWeakest}
        onViewHeatmap={() => {
          setSessionSummary(null);
          setCurrentMode('heatmap');
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetStats}
      />
    </div>
  );
}

export default App;
