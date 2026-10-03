/**
 * LOTADOR — Sistema Oficial de Níveis e Curva de Dificuldade Progressiva
 * 
 * Princípio: Cada nível é um objeto de configuração (Data-Driven).
 * 
 * Curva de Dificuldade:
 * - Níveis 1–2: 1 objetivo (lotar 2–3 passageiros), tempo generoso, sem obstáculos.
 * - Níveis 3–4: 1–2 objetivos (lotar + ganhar X Kz), primeiros obstáculos (Zungueira).
 * - Níveis 5–7: 2 objetivos, rotas variadas (Viana, Cacuaco, Kilamba, Cazenga), táxis rivais.
 * - Níveis 8–10: 2–3 objetivos, fiscalização/polícia, trânsito denso, tempo mais curto.
 * - Nível 11+: Gerado por fórmula procedural (generateLevel) com teto máximo de jogabilidade.
 */

import { LevelData, LevelObjective } from '../types/levelObjectives';

export type ObjectiveType =
  | 'LOAD_PASSENGERS'
  | 'EARN_KZ'
  | 'FINISH_UNDER_TIME'
  | 'NO_CRASHES'
  | 'USE_SPRINT'
  | 'COMBO';

export interface Objective {
  type: ObjectiveType;
  target: number;
  label: string; // Ex.: "Lota 3 passageiros no táxi de Viana"
}

export interface LevelDifficulty {
  spawnRate: number;      // Passageiros gerados por minuto (4 a 12)
  rivals: number;         // Número de concorrentes na paragem (0 a 2)
  rivalSpeed?: number;    // Velocidade de deslocação do rival
  obstacles: number;      // Número de vendedores ambulantes/zungueiras (0 a 3)
  police: boolean;        // Fiscal de trânsito ativo com apito e multa
  traffic: number;        // Densidade de tráfego de carrinhas (0.0 a 1.0)
}

export interface LevelConfig {
  id: number;
  route: string;            // "Viana", "Cacuaco", "Kilamba", "Cazenga", "Talatona", "Mutamba", "Samba"
  timeLimit: number;        // Segundos de partida
  objectives: Objective[];  // 1 a 3 objetivos combináveis
  difficulty: LevelDifficulty;
  stars: { two: number; three: number }; // Segundos restantes mínimos para 2 e 3 estrelas
  title: string;
  description: string;
  rewardKz: number;
  rewardXp: number;
  tier: 'APRENDIZ' | 'LOTADOR' | 'LOTADOR EXPERIENTE' | 'LOTADOR PROFISSIONAL' | 'MESTRE DA PARAGEM';
}

export const ROUTES = [
  'Viana',
  'Cazenga',
  'Cacuaco',
  'Kilamba',
  'Talatona',
  'Mutamba',
  'Samba',
] as const;

/**
 * Os 10 Primeiros Níveis Feitos à Mão (Hand-Crafted) com Curva Suave
 */
