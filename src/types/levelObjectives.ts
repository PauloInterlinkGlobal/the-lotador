/**
 * O LOTADOR — Modelos de Dados de Fases e Objetivos
 * Tipagem oficial e dados de progressão por capítulos de Luanda
 */

import { ALL_LEVELS_DATA } from '../data/levelsData';

export type ObjectiveType =
  | 'PASSENGERS_DELIVERED'
  | 'SPECIFIC_DESTINATION'
  | 'MONEY_EARNED'
  | 'FULL_CAPACITY_TRIPS'
  | 'BEAT_RIVAL'
  | 'NO_COLLISIONS';

export interface LevelObjective {
  type: ObjectiveType;
  target_value: number;
  current_value: number;
  completed: boolean;
  description: string;
}

export interface LevelData {
  level_number: number;
  tier: 'APRENDIZ' | 'LOTADOR' | 'LOTADOR EXPERIENTE' | 'LOTADOR PROFISSIONAL' | 'MESTRE DA PARAGEM';
  chapter_name: string;
  chapter_id: string;
  chapter_order: number;
  level_title: string;
  description: string;
  objectives: LevelObjective[];
  time_limit_seconds: number;
  rival_count: number;
  rival_speed?: number;
  obstacle_count?: number; // zungueiras
  fiscal_count?: number; // fiscais
  taxi_slots_count?: number; // 1, 2, or 3
  traffic_density?: 'BAIXO' | 'MEDIO' | 'ALTO';
  reward_kz: number;
  reward_xp?: number;
  unlocked: boolean;
  stars: number; // 0 - 3
  difficulty: 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL' | 'EXTREMO';
  star_conditions?: {
    oneStar: string;
    twoStars: string;
    threeStars: string;
  };
}

export interface ChapterMeta {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  accentColor: string;
  icon: string;
  unlockedLevelReq: number;
}

export const CHAPTERS_LIST: ChapterMeta[] = [
  {
    id: 'cazenga',
    name: 'Cazenga',
    subtitle: 'O Berço do Lotador • Ruas de Areia & Paragens Locais',
    color: '#8c5a3c',
    accentColor: '#d4a373',
    icon: 'cottage',
    unlockedLevelReq: 1,
  },
  {
    id: 'viana',
    name: 'Viana Express',
    subtitle: 'Estrada de Catete • Tráfego Rápido & Candongueiros Azuis',
    color: '#006399',
    accentColor: '#00b4d8',
    icon: 'airport_shuttle',
    unlockedLevelReq: 4,
  },
  {
    id: 'mercado_correios',
    name: 'Mercado dos Correios',
    subtitle: 'Comércio Ativo • Zungueiras & Primeiro Rival',
    color: '#fe6b00',
    accentColor: '#ffd700',
    icon: 'storefront',
    unlockedLevelReq: 7,
  },
  {
    id: 'samba',
    name: 'Samba Terminal',
    subtitle: 'Avenida 21 de Janeiro • Rotas Bifurcadas (Benfica & Centro)',
    color: '#2e7d32',
    accentColor: '#4caf50',
    icon: 'alt_route',
    unlockedLevelReq: 11,
  },
  {
    id: 'talatona',
    name: 'Talatona Sul',
    subtitle: 'Avenidas Largas • Passageiros Apressados & Lotação Máxima',
    color: '#7b1fa2',
    accentColor: '#ba68c8',
    icon: 'domain',
    unlockedLevelReq: 14,
  },
  {
    id: 'mutamba',
    name: 'Mutamba (Centro)',
    subtitle: 'O Coração de Luanda • Competição Feroz & Trânsito Caótico',
    color: '#ba1a1a',
    accentColor: '#ff5252',
    icon: 'location_city',
    unlockedLevelReq: 17,
  },
];

/**
 * Lista completa das 20 fases do jogo LOTADOR divididas por 5 Tiers e 6 Bairros de Luanda.
 */
export const SAMPLE_LEVELS_DATA: LevelData[] = ALL_LEVELS_DATA;

/**
 * Retorna os ícones e cores temáticas para cada tipo de objetivo.
 */
