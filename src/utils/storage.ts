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
  highestUnlockedLevel: 1,
  levelStars: {},
  levelHighScores: {},
};

export const isMobileOrLowEnd = typeof navigator !== 'undefined' && (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent || '') ||
  (typeof window !== 'undefined' && 'ontouchstart' in window && Math.min(window.screen.width, window.screen.height) < 768) ||
  (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) ||
  (typeof (navigator as any).deviceMemory === 'number' && (navigator as any).deviceMemory <= 3) ||
  (typeof (window as any).Capacitor !== 'undefined')
);

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  graphicsQuality: 'LOW',
  language: 'PT',
  showFpsOverlay: false,
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

// Level formulas & Titles matching LOTADOR 5 Tiers
export function getLevelTitle(level: number): string {
  if (level >= 25) return 'Rei do Asfalto';
  if (level >= 17) return 'Mestre da Paragem';
  if (level >= 13) return 'Lotador Profissional';
  if (level >= 9) return 'Lotador Experiente';
  if (level >= 5) return 'Lotador';
  return 'Aprendiz';
}

export function getPlayerTier(level: number): { tier: string; badge: string; color: string; bg: string } {
  if (level >= 17) {
    return { tier: 'MESTRE DA PARAGEM', badge: '👑 MESTRE', color: '#ffd700', bg: 'bg-[#ffd700]/20' };
  }
  if (level >= 13) {
    return { tier: 'LOTADOR PROFISSIONAL', badge: '💎 PROFISSIONAL', color: '#ba68c8', bg: 'bg-[#ba68c8]/20' };
  }
  if (level >= 9) {
    return { tier: 'LOTADOR EXPERIENTE', badge: '🔥 EXPERIENTE', color: '#fe6b00', bg: 'bg-[#fe6b00]/20' };
  }
  if (level >= 5) {
    return { tier: 'LOTADOR', badge: '🚐 LOTADOR', color: '#00b4d8', bg: 'bg-[#00b4d8]/20' };
  }
  return { tier: 'APRENDIZ', badge: '🌱 APRENDIZ', color: '#a3e635', bg: 'bg-[#a3e635]/20' };
}

export function getXpForNextLevel(level: number): number {
  return level * 150 + 100;
}

export function getUpgradeCost(currentLevel: number): number {
  return (currentLevel + 1) * 350;
}

/**
 * Registra o término de uma fase no perfil do jogador e desbloqueia a fase seguinte
 * se o jogador alcançou pelo menos 1 estrela (ou vitória no objetivo principal).
 */
export function recordLevelCompletion(
  currentStats: PlayerStats,
  levelNumber: number,
  starsEarned: number,
  scoreKz: number
): { updatedStats: PlayerStats; newUnlockedLevel: boolean } {
  const currentUnlocked = currentStats.highestUnlockedLevel || 1;
  const nextLevel = Math.min(20, Math.max(currentUnlocked, levelNumber + (starsEarned > 0 ? 1 : 0)));
  const newUnlockedLevel = nextLevel > currentUnlocked;

  const currentStars = currentStats.levelStars?.[levelNumber] || 0;
  const bestStars = Math.max(currentStars, starsEarned);

  const currentHighScore = currentStats.levelHighScores?.[levelNumber] || 0;
  const bestScore = Math.max(currentHighScore, scoreKz);

  const updatedStats: PlayerStats = {
    ...currentStats,
    highestUnlockedLevel: nextLevel,
    levelStars: {
      ...(currentStats.levelStars || {}),
      [levelNumber]: bestStars,
    },
    levelHighScores: {
      ...(currentStats.levelHighScores || {}),
      [levelNumber]: bestScore,
    },
  };

  savePlayerStats(updatedStats);
  return { updatedStats, newUnlockedLevel };
}
