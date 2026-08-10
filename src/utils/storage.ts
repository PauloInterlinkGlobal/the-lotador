/**
 * Storage and Progression System for LOTADOR
 */

import { PlayerStats, Mission, GameSettings } from '../types/game';

const SAVE_KEY = 'LOTADOR_SAVE_V1';
const SETTINGS_KEY = 'LOTADOR_SETTINGS_V1';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  money: 500, // Starting Kz
  xp: 0,
  level: 1,
  bestScore: 0,
  taxisLoaded: 0,
  passengersServed: 0,
  maxCombo: 1,
  upgradeSpeed: 0,
  upgradeStamina: 0,
  upgradeVoice: 0,
  upgradePersuasion: 0,
  selectedGender: 'M',
  selectedShirt: 0,
  selectedPants: 0,
  selectedAccessory: 0,
  unlockedMaps: ['PARAGEM_URBANA'],
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  graphicsQuality: 'MEDIUM',
};

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'PRIMEIRO TURNO',
    description: 'Lota 3 táxis na paragem',
    rewardKz: 500,
    rewardXp: 100,
    targetCount: 3,
    currentCount: 0,
    completed: false,
    type: 'LOAD_TAXIS',
  },
  {
    id: 'm2',
    title: 'NÃO PARA!',
    description: 'Lota 8 táxis no total',
    rewardKz: 1200,
    rewardXp: 250,
    targetCount: 8,
    currentCount: 0,
    completed: false,
    type: 'LOAD_TAXIS',
  },
  {
    id: 'm3',
    title: 'REI DA VOZ',
    description: 'Aborda e serve 15 passageiros',
    rewardKz: 800,
    rewardXp: 180,
    targetCount: 15,
    currentCount: 0,
    completed: false,
    type: 'SERVE_PASSENGERS',
  },
  {
    id: 'm4',
    title: 'VELOCISTA DE LUANDA',
    description: 'Consiga um combo x3 ou superior',
    rewardKz: 1500,
    rewardXp: 300,
    targetCount: 3,
    currentCount: 0,
    completed: false,
    type: 'FAST_LOAD',
  },
];

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }
  return { ...DEFAULT_PLAYER_STATS };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

// Level formulas
export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Lenda';
  if (level >= 40) return 'Elite';
  if (level >= 30) return 'Mestre';
  if (level >= 20) return 'Veterano';
  if (level >= 15) return 'Profissional';
  if (level >= 10) return 'Experiente';
  if (level >= 5) return 'Lotador';
  return 'Novato';
}

export function getXpForNextLevel(level: number): number {
  return level * 150 + 100;
}

export function getUpgradeCost(currentLevel: number): number {
  return (currentLevel + 1) * 350;
}
