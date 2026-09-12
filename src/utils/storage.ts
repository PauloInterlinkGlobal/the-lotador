/**
 * Storage and Progression System for LOTADOR
 */

import { PlayerStats, Mission, GameSettings, CampaignZone } from '../types/game';

const SAVE_KEY = 'LOTADOR_SAVE_V1';
const BACKUP_SAVE_KEY = 'LOTADOR_SAVE_V1_BACKUP';
const SETTINGS_KEY = 'LOTADOR_SETTINGS_V1';

export const CAMPAIGN_ZONES: CampaignZone[] = [
  {
    id: 'PARAGEM_URBANA',
    name: 'Paragem Mutamba',
    city: 'Luanda Centro',
    difficulty: 'FÁCIL',
    requiredLevel: 1,
    requiredRuns: 0,
    bonusKzMultiplier: 1.0,
    desc: 'O coração de Luanda. Onde todo o lotador começa a sua carreira.',
    bgGrad: 'from-amber-400 to-orange-500',
  },
  {
    id: 'VIANA_EXPRESS',
    name: 'Terminal de Viana',
    city: 'Viana',
    difficulty: 'MÉDIO',
    requiredLevel: 2,
    requiredRuns: 1,
    bonusKzMultiplier: 1.25,
    desc: 'Passageiros com pressa de chegar a casa. Ritmo acelerado e gorjetas maiores!',
    bgGrad: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'MERCADO_CORREIOS',
    name: 'Mercado dos Correios',
    city: 'Kilamba Kiaxi',
    difficulty: 'MÉDIO',
    requiredLevel: 4,
    requiredRuns: 3,
    bonusKzMultiplier: 1.5,
    desc: 'Milhares de comerciantes e passageiros com compras volumosas!',
    bgGrad: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'TALATONA_LUX',
    name: 'Rotunda de Talatona',
    city: 'Talatona',
    difficulty: 'DIFÍCIL',
    requiredLevel: 7,
    requiredRuns: 5,
    bonusKzMultiplier: 1.8,
    desc: 'Passageiros exigentes dispostos a pagar o triplo por lotação rápida!',
    bgGrad: 'from-purple-600 to-pink-600',
  },
  {
    id: 'SAMBA_TERMINAL',
    name: 'Terminal da Samba',
    city: 'Samba / Luanda Sul',
    difficulty: 'EXTREMO',
    requiredLevel: 10,
    requiredRuns: 8,
    bonusKzMultiplier: 2.2,
    desc: 'O maior terminal da cidade! Disputa feroz com lotadores rivais de elite!',
    bgGrad: 'from-red-600 to-rose-800',
  },
];

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
  selectedMapId: 'PARAGEM_URBANA',
  unlockedMaps: ['PARAGEM_URBANA'],
  tutorialCompleted: false,
};

const isMobileOrLowEnd = typeof navigator !== 'undefined' && (
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
  (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4)
);

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  graphicsQuality: 'LOW',
  language: 'PT',
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
  // 1. Try loading primary save
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.level === 'number') {
        return { ...DEFAULT_PLAYER_STATS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('[Storage] Primary save corrupted or unavailable, attempting backup recovery:', e);
  }

  // 2. Fallback to backup save
  try {
    const backupRaw = localStorage.getItem(BACKUP_SAVE_KEY);
    if (backupRaw) {
      const parsedBackup = JSON.parse(backupRaw);
      if (parsedBackup && typeof parsedBackup === 'object' && typeof parsedBackup.level === 'number') {
        console.log('[Storage] Successfully recovered save from backup slot!');
        return { ...DEFAULT_PLAYER_STATS, ...parsedBackup };
      }
    }
  } catch (e) {
    console.error('[Storage] Backup save read failed:', e);
  }

  return { ...DEFAULT_PLAYER_STATS };
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    const serialized = JSON.stringify(stats);
    localStorage.setItem(SAVE_KEY, serialized);
    // Mirror to backup
    localStorage.setItem(BACKUP_SAVE_KEY, serialized);
  } catch (e: any) {
    // Handle Storage Quota Exceeded
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn('[Storage] Quota exceeded, purging non-critical keys to preserve save...');
      try {
        // Remove non-essential keys
        localStorage.removeItem('LOTADOR_DEBUG_LOG');
        localStorage.setItem(SAVE_KEY, JSON.stringify(stats));
      } catch (innerErr) {
        console.error('[Storage] Critical: Unable to save game state after quota cleanup:', innerErr);
      }
    } else {
      console.error('[Storage] Error saving stats:', e);
    }
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
