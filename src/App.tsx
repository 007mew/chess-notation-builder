import { useState, useEffect } from 'react';
import { DrillMode, DrillSettings, Square, UserStats } from './types';
import {
  getInitialUserStats,
  loadSettings,
  loadUserStats,
  saveSettings,
  saveUserStats,
} from './utils/storage';
import { soundEngine } from './utils/audio';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
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
  const [targetSquareOverride, setTargetSquareOverride] = useState<Square | null>(null);

  // Sync sound engine config on initial load
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    soundEngine.setSpeechEnabled(settings.speechEnabled);
    soundEngine.setSpeechRate(settings.speechRate);
  }, [settings]);

  const handleUpdateSettings = (newSettings: DrillSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
    saveUserStats(newStats);
  };

  const handleResetStats = () => {
    const initial = getInitialUserStats();
    setStats(initial);
    saveUserStats(initial);
  };

  // Launch target training directly from Heatmap or trouble square clicks
  const handleSelectTroubleSquare = (sq: Square) => {
    setTargetSquareOverride(sq);
    setCurrentMode('target-strike');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top App Header & Mode Nav */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setTargetSquareOverride(null);
          setCurrentMode(mode);
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        stats={stats}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col justify-start">
        {currentMode === 'light-dark' && (
          <DrillLightDark
            stats={stats}
            settings={settings}
            onUpdateStats={handleUpdateStats}
            targetSquareOverride={targetSquareOverride}
          />
        )}

        {currentMode === 'target-strike' && (
          <DrillTargetStrike
            stats={stats}
            settings={settings}
            onUpdateStats={handleUpdateStats}
            onUpdateSettings={handleUpdateSettings}
            targetSquareOverride={targetSquareOverride}
          />
        )}

        {currentMode === 'fast-type' && (
          <DrillFastType
            stats={stats}
            settings={settings}
            onUpdateStats={handleUpdateStats}
            onUpdateSettings={handleUpdateSettings}
            targetSquareOverride={targetSquareOverride}
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
          />
        )}

        {currentMode === 'heatmap' && (
          <HeatmapAnalytics
            stats={stats}
            onSelectTroubleSquare={handleSelectTroubleSquare}
          />
        )}
      </main>

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