export function getObjectiveVisuals(type: ObjectiveType) {
  switch (type) {
    case 'PASSENGERS_DELIVERED':
      return {
        icon: 'person',
        emoji: '🧍',
        label: 'Passageiros',
        color: '#00b4d8',
        badgeBg: 'bg-[#00b4d8]/20',
        textColor: 'text-[#00b4d8]',
      };
    case 'SPECIFIC_DESTINATION':
      return {
        icon: 'alt_route',
        emoji: '🗺️',
        label: 'Rota Específica',
        color: '#4caf50',
        badgeBg: 'bg-[#4caf50]/20',
        textColor: 'text-[#4caf50]',
      };
    case 'MONEY_EARNED':
      return {
        icon: 'payments',
        emoji: '💰',
        label: 'Kz Arrecadados',
        color: '#ffd700',
        badgeBg: 'bg-[#ffd700]/20',
        textColor: 'text-[#ffd700]',
      };
    case 'FULL_CAPACITY_TRIPS':
      return {
        icon: 'airport_shuttle',
        emoji: '🚕',
        label: 'Lotação Completa',
        color: '#fe6b00',
        badgeBg: 'bg-[#fe6b00]/20',
        textColor: 'text-[#fe6b00]',
      };
    case 'BEAT_RIVAL':
      return {
        icon: 'sports_score',
        emoji: '🏁',
        label: 'Vencer Rivais',
        color: '#ff5252',
        badgeBg: 'bg-[#ff5252]/20',
        textColor: 'text-[#ff5252]',
      };
    case 'NO_COLLISIONS':
      return {
        icon: 'shield',
        emoji: '🛡️',
        label: 'Sem Infrações',
        color: '#b388ff',
        badgeBg: 'bg-[#b388ff]/20',
        textColor: 'text-[#b388ff]',
      };
  }
}

export interface LevelEvaluation {
  isVictory: boolean;
  stars: number;
  starsBreakdown: {
    star1: boolean;
    star2: boolean;
    star3: boolean;
  };
  isParagemDominada: boolean;
  firstTimeClearBonus: number;
  bonusKz: number;
  bonusXp: number;
  failReason?: string;
}

export function evaluateLevelResult(
  level: LevelData,
  earnedKz: number,
  passengersServed: number,
  taxisLoaded: number,
  durationSeconds: number,
  disputesWon: number = 0,
  obstacleCollisions: number = 0
): LevelEvaluation {
  let primaryPassed = true;
  let primaryReason = '';

  for (const obj of level.objectives) {
    if (obj.type === 'PASSENGERS_DELIVERED') {
      if (passengersServed < obj.target_value) {
        primaryPassed = false;
        primaryReason = `Entregaste ${passengersServed}/${obj.target_value} passageiros`;
      }
    } else if (obj.type === 'MONEY_EARNED') {
      if (earnedKz < obj.target_value) {
        primaryPassed = false;
        primaryReason = `Arrecadaste ${earnedKz}/${obj.target_value} Kz`;
      }
    } else if (obj.type === 'FULL_CAPACITY_TRIPS') {
      if (taxisLoaded < obj.target_value) {
        primaryPassed = false;
        primaryReason = `Lotaste ${taxisLoaded}/${obj.target_value} carrinhas`;
      }
    } else if (obj.type === 'BEAT_RIVAL') {
      if (disputesWon < obj.target_value) {
        primaryPassed = false;
        primaryReason = `Venceste ${disputesWon}/${obj.target_value} disputas com o rival`;
      }
    } else if (obj.type === 'NO_COLLISIONS') {
      if (obstacleCollisions > 0) {
        primaryPassed = false;
        primaryReason = `Tiveste ${obstacleCollisions} colisões com vendedores ou fiscal`;
      }
    }
  }

  // Star 1: Complete primary objectives
  const star1 = primaryPassed;

  // Star 2: Good performance & bonus threshold
  let star2 = false;
  if (star1) {
    const timeRemaining = (level.time_limit_seconds || 60) - durationSeconds;
    if (timeRemaining >= 10 || earnedKz >= (level.reward_kz || 500) * 0.6 || disputesWon >= 1 || taxisLoaded >= 2) {
      star2 = true;
    }
  }

  // Star 3: Mastery / Paragem Dominada
  let star3 = false;
  if (star1 && star2) {
    if (obstacleCollisions === 0 || durationSeconds <= (level.time_limit_seconds || 60) * 0.75) {
      star3 = true;
    }
  }

  const starsCount = (star1 ? 1 : 0) + (star2 ? 1 : 0) + (star3 ? 1 : 0);
  const isParagemDominada = starsCount === 3;

  const baseRewardKz = level.reward_kz || 500;
  const baseRewardXp = level.reward_xp || 150;

  const bonusMultiplier = starsCount === 3 ? 1.5 : starsCount === 2 ? 1.25 : 1.0;
  const bonusKz = star1 ? Math.round(baseRewardKz * (bonusMultiplier - 1.0)) : 0;
  const bonusXp = star1 ? Math.round(baseRewardXp * (bonusMultiplier - 1.0)) : 0;

  return {
    isVictory: star1,
    stars: starsCount,
    starsBreakdown: {
      star1,
      star2,
      star3,
    },
    isParagemDominada,
    firstTimeClearBonus: star1 ? baseRewardKz : 0,
    bonusKz,
    bonusXp,
    failReason: star1 ? undefined : (primaryReason || 'Tempo esgotado antes de atingir as metas'),
  };
}