export const INITIAL_LEVELS: LevelConfig[] = [
  // ─── NÍVEIS 1 A 2: APRENDIZ (Sem obstáculos, tempo generoso) ───────────────
  {
    id: 1,
    route: 'Viana',
    title: 'Primeiro Turno na Paragem',
    description: 'Aprende o ritmo da paragem de Viana: chama os clientes e lota o primeiro candongueiro.',
    timeLimit: 120,
    tier: 'APRENDIZ',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 2,
        label: 'Lota 2 passageiros no táxi de Viana',
      },
    ],
    difficulty: {
      spawnRate: 4,
      rivals: 0,
      obstacles: 0,
      police: false,
      traffic: 0.15,
    },
    stars: { two: 50, three: 80 },
    rewardKz: 400,
    rewardXp: 120,
  },
  {
    id: 2,
    route: 'Viana',
    title: 'Mais Clientes em Viana',
    description: 'O movimento cresce na estrada de Catete. Organiza mais passageiros para a carrinha azul.',
    timeLimit: 110,
    tier: 'APRENDIZ',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 3,
        label: 'Lota 3 passageiros no táxi de Viana',
      },
    ],
    difficulty: {
      spawnRate: 5,
      rivals: 0,
      obstacles: 0,
      police: false,
      traffic: 0.25,
    },
    stars: { two: 40, three: 70 },
    rewardKz: 500,
    rewardXp: 150,
  },

  // ─── NÍVEIS 3 A 4: PRIMEIROS OBSTÁCULOS & GANHOS EM KZ ────────────────────
  {
    id: 3,
    route: 'Cazenga',
    title: 'Ruas do Cazenga',
    description: 'Primeira paragem no Cazenga. Cuidado com a Dona Maria e as bacias de fruta no passeio!',
    timeLimit: 100,
    tier: 'APRENDIZ',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 3,
        label: 'Lota 3 passageiros no Cazenga',
      },
      {
        type: 'EARN_KZ',
        target: 300,
        label: 'Arrecada pelo menos 300 Kz',
      },
    ],
    difficulty: {
      spawnRate: 5.5,
      rivals: 0,
      obstacles: 1, // 1 Zungueira
      police: false,
      traffic: 0.3,
    },
    stars: { two: 35, three: 60 },
    rewardKz: 650,
    rewardXp: 180,
  },
  {
    id: 4,
    route: 'Cazenga',
    title: 'Movimento no Asfalto',
    description: 'Mais passageiros querem transporte rápido. Mantém a passada firme e acumula gorjetas.',
    timeLimit: 95,
    tier: 'APRENDIZ',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 4,
        label: 'Lota 4 passageiros no Cazenga',
      },
      {
        type: 'EARN_KZ',
        target: 450,
        label: 'Arrecada pelo menos 450 Kz',
      },
    ],
    difficulty: {
      spawnRate: 6,
      rivals: 0,
      obstacles: 1,
      police: false,
      traffic: 0.35,
    },
    stars: { two: 30, three: 55 },
    rewardKz: 750,
    rewardXp: 210,
  },

  // ─── NÍVEIS 5 A 7: ROTAS DIFERENTES & CONCORRÊNCIA DE RIVAIS ──────────────
  {
    id: 5,
    route: 'Cacuaco',
    title: 'Concorrência em Cacuaco',
    description: 'Aparece o veterano Manuel! Ele disputa os clientes mais rápidos. Faz combo para vencer!',
    timeLimit: 90,
    tier: 'LOTADOR',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 4,
        label: 'Lota 4 passageiros para Cacuaco',
      },
      {
        type: 'COMBO',
        target: 2,
        label: 'Alcança combo x2 de embarque',
      },
    ],
    difficulty: {
      spawnRate: 6.5,
      rivals: 1, // Manuel Veterano
      rivalSpeed: 5.2,
      obstacles: 1,
      police: false,
      traffic: 0.45,
    },
    stars: { two: 25, three: 50 },
    rewardKz: 900,
    rewardXp: 250,
  },
  {
    id: 6,
    route: 'Kilamba',
    title: 'Avenidas do Kilamba',
    description: 'Terminal movimentado com passageiros apressados. Enche os táxis e fatura alto.',
    timeLimit: 85,
    tier: 'LOTADOR',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 5,
        label: 'Lota 5 passageiros para o Kilamba',
      },
      {
        type: 'EARN_KZ',
        target: 600,
        label: 'Arrecada pelo menos 600 Kz',
      },
    ],
    difficulty: {
      spawnRate: 7,
      rivals: 1,
      rivalSpeed: 5.6,
      obstacles: 2, // 2 Vendedores ambulantes
      police: false,
      traffic: 0.5,
    },
    stars: { two: 25, three: 45 },
    rewardKz: 1050,
    rewardXp: 290,
  },
  {
    id: 7,
    route: 'Cazenga',
    title: 'Hora de Ponta no Cazenga',
    description: 'Dois rivais na paragem! Usa o botão CORRER com sabedoria para chegar antes deles.',
    timeLimit: 80,
    tier: 'LOTADOR EXPERIENTE',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 5,
        label: 'Lota 5 passageiros no Cazenga',
      },
      {
        type: 'USE_SPRINT',
        target: 3,
        label: 'Aciona o botão CORRER 3 vezes',
      },
    ],
    difficulty: {
      spawnRate: 7.5,
      rivals: 2, // Manuel + Kito Relâmpago
      rivalSpeed: 6.0,
      obstacles: 2,
      police: false,
      traffic: 0.6,
    },
    stars: { two: 20, three: 40 },
    rewardKz: 1200,
    rewardXp: 330,
  },

  // ─── NÍVEIS 8 A 10: POLÍCIA/FISCAL, TRÂNSITO DENSO & PRESSÃO MÁXIMA ──────
  {
    id: 8,
    route: 'Talatona',
    title: 'Fiscal na Rotunda de Talatona',
    description: 'O Fiscal António está a vigiar a paragem! Não corras perto dele nem batas nos vendedores.',
    timeLimit: 75,
    tier: 'LOTADOR EXPERIENTE',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 5,
        label: 'Lota 5 passageiros em Talatona',
      },
      {
        type: 'NO_CRASHES',
        target: 0,
        label: 'Zero batidas em zungueiras ou fiscais',
      },
    ],
    difficulty: {
      spawnRate: 8,
      rivals: 1,
      rivalSpeed: 6.2,
      obstacles: 2,
      police: true, // Fiscal João ativo
      traffic: 0.7,
    },
    stars: { two: 20, three: 35 },
    rewardKz: 1400,
    rewardXp: 380,
  },
  {
    id: 9,
    route: 'Mutamba',
    title: 'Correria na Mutamba Baixa',
    description: 'O centro histórico de Luanda está em rebuliço. Conclui rápido para garantir gorjetas máximas.',
    timeLimit: 70,
    tier: 'LOTADOR PROFISSIONAL',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 6,
        label: 'Lota 6 passageiros na Mutamba',
      },
      {
        type: 'EARN_KZ',
        target: 800,
        label: 'Arrecada pelo menos 800 Kz',
      },
      {
        type: 'FINISH_UNDER_TIME',
        target: 45,
        label: 'Conclui a fase em menos de 45 segundos',
      },
    ],
    difficulty: {
      spawnRate: 8.5,
      rivals: 2,
      rivalSpeed: 6.6,
      obstacles: 2,
      police: true,
      traffic: 0.8,
    },
    stars: { two: 18, three: 30 },
    rewardKz: 1700,
    rewardXp: 440,
  },
  {
    id: 10,
    route: 'Samba',
    title: 'O Grande Terminal da Samba',
    description: 'O teste definitivo do lotador profissional: trânsito intenso, fiscais e disputas ferozes.',
    timeLimit: 65,
    tier: 'LOTADOR PROFISSIONAL',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 7,
        label: 'Lota 7 passageiros na Samba',
      },
      {
        type: 'COMBO',
        target: 3,
        label: 'Atinge combo x3 de embarque',
      },
      {
        type: 'NO_CRASHES',
        target: 0,
        label: 'Sem infrações nem batidas',
      },
    ],
    difficulty: {
      spawnRate: 9,
      rivals: 2,
      rivalSpeed: 7.0,
      obstacles: 3,
      police: true,
      traffic: 0.9,
    },
    stars: { two: 15, three: 25 },
    rewardKz: 2100,
    rewardXp: 520,
  },
];

