/**
 * O LOTADOR — Modelos de Dados de Fases e Objetivos
 * Tipagem oficial e dados de progressão por capítulos de Luanda
 */

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
  chapter_name: string;
  chapter_id: string;
  chapter_order: number;
  level_title: string;
  description: string;
  objectives: LevelObjective[];
  time_limit_seconds: number;
  rival_count: number;
  reward_kz: number;
  unlocked: boolean;
  stars: number; // 0 - 3
  difficulty: 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL' | 'EXTREMO';
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
 * Pelo menos 6 exemplos detalhados de LevelData cobrindo a progressão requerida:
 * - Nível 1: 1 objetivo, 0 rivais (Cazenga)
 * - Nível 5: 2 objetivos, 0 rivais (Viana)
 * - Nível 10: 3 objetivos, 1 rival (Mercado dos Correios)
 * - Nível 13: 3 objetivos, 1 rival (Samba)
 * - Nível 16: 4 objetivos, 2 rivais (Talatona)
 * - Nível 18: 4 objetivos, 3 rivais, tempo apertado (Mutamba)
 * + Níveis intermediários para demonstrar os 6 capítulos completos.
 */
export const SAMPLE_LEVELS_DATA: LevelData[] = [
  // ── CAPÍTULO 1: CAZENGA (Níveis 1 - 3) ──
  {
    level_number: 1,
    chapter_name: 'Cazenga',
    chapter_id: 'cazenga',
    chapter_order: 1,
    level_title: 'Primeira Paragem',
    description: 'Aprende os básicos: chama passageiros e enche o teu primeiro candongueiro em paz.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 4,
        current_value: 4,
        completed: true,
        description: 'Lota 4 passageiros no candongueiro',
      },
    ],
    time_limit_seconds: 120,
    rival_count: 0,
    reward_kz: 350,
    unlocked: true,
    stars: 3,
    difficulty: 'FÁCIL',
  },
  {
    level_number: 2,
    chapter_name: 'Cazenga',
    chapter_id: 'cazenga',
    chapter_order: 1,
    level_title: 'Ritmo do Asfalto',
    description: 'Aperfeiçoa a chamada com o botão [E] para atrair passageiros indecisos.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 6,
        current_value: 6,
        completed: true,
        description: 'Lota 6 passageiros na paragem',
      },
    ],
    time_limit_seconds: 110,
    rival_count: 0,
    reward_kz: 450,
    unlocked: true,
    stars: 3,
    difficulty: 'FÁCIL',
  },
  {
    level_number: 3,
    chapter_name: 'Cazenga',
    chapter_id: 'cazenga',
    chapter_order: 1,
    level_title: 'Lotação Completa',
    description: 'Os motoristas querem a carrinha cheia antes de arrancar. Conclui 1 viagem com 100% de capacidade.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 8,
        current_value: 8,
        completed: true,
        description: 'Chama e entrega 8 passageiros',
      },
      {
        type: 'FULL_CAPACITY_TRIPS',
        target_value: 1,
        current_value: 1,
        completed: true,
        description: 'Enche 1 candongueiro até à lotação esgotada',
      },
    ],
    time_limit_seconds: 100,
    rival_count: 0,
    reward_kz: 600,
    unlocked: true,
    stars: 2,
    difficulty: 'FÁCIL',
  },

  // ── CAPÍTULO 2: VIANA EXPRESS (Níveis 4 - 6) ──
  {
    level_number: 4,
    chapter_name: 'Viana Express',
    chapter_id: 'viana',
    chapter_order: 2,
    level_title: 'Avenida Deolinda Rodrigues',
    description: 'O fluxo de Viana nunca para. Enche carrinhas rápidas e arrecada Kwanzas.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 8,
        current_value: 8,
        completed: true,
        description: 'Entrega 8 passageiros para Viana',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 400,
        current_value: 400,
        completed: true,
        description: 'Ganha 400 Kz em gorjetas',
      },
    ],
    time_limit_seconds: 90,
    rival_count: 0,
    reward_kz: 800,
    unlocked: true,
    stars: 2,
    difficulty: 'MÉDIO',
  },
  {
    level_number: 5,
    chapter_name: 'Viana Express',
    chapter_id: 'viana',
    chapter_order: 2,
    level_title: 'Hora de Ponta em Viana',
    description: 'Muitos passageiros apressados na paragem da Robaldina. Alcança a meta de passageiros e dinheiro!',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 10,
        current_value: 7,
        completed: false,
        description: 'Chama e lota 10 passageiros',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 600,
        current_value: 480,
        completed: false,
        description: 'Arrecada 600 Kz com o motorista',
      },
    ],
    time_limit_seconds: 85,
    rival_count: 0,
    reward_kz: 1000,
    unlocked: true,
    stars: 1,
    difficulty: 'MÉDIO',
  },
  {
    level_number: 6,
    chapter_name: 'Viana Express',
    chapter_id: 'viana',
    chapter_order: 2,
    level_title: 'Travessia da Ponte',
    description: 'Garante que os passageiros com destino específico apanham o candongueiro correto.',
    objectives: [
      {
        type: 'SPECIFIC_DESTINATION',
        target_value: 6,
        current_value: 4,
        completed: false,
        description: 'Embarca 6 passageiros com rota VIANA',
      },
      {
        type: 'FULL_CAPACITY_TRIPS',
        target_value: 2,
        current_value: 1,
        completed: false,
        description: 'Envia 2 candongueiros 100% lotados',
      },
    ],
    time_limit_seconds: 80,
    rival_count: 0,
    reward_kz: 1200,
    unlocked: true,
    stars: 0,
    difficulty: 'MÉDIO',
  },

  // ── CAPÍTULO 3: MERCADO DOS CORREIOS (Níveis 7 - 10) ──
  {
    level_number: 7,
    chapter_name: 'Mercado dos Correios',
    chapter_id: 'mercado_correios',
    chapter_order: 3,
    level_title: 'Entrada da Feira',
    description: 'Cuidado com as Zungueiras a atravessar com banheiras de fruta! Desvia-te e continua a lotar.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 10,
        current_value: 0,
        completed: false,
        description: 'Lota 10 passageiros na feira',
      },
      {
        type: 'NO_COLLISIONS',
        target_value: 0,
        current_value: 0,
        completed: true,
        description: 'Evita tropeçar nas ambulantes',
      },
    ],
    time_limit_seconds: 75,
    rival_count: 0,
    reward_kz: 1400,
    unlocked: true,
    stars: 0,
    difficulty: 'MÉDIO',
  },
  {
    level_number: 10,
    chapter_name: 'Mercado dos Correios',
    chapter_id: 'mercado_correios',
    chapter_order: 3,
    level_title: 'Duelo com Kito Relâmpago',
    description: 'O Kito é o lotador mais rápido do mercado. Não deixes que ele roube os teus passageiros!',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 12,
        current_value: 8,
        completed: false,
        description: 'Lota 12 passageiros no teu candongueiro',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 800,
        current_value: 650,
        completed: false,
        description: 'Arrecada 800 Kz de receita',
      },
      {
        type: 'BEAT_RIVAL',
        target_value: 1,
        current_value: 0,
        completed: false,
        description: 'Termina à frente do rival Kito',
      },
    ],
    time_limit_seconds: 75,
    rival_count: 1,
    reward_kz: 2000,
    unlocked: true,
    stars: 0,
    difficulty: 'DIFÍCIL',
  },

  // ── CAPÍTULO 4: SAMBA TERMINAL (Níveis 11 - 13) ──
  {
    level_number: 13,
    chapter_name: 'Samba Terminal',
    chapter_id: 'samba',
    chapter_order: 4,
    level_title: 'Cruzamento da Samba',
    description: 'Aqui chegam candongueiros para Benfica e para o Centro. Não mistures as rotas!',
    objectives: [
      {
        type: 'SPECIFIC_DESTINATION',
        target_value: 8,
        current_value: 5,
        completed: false,
        description: 'Organiza 8 passageiros para o Centro',
      },
      {
        type: 'FULL_CAPACITY_TRIPS',
        target_value: 2,
        current_value: 1,
        completed: false,
        description: 'Despacha 2 carrinhas no limite máximo',
      },
      {
        type: 'BEAT_RIVAL',
        target_value: 1,
        current_value: 1,
        completed: true,
        description: 'Supera o Manuel Veterano',
      },
    ],
    time_limit_seconds: 70,
    rival_count: 1,
    reward_kz: 2600,
    unlocked: false,
    stars: 0,
    difficulty: 'DIFÍCIL',
  },

  // ── CAPÍTULO 5: TALATONA SUL (Níveis 14 - 16) ──
  {
    level_number: 16,
    chapter_name: 'Talatona Sul',
    chapter_id: 'talatona',
    chapter_order: 5,
    level_title: 'Rotunda do Belas',
    description: 'Zona nobre com passageiros executivos muito apressados. Dois rivais estão prontos a disputar cada corrida!',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 14,
        current_value: 9,
        completed: false,
        description: 'Chama e entrega 14 passageiros',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 1200,
        current_value: 900,
        completed: false,
        description: 'Alcança 1.200 Kz em receita',
      },
      {
        type: 'FULL_CAPACITY_TRIPS',
        target_value: 3,
        current_value: 2,
        completed: false,
        description: 'Enche 3 viagens com lotação total',
      },
      {
        type: 'BEAT_RIVAL',
        target_value: 2,
        current_value: 1,
        completed: false,
        description: 'Ganha vantagem sobre Kito e Manuel',
      },
    ],
    time_limit_seconds: 65,
    rival_count: 2,
    reward_kz: 3500,
    unlocked: false,
    stars: 0,
    difficulty: 'EXTREMO',
  },

  // ── CAPÍTULO 6: MUTAMBA / CENTRO (Níveis 17 - 18) ──
  {
    level_number: 17,
    chapter_name: 'Mutamba (Centro)',
    chapter_id: 'mutamba',
    chapter_order: 6,
    level_title: 'Largo do Kinaxixi',
    description: 'A pressão máxima do centro de Luanda. Multidão densa, apitos de fiscais e concorrência furiosa.',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 16,
        current_value: 0,
        completed: false,
        description: 'Entrega 16 passageiros em tempo recorde',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 1500,
        current_value: 0,
        completed: false,
        description: 'Fatura 1.500 Kz na paragem central',
      },
      {
        type: 'NO_COLLISIONS',
        target_value: 0,
        current_value: 0,
        completed: true,
        description: 'Zero infrações e zero colisões com fiscais',
      },
    ],
    time_limit_seconds: 55,
    rival_count: 2,
    reward_kz: 4500,
    unlocked: false,
    stars: 0,
    difficulty: 'EXTREMO',
  },
  {
    level_number: 18,
    chapter_name: 'Mutamba (Centro)',
    chapter_id: 'mutamba',
    chapter_order: 6,
    level_title: 'O Rei do Candongueiro',
    description: 'A prova final de mestria: 4 objetivos em simultâneo com 3 rivais e tempo ultra apertado!',
    objectives: [
      {
        type: 'PASSENGERS_DELIVERED',
        target_value: 18,
        current_value: 12,
        completed: false,
        description: 'Chama e lota 18 passageiros',
      },
      {
        type: 'MONEY_EARNED',
        target_value: 2000,
        current_value: 1450,
        completed: false,
        description: 'Acumula 2.000 Kz de ganhos',
      },
      {
        type: 'FULL_CAPACITY_TRIPS',
        target_value: 4,
        current_value: 3,
        completed: false,
        description: 'Envia 4 carrinhas no limite máximo',
      },
      {
        type: 'BEAT_RIVAL',
        target_value: 3,
        current_value: 2,
        completed: false,
        description: 'Supera os 3 rivais em jogo',
      },
    ],
    time_limit_seconds: 50,
    rival_count: 3,
    reward_kz: 6000,
    unlocked: false,
    stars: 0,
    difficulty: 'EXTREMO',
  },
];

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
