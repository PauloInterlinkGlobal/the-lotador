/**
 * O LOTADOR — Modelos de Dados de Fases e Objetivos
 * Tipagem oficial e dados de progressão por capítulos de Luanda
 */

import { ALL_LEVELS_DATA } from '../data/levelsData';

export type ObjectiveType =
  | 'PASSENGERS_DELIVERED'
  | 'LOAD_PASSENGERS'
  | 'SPECIFIC_DESTINATION'
  | 'MONEY_EARNED'
  | 'EARN_KZ'
  | 'FULL_CAPACITY_TRIPS'
  | 'BEAT_RIVAL'
  | 'NO_COLLISIONS'
  | 'NO_CRASHES'
  | 'FINISH_UNDER_TIME'
  | 'USE_SPRINT'
  | 'COMBO';

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
  is_tutorial?: boolean;
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
    case 'LOAD_PASSENGERS':
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
    case 'EARN_KZ':
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
    case 'NO_CRASHES':
      return {
        icon: 'shield',
        emoji: '🛡️',
        label: 'Sem Infrações',
        color: '#b388ff',
        badgeBg: 'bg-[#b388ff]/20',
        textColor: 'text-[#b388ff]',
      };
    case 'FINISH_UNDER_TIME':
      return {
        icon: 'schedule',
        emoji: '⏱️',
        label: 'Tempo Rápido',
        color: '#ff7043',
        badgeBg: 'bg-[#ff7043]/20',
        textColor: 'text-[#ff7043]',
      };
    case 'USE_SPRINT':
      return {
        icon: 'bolt',
        emoji: '⚡',
        label: 'Correr',
        color: '#00e5ff',
        badgeBg: 'bg-[#00e5ff]/20',
        textColor: 'text-[#00e5ff]',
      };
    case 'COMBO':
      return {
        icon: 'local_fire_department',
        emoji: '🔥',
        label: 'Combo',
        color: '#fe6b00',
        badgeBg: 'bg-[#fe6b00]/20',
        textColor: 'text-[#fe6b00]',
      };
  }
}

export interface ObjectiveEvaluationSummary {
  type: ObjectiveType;
  description: string;
  completed: boolean;
  current: number;
  target: number;
  displayProgress: string;
}

export interface LevelEvaluation {
  isVictory: boolean;
  allMissionsDone: boolean;
  missionsTotal: number;
  missionsDone: number;
  objectivesSummary: ObjectiveEvaluationSummary[];
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
  obstacleCollisions: number = 0,
  sprintCount: number = 0,
  maxCombo: number = 1
): LevelEvaluation {
  const objectivesSummary: ObjectiveEvaluationSummary[] = (level.objectives || []).map((obj) => {
    let current = 0;
    let completed = false;
    let displayProgress = '';

    if (obj.type === 'PASSENGERS_DELIVERED' || obj.type === 'LOAD_PASSENGERS') {
      current = passengersServed;
      completed = passengersServed >= obj.target_value;
      displayProgress = `${current}/${obj.target_value} passageiros`;
    } else if (obj.type === 'MONEY_EARNED' || obj.type === 'EARN_KZ') {
      current = earnedKz;
      completed = earnedKz >= obj.target_value;
      displayProgress = `${current.toLocaleString()}/${obj.target_value.toLocaleString()} Kz`;
    } else if (obj.type === 'FULL_CAPACITY_TRIPS') {
      current = taxisLoaded;
      completed = taxisLoaded >= obj.target_value;
      displayProgress = `${current}/${obj.target_value} carrinhas`;
    } else if (obj.type === 'BEAT_RIVAL') {
      current = disputesWon;
      completed = disputesWon >= obj.target_value;
      displayProgress = `${current}/${obj.target_value} disputas`;
    } else if (obj.type === 'NO_COLLISIONS' || obj.type === 'NO_CRASHES') {
      current = obstacleCollisions;
      completed = obstacleCollisions === 0;
      displayProgress = completed ? '0 colisões (Perfeito)' : `${current} batidas`;
    } else if (obj.type === 'FINISH_UNDER_TIME') {
      current = durationSeconds;
      completed = durationSeconds <= obj.target_value;
      displayProgress = `${current}s (meta < ${obj.target_value}s)`;
    } else if (obj.type === 'USE_SPRINT') {
      current = sprintCount;
      completed = sprintCount >= obj.target_value;
      displayProgress = `${current}/${obj.target_value} corridas`;
    } else if (obj.type === 'COMBO') {
      current = maxCombo;
      completed = maxCombo >= obj.target_value;
      displayProgress = `x${current} (meta x${obj.target_value})`;
    } else {
      current = obj.current_value || 0;
      completed = obj.completed || current >= obj.target_value;
      displayProgress = `${current}/${obj.target_value}`;
    }

    return {
      type: obj.type,
      description: obj.description,
      completed,
      current,
      target: obj.target_value,
      displayProgress,
    };
  });

  const missionsTotal = objectivesSummary.length;
  const missionsDone = objectivesSummary.filter((o) => o.completed).length;
  const allMissionsDone = missionsTotal > 0 ? missionsDone === missionsTotal : true;

  // Primary check: all objectives must pass
  const primaryPassed = allMissionsDone;
  let primaryReason = '';
  if (!allMissionsDone) {
    const pending = objectivesSummary.filter((o) => !o.completed);
    primaryReason = pending.map((p) => `${p.description} (${p.displayProgress})`).join(' • ');
  }

  // Star 1: Complete primary objectives
  const star1 = primaryPassed;

  // Star 2: Good performance & bonus threshold
  let star2 = false;
  const timeRemaining = (level.time_limit_seconds || 60) - durationSeconds;
  if (star1) {
    if (timeRemaining >= 15 || earnedKz >= (level.reward_kz || 500) * 0.6 || taxisLoaded >= 2) {
      star2 = true;
    }
  }

  // Star 3: Mastery / Paragem Dominada (fast time and no crashes)
  let star3 = false;
  if (star1 && star2) {
    if (obstacleCollisions === 0 && (timeRemaining >= 25 || durationSeconds <= (level.time_limit_seconds || 60) * 0.75)) {
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
    allMissionsDone,
    missionsTotal,
    missionsDone,
    objectivesSummary,
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
    failReason: star1 ? undefined : (primaryReason || 'Tempo esgotado antes de atingir todas as metas da fase'),
  };
}
