/**
 * LOTADOR — Sistema Oficial de Níveis e Curva de Dificuldade Progressiva
 * 
 * Princípio: Cada nível é um objeto de configuração Data-Driven puro (LevelConfig),
 * permitindo balanceamento ágil sem alterar o loop central do jogo.
 * 
 * Curva de Dificuldade Progressiva:
 * - Níveis 1–2: 1 objetivo simples (lotar 2–3 passageiros), tempo generoso, sem pressão.
 *               O Nível 1 é o TUTORIAL oficial guiado da paragem de Viana.
 * - Níveis 3–4: 1–2 objetivos (lotar passageiros + arrecadar Kz); surgem obstáculos (Zungueira).
 * - Níveis 5–7: 2 objetivos, rotas variadas (Viana, Cacuaco, Kilamba, Cazenga), concorrência
 *               de rivais disputando passageiros e combos de embarque.
 * - Níveis 8–10: 2–3 objetivos, fiscalização policial ativa (apito e multas), trânsito denso,
 *                tempo mais curto e ritmo frenético.
 * - Nível 11+: Gerador procedural infinito (generateLevel) com escalabilidade progressiva.
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
  label: string; // Ex.: "Lota 2 passageiros no táxi de Viana"
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
  route: string;            // "Viana", "Cazenga", "Cacuaco", "Kilamba", "Talatona", "Mutamba", "Samba"
  title: string;
  description: string;
  timeLimit: number;        // Segundos de partida
  isTutorial?: boolean;     // Verdadeiro no Nível 1
  objectives: Objective[];  // 1 a 3 objetivos combináveis
  difficulty: LevelDifficulty;
  stars: { two: number; three: number }; // Segundos restantes mínimos para 2 e 3 estrelas
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
 * Os 10 Primeiros Níveis Feitos à Mão (Hand-Crafted) com Balanceamento Rigoroso
 */