/**
 * Gerador Procedural de Fases 11+ com Dificuldade Equilibrada e Teto Máximo
 */
export function generateLevel(n: number): LevelConfig {
  const route = ROUTES[(n - 1) % ROUTES.length];
  const timeLimit = Math.max(50, 130 - (n - 10) * 3);

  // Seleção inteligente de 2 a 3 objetivos
  const objectives: Objective[] = [];
  
  // Objetivo Principal: Lotação de passageiros (teto de 10)
  const loadTarget = Math.min(10, 5 + Math.floor(n / 3));
  objectives.push({
    type: 'LOAD_PASSENGERS',
    target: loadTarget,
    label: `Lota ${loadTarget} passageiros para ${route}`,
  });

  // Objetivo Secundário alternado
  if (n % 2 === 0) {
    const kzTarget = Math.min(2500, 700 + n * 70);
    objectives.push({
      type: 'EARN_KZ',
      target: kzTarget,
      label: `Arrecada pelo menos ${kzTarget} Kz`,
    });
  } else {
    const comboTarget = Math.min(4, 2 + (n >= 16 ? 1 : 0));
    objectives.push({
      type: 'COMBO',
      target: comboTarget,
      label: `Alcança combo x${comboTarget} de embarque`,
    });
  }

  // Terceiro objetivo para fases desafiantes (n >= 13)
  if (n >= 13) {
    if (n % 3 === 0) {
      objectives.push({
        type: 'NO_CRASHES',
        target: 0,
        label: 'Sem batidas com fiscais ou zungueiras',
      });
    } else {
      const sprintTarget = Math.min(6, 3 + (n % 3));
      objectives.push({
        type: 'USE_SPRINT',
        target: sprintTarget,
        label: `Aciona o botão CORRER ${sprintTarget} vezes`,
      });
    }
  }

  // Determinação do Tier
  const tier =
    n >= 20
      ? 'MESTRE DA PARAGEM'
      : n >= 15
      ? 'LOTADOR PROFISSIONAL'
      : 'LOTADOR EXPERIENTE';

  return {
    id: n,
    route,
    title: `Fase ${n}: Linha ${route}`,
    description: `Desafio contínuo na rota de ${route}. Tráfego veloz e disputa de passageiros de elite.`,
    timeLimit,
    tier,
    objectives,
    difficulty: {
      spawnRate: Math.min(12, 6 + n * 0.35),
      rivals: Math.min(2, Math.floor(n / 5)),
      rivalSpeed: Math.min(7.5, 5.8 + n * 0.08),
      obstacles: Math.min(3, 1 + Math.floor(n / 5)),
      police: n >= 8,
      traffic: Math.min(1.0, 0.4 + n * 0.04),
    },
    stars: {
      two: Math.max(10, 24 - Math.floor(n / 2)),
      three: Math.max(20, 42 - Math.floor(n / 2)),
    },
    rewardKz: 1200 + n * 110,
    rewardXp: 300 + n * 25,
  };
}

