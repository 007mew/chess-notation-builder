import { BoardTheme, BoardThemeId } from '../types';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  'neo-green': {
    id: 'neo-green',
    name: 'Neo Green',
    lightBg: '#eeeed2',
    darkBg: '#769656',
    lightText: '#769656',
    darkText: '#eeeed2',
  },
  'classic-walnut': {
    id: 'classic-walnut',
    name: 'Classic Walnut',
    lightBg: '#f0d9b5',
    darkBg: '#b58863',
    lightText: '#b58863',
    darkText: '#f0d9b5',
  },
  'clean-slate': {
    id: 'clean-slate',
    name: 'Clean Slate',
    lightBg: '#e2e8f0',
    darkBg: '#475569',
    lightText: '#475569',
    darkText: '#f8fafc',
  },
  'lichess-wood': {
    id: 'lichess-wood',
    name: 'Tournament Blue',
    lightBg: '#dee3e6',
    darkBg: '#8ca2ad',
    lightText: '#8ca2ad',
    darkText: '#dee3e6',
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    lightBg: '#1e293b',
    darkBg: '#090d16',
    lightText: '#38bdf8',
    darkText: '#10b981',
    borderClass: 'border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
  },
};