export const INITIAL_LEVELS: LevelConfig[] = [
  // ─── NÍVEIS 1 A 2: APRENDIZ (Sem obstáculos, tempo generoso, Nível 1 é o Tutorial) ───
  {
    id: 1,
    route: 'Viana',
    title: 'Tutorial: Primeiro Turno na Paragem',
    description: 'Aprende a arte do lotador em Luanda: aproximar-te dos clientes, usar CHAMAR [E], conduzi-los ao candongueiro azul e carregar em LOTAR! [Espaço].',
    timeLimit: 120,
    isTutorial: true,
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
    rewardKz: 500,
    rewardXp: 150,
  },
  {
    id: 2,
    route: 'Viana',
    title: 'Mais Clientes em Viana',
    description: 'O movimento cresce na paragem de Catete. O tempo é generoso e não há obstáculos: chama e lota 3 passageiros para a carrinha azul.',
    timeLimit: 110,
    isTutorial: false,
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
    rewardKz: 600,
    rewardXp: 180,
  },

  // ─── NÍVEIS 3 A 4: PRIMEIROS OBSTÁCULOS & GANHOS EM KZ ────────────────────
  {
    id: 3,
    route: 'Cazenga',
    title: 'Ruas do Cazenga',
    description: 'Primeira paragem no Cazenga. Cuidado com a Dona Maria e as bacias de fruta no passeio! Lota 3 passageiros e arrecada 300 Kz.',
    timeLimit: 100,
    isTutorial: false,
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
      obstacles: 1, // 1 Zungueira (Dona Maria)
      police: false,
      traffic: 0.3,
    },
    stars: { two: 35, three: 60 },
    rewardKz: 750,
    rewardXp: 210,
  },
  {
    id: 4,
    route: 'Cazenga',
    title: 'Movimento no Asfalto',
    description: 'Mais passageiros procuram transporte rápido. Mantém a passada firme, lota 4 passageiros e acumula gorjetas.',
    timeLimit: 95,
    isTutorial: false,
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
    rewardKz: 850,
    rewardXp: 240,
  },

  // ─── NÍVEIS 5 A 7: ROTAS DIFERENTES & CONCORRÊNCIA DE RIVAIS ──────────────
  {
    id: 5,
    route: 'Cacuaco',
    title: 'Concorrência em Cacuaco',
    description: 'Aparece o veterano Manuel! Ele disputa os clientes mais rápidos. Faz combo x2 de embarque para vencer a disputa!',
    timeLimit: 90,
    isTutorial: false,
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
    rewardKz: 1000,
    rewardXp: 280,
  },
  {
    id: 6,
    route: 'Kilamba',
    title: 'Avenidas do Kilamba',
    description: 'Terminal movimentado nas centralidades do Kilamba. Passageiros apressados exigem resposta rápida e sprint.',
    timeLimit: 85,
    isTutorial: false,
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
      obstacles: 2, // 2 Ambulantes
      police: false,
      traffic: 0.5,
    },
    stars: { two: 25, three: 45 },
    rewardKz: 1150,
    rewardXp: 320,
  },
  {
    id: 7,
    route: 'Cazenga',
    title: 'Hora de Ponta no Cazenga',
    description: 'Dois rivais disputam cada cliente na paragem! Usa o botão CORRER com sabedoria para chegar antes deles.',
    timeLimit: 80,
    isTutorial: false,
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
    rewardKz: 1300,
    rewardXp: 360,
  },

  // ─── NÍVEIS 8 A 10: POLÍCIA/FISCAL, TRÂNSITO DENSO & PRESSÃO MÁXIMA ──────
  {
    id: 8,
    route: 'Talatona',
    title: 'Fiscal na Rotunda de Talatona',
    description: 'O Fiscal António está a vigiar a paragem com apito em riste! Não corras descontrolado nem batas nos vendedores.',
    timeLimit: 75,
    isTutorial: false,
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
    rewardKz: 1500,
    rewardXp: 400,
  },
  {
    id: 9,
    route: 'Mutamba',
    title: 'Correria na Mutamba Baixa',
    description: 'O centro histórico e financeiro de Luanda está em rebuliço. Conclui em menos de 45 segundos para garantir gorjetas máximas.',
    timeLimit: 70,
    isTutorial: false,
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
    rewardKz: 1800,
    rewardXp: 460,
  },
  {
    id: 10,
    route: 'Samba',
    title: 'O Grande Terminal da Samba',
    description: 'O teste definitivo do lotador profissional: trânsito denso, fiscais em patrulha e 2 rivais velozes. Conquista o respeito total!',
    timeLimit: 65,
    isTutorial: false,
    tier: 'LOTADOR PROFISSIONAL',
    objectives: [
      {
        type: 'LOAD_PASSENGERS',
        target: 6,
        label: 'Lota 6 passageiros na Samba',
      },
      {
        type: 'EARN_KZ',
        target: 1000,
        label: 'Arrecada pelo menos 1.000 Kz',
      },
      {
        type: 'NO_CRASHES',
        target: 0,
        label: 'Zero batidas em fiscais de trânsito',
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
    rewardKz: 2200,
    rewardXp: 550,
  },
];

/**
 * Níveis 11+: Gerador Procedural com Dificuldade Infinita e Equilibrada
 */
export function generateLevel(n: number): LevelConfig {
  const routeIdx = (n - 1) % ROUTES.length;
  const route = ROUTES[routeIdx];
  const timeLimit = Math.max(50, 100 - n * 3);

  const pool: Objective[] = [
    {
      type: 'LOAD_PASSENGERS',
      target: Math.min(8, 4 + Math.floor(n / 4)),
      label: `Lota ${Math.min(8, 4 + Math.floor(n / 4))} passageiros para ${route}`,
    },
    {
      type: 'EARN_KZ',
      target: Math.round(500 + n * 110),
      label: `Arrecada pelo menos ${Math.round(500 + n * 110).toLocaleString()} Kz`,
    },
    {
      type: 'USE_SPRINT',
      target: Math.min(6, 2 + Math.floor(n / 5)),
      label: `Aciona o botão CORRER ${Math.min(6, 2 + Math.floor(n / 5))} vezes`,
    },
    {
      type: 'COMBO',
      target: Math.min(5, 2 + Math.floor(n / 7)),
      label: `Alcança combo x${Math.min(5, 2 + Math.floor(n / 7))} de embarque`,
    },
    {
      type: 'NO_CRASHES',
      target: 0,
      label: 'Zero batidas em fiscais de trânsito',
    },
    {
      type: 'FINISH_UNDER_TIME',
      target: Math.max(30, timeLimit - 25),
      label: `Conclui a fase em menos de ${Math.max(30, timeLimit - 25)}s`,
    },
  ];

  // Escolhe 2 a 3 objetivos determinísticos baseados no nível
  const count = n >= 15 ? 3 : 2;
  const objectives: Objective[] = [];
  objectives.push(pool[0]); // Sempre inclui lotação de passageiros
  objectives.push(pool[1 + ((n * 2) % (pool.length - 1))]);
  if (count === 3) {
    const thirdIdx = 1 + ((n * 3 + 1) % (pool.length - 1));
    if (!objectives.some((o) => o.type === pool[thirdIdx].type)) {
      objectives.push(pool[thirdIdx]);
    } else {
      objectives.push(pool[2]);
    }
  }

  let tier: LevelConfig['tier'] = 'LOTADOR EXPERIENTE';
  if (n >= 18) tier = 'MESTRE DA PARAGEM';
  else if (n >= 12) tier = 'LOTADOR PROFISSIONAL';

  return {
    id: n,
    route,
    title: `Desafio da Linha ${route} (Turno ${n})`,
    description: `A rota de ${route} exige rapidez e perícia: coordena os candongueiros e ultrapassa os concorrentes locais.`,
    timeLimit,
    isTutorial: false,
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
    is_tutorial: cfg.isTutorial || cfg.id === 1,
    difficulty: cfg.difficulty.rivals >= 2 || cfg.difficulty.police ? 'DIFÍCIL' : cfg.id > 3 ? 'MÉDIO' : 'FÁCIL',
    star_conditions: {
      oneStar: 'Cumprir todos os objetivos principais',
      twoStars: `Concluir com mais de ${cfg.stars.two}s restantes`,
      threeStars: `Concluir com mais de ${cfg.stars.three}s restantes e sem infrações`,
    },
  };
}

/**
 * Array oficial com os níveis balanceados para o jogo (Nível 1 é o Tutorial guiado)
 */
export const ALL_LEVELS_DATA: LevelData[] = Array.from({ length: 20 }, (_, i) => {
  return toLevelData(getLevelConfig(i + 1));
});