/**
 * Obtém a configuração de nível (1 a 10 estático, 11+ gerado dinamicamente)
 */
export function getLevelConfig(levelId: number): LevelConfig {
  const id = Math.max(1, levelId);
  if (id <= INITIAL_LEVELS.length) {
    return INITIAL_LEVELS[id - 1];
  }
  return generateLevel(id);
}

/**
 * Converte LevelConfig para o modelo LevelData consumido pelo motor e telas existentes
 */
export function toLevelData(cfg: LevelConfig): LevelData {
  const mappedObjectives: LevelObjective[] = cfg.objectives.map((obj) => {
    let internalMappedType: any = obj.type;
    if (obj.type === 'LOAD_PASSENGERS') internalMappedType = 'PASSENGERS_DELIVERED';
    if (obj.type === 'EARN_KZ') internalMappedType = 'MONEY_EARNED';
    if (obj.type === 'NO_CRASHES') internalMappedType = 'NO_COLLISIONS';

    return {
      type: internalMappedType,
      target_value: obj.target,
      current_value: 0,
      completed: false,
      description: obj.label,
    };
  });

  return {
    level_number: cfg.id,
    tier: cfg.tier,
    chapter_name: cfg.route,
    chapter_id: cfg.route.toLowerCase().replace(/\s+/g, '_'),
    chapter_order: Math.ceil(cfg.id / 3),
    level_title: cfg.title,
    description: cfg.description,
    objectives: mappedObjectives,
    time_limit_seconds: cfg.timeLimit,
    rival_count: cfg.difficulty.rivals,
    rival_speed: cfg.difficulty.rivalSpeed,
    obstacle_count: cfg.difficulty.obstacles,
    fiscal_count: cfg.difficulty.police ? (cfg.id >= 10 ? 2 : 1) : 0,
    taxi_slots_count: cfg.difficulty.traffic > 0.6 ? 3 : cfg.difficulty.traffic > 0.3 ? 2 : 1,
    traffic_density: cfg.difficulty.traffic > 0.7 ? 'ALTO' : cfg.difficulty.traffic > 0.3 ? 'MEDIO' : 'BAIXO',
    reward_kz: cfg.rewardKz,
    reward_xp: cfg.rewardXp,
    unlocked: cfg.id === 1,
    stars: 0,
    difficulty: cfg.difficulty.rivals >= 2 || cfg.difficulty.police ? 'DIFÍCIL' : cfg.id > 3 ? 'MÉDIO' : 'FÁCIL',
    star_conditions: {
      oneStar: 'Cumprir todos os objetivos principais',
      twoStars: `Concluir com mais de ${cfg.stars.two}s restantes`,
      threeStars: `Concluir com mais de ${cfg.stars.three}s restantes e sem infrações`,
    },
  };
}

/**
 * Lista das primeiras 20 fases convertidas para LevelData (compatibilidade imediata)
 */
export const ALL_LEVELS_DATA: LevelData[] = Array.from({ length: 20 }, (_, i) => {
  return toLevelData(getLevelConfig(i + 1));
});
