/**
 * LOTADOR - Game Data Types
 */

export type PassengerType = 
  | 'COMERCIANTE_BEGE'
  | 'ESTUDANTE_GRAVATA'
  | 'MAMA_ROXO'
  | 'EXECUTIVO_AZUL'
  | 'MOCA_AMARELA'
  | 'JOVEM_VERDE'
  | 'TRABALHADOR'
  | 'ESTUDANTE'
  | 'IDOSO'
  | 'JOVEM'
  | 'EXECUTIVO'
  | 'IMPACIENTE'
  | 'VIP'
  // Legacy aliases for backward compatibility
  | 'NORMAL'
  | 'APRESSADO'
  | 'INDECISO'
  | 'OBSERVADOR'
  | 'EXIGENTE'
  | 'CORRERIA'
  | 'ESPECIAL';

export interface PassengerArchetypeDef {
  type: PassengerType;
  label: string;
  tagline: string;
  speed: number;
  patience: number;
  value: number;
  xp: number;
  spriteKey: string;
  color: string;
}

export const LUANDA_PASSENGER_ARCHETYPES: Record<string, PassengerArchetypeDef> = {
  COMERCIANTE_BEGE: {
    type: 'COMERCIANTE_BEGE',
    label: 'Comerciante de Bege',
    tagline: 'Camisa cáqui, bolsa transversal e passo firme',
    speed: 3.3,
    patience: 48,
    value: 150,
    xp: 25,
    spriteKey: 'passenger_comerciante_bege',
    color: '#d4a373',
  },
  ESTUDANTE_GRAVATA: {
    type: 'ESTUDANTE_GRAVATA',
    label: 'Estudante Uniformizado',
    tagline: 'Farda branca, gravata azul e mochila',
    speed: 4.0,
    patience: 35,
    value: 100,
    xp: 20,
    spriteKey: 'passenger_estudante_gravata',
    color: '#38bdf8',
  },
  MAMA_ROXO: {
    type: 'MAMA_ROXO',
    label: 'Mama Quitandeira',
    tagline: 'Vestido roxo estampado e sacolas cheias',
    speed: 2.4,
    patience: 60,
    value: 200,
    xp: 35,
    spriteKey: 'passenger_mama_quitandeira',
    color: '#9333ea',
  },
  EXECUTIVO_AZUL: {
    type: 'EXECUTIVO_AZUL',
    label: 'Executivo de Camisa Azul',
    tagline: 'Camisa azul, pasta de couro e relógio',
    speed: 3.5,
    patience: 25,
    value: 280,
    xp: 45,
    spriteKey: 'passenger_executivo_azul',
    color: '#0284c7',
  },
  MOCA_AMARELA: {
    type: 'MOCA_AMARELA',
    label: 'Jovem Moça Estilosa',
    tagline: 'T-shirt amarela, jeans e tranças compridas',
    speed: 3.8,
    patience: 40,
    value: 160,
    xp: 30,
    spriteKey: 'passenger_moca_amarela',
    color: '#eab308',
  },
  JOVEM_VERDE: {
    type: 'JOVEM_VERDE',
    label: 'Jovem de Moletom Verde',
    tagline: 'Moletom verde com capuz e ténis brancos',
    speed: 4.2,
    patience: 22,
    value: 170,
    xp: 30,
    spriteKey: 'passenger_jovem_verde',
    color: '#16a34a',
  },
  // Mapeamentos para manter compatibilidade
  TRABALHADOR: {
    type: 'TRABALHADOR',
    label: 'Comerciante de Bege',
    tagline: 'Camisa cáqui, bolsa transversal e passo firme',
    speed: 3.3,
    patience: 48,
    value: 150,
    xp: 25,
    spriteKey: 'passenger_comerciante_bege',
    color: '#d4a373',
  },
  ESTUDANTE: {
    type: 'ESTUDANTE',
    label: 'Estudante Uniformizado',
    tagline: 'Farda branca, gravata azul e mochila',
    speed: 4.0,
    patience: 35,
    value: 100,
    xp: 20,
    spriteKey: 'passenger_estudante_gravata',
    color: '#38bdf8',
  },
  IDOSO: {
    type: 'IDOSO',
    label: 'Mama Quitandeira',
    tagline: 'Vestido roxo estampado e sacolas cheias',
    speed: 2.4,
    patience: 60,
    value: 200,
    xp: 35,
    spriteKey: 'passenger_mama_quitandeira',
    color: '#9333ea',
  },
  JOVEM: {
    type: 'JOVEM',
    label: 'Jovem Moça Estilosa',
    tagline: 'T-shirt amarela, jeans e tranças compridas',
    speed: 3.8,
    patience: 40,
    value: 160,
    xp: 30,
    spriteKey: 'passenger_moca_amarela',
    color: '#eab308',
  },
  EXECUTIVO: {
    type: 'EXECUTIVO',
    label: 'Executivo de Camisa Azul',
    tagline: 'Camisa azul, pasta de couro e relógio',
    speed: 3.5,
    patience: 25,
    value: 280,
    xp: 45,
    spriteKey: 'passenger_executivo_azul',
    color: '#0284c7',
  },
  IMPACIENTE: {
    type: 'IMPACIENTE',
    label: 'Jovem de Moletom Verde',
    tagline: 'Moletom verde com capuz e ténis brancos',
    speed: 4.2,
    patience: 22,
    value: 170,
    xp: 30,
    spriteKey: 'passenger_jovem_verde',
    color: '#16a34a',
  },
  VIP: {
    type: 'VIP',
    label: 'Executivo de Camisa Azul',
    tagline: 'Camisa azul, pasta de couro e relógio',
    speed: 3.5,
    patience: 25,
    value: 280,
    xp: 45,
    spriteKey: 'passenger_executivo_azul',
    color: '#0284c7',
  },
};

export type PassengerState = 
  | 'SPAWNING'
  | 'WAITING'
  | 'SEARCHING'
  | 'APPROACHED'
  | 'FOLLOWING'
  | 'BOARDING'
  | 'COMPLETED'
  | 'LEAVING'
  | 'IDLE'
  | 'CALLED'
  | 'BOARDED'
  | 'LOST';

export type RouteType = 'VIANA' | 'TALATONA' | 'CENTRO' | 'GOLFE 2' | 'CACUACO' | 'CAMAMA' | 'KILAMBA' | 'BENFICA';

export type TaxiType = 
  | 'NORMAL'
  | 'RAPIDO'
  | 'GRANDE'
  | 'ESPECIAL'
  | 'DOURADO';

export type TaxiState = 
  | 'ARRIVING'
  | 'WAITING'
  | 'LOADING'
  | 'FULL'
  | 'DEPARTING'
  | 'GONE';

export interface Passenger {
  id: string;
  name: string;
  type: PassengerType;
  destination: RouteType;
  value: number;
  urgency: number; // 1-5 scale
  patience: number; // seconds remaining before leaving
  maxPatience: number;
  speed: number;
  state: PassengerState;
  position: { x: number; y: number; z: number };
  targetPos: { x: number; y: number; z: number };
  followedBy: 'PLAYER' | string | null; // ID of lotador following
  assignedTaxiId: string | null;
  color: string;
  hatColor?: string;
  gender: 'M' | 'F';
  animFrame?: number;
  animTimer?: number;
  animDistance?: number;
  velocity?: { x: number; z: number };
  facingLeft?: boolean;
  isMoving?: boolean;
  refusalTimer?: number;
  refusalReason?: string;
}

export interface Taxi {
  id: string;
  type: TaxiType;
  route: RouteType;
  capacity: number;
  currentPassengers: number;
  maxWaitTime: number;
  remainingWaitTime: number;
  baseReward: number;
  state: TaxiState;
  position: { x: number; y: number; z: number };
  stopSlot: number; // 0, 1, 2...
  color: string;
}

export interface NPCLotador {
  id: string;
  name: string;
  nickname: string;
  specialty: 'VELOCIDADE' | 'ESTRATEGIA' | 'PERSUASAO';
  speed: number;
  persuasion: number;
  voiceRange: number;
  position: { x: number; y: number; z: number };
  targetPassengerId: string | null;
  followingPassengerId: string | null;
  color: string;
  shirtColor: string;
  state: 'IDLE' | 'CHASING' | 'LEADING' | 'BOARDING';
  passengersLoaded: number;
  animFrame?: number;
  animTimer?: number;
  animDistance?: number;
  velocity?: { x: number; z: number };
  facingLeft?: boolean;
  isMoving?: boolean;
  disputeCooldown?: number;
}

export type UrbanObstacleType = 'ZUNGUEIRA' | 'FISCAL';

export interface UrbanObstacle {
  id: string;
  type: UrbanObstacleType;
  name: string;
  position: { x: number; y: number; z: number };
  targetPos: { x: number; z: number };
  patrolPoints: { x: number; z: number }[];
  currentPatrolIdx: number;
  speed: number;
  facingLeft?: boolean;
  animDistance?: number;
  speechText?: string;
  speechTimer?: number;
  whistleCooldown?: number;
}

export interface PassengerDispute {
  passengerId: string;
  passengerName: string;
  passengerDestination: RouteType;
  npcId: string;
  npcName: string;
  npcSpeech: string;
  timer: number;
  maxDuration: number;
  playerProgress: number; // 0 to 100
  resolved: boolean;
  position: { x: number; y: number; z: number };
}

export interface PlayerStats {
  money: number; // Kz
  xp: number;
  level: number;
  bestScore: number;
  taxisLoaded: number;
  passengersServed: number;
  maxCombo: number;
  
  // Upgrades (Level 0-10)
  upgradeSpeed: number;
  upgradeStamina: number;
  upgradeVoice: number;
  upgradePersuasion: number;
  upgradeTaxiSpeed?: number;
  upgradeTaxiCapacity?: number;

  // Customization
  selectedGender: 'M' | 'F';
  selectedCharacter?: 'KITO' | 'ZECA' | 'TIO_BETY' | 'NELO' | 'M' | 'F';
  selectedShirt: number;
  selectedPants: number;
  selectedAccessory: number;

  selectedMapId: string;
  unlockedMaps: string[];
  tutorialCompleted?: boolean;

  // Progression & Levels (Fases 1 a 20)
  highestUnlockedLevel?: number; // Highest level unlocked (1 - 20)
  levelStars?: Record<number, number>; // Stars (1-3) earned per level
  levelHighScores?: Record<number, number>; // Best Kz score per level
  skillPoints?: number; // Pontos de Habilidade ganhos ao subir de nível
  levelTitle?: string; // Título atual (ex: Novato, Lotador, etc.)
}

export interface CampaignZone {
  id: string;
  name: string;
  city: string;
  difficulty: 'FÁCIL' | 'MÉDIO' | 'DIFÍCIL' | 'EXTREMO';
  requiredLevel: number;
  requiredRuns: number;
  bonusKzMultiplier: number;
  desc: string;
  bgGrad: string;
}

export interface PowerUp {
  id: 'TURBO' | 'MEGAFONE' | 'RADAR' | 'COMBO_SHIELD';
  name: string;
  description: string;
  duration: number; // seconds
  cooldown: number;
  icon: string;
}

export interface ActivePowerUp {
  id: 'TURBO' | 'MEGAFONE' | 'RADAR' | 'COMBO_SHIELD';
  durationLeft: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardKz: number;
  rewardXp: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  type: 'LOAD_TAXIS' | 'SERVE_PASSENGERS' | 'FAST_LOAD' | 'CALL_PASSENGERS';
}

export interface MatchResults {
  taxisLoaded: number;
  passengersServed: number;
  maxCombo: number;
  earnedMoney: number;
  earnedXp: number;
  isNewRecord: boolean;
  duration: number;
  completedMissions?: Mission[];
  unlockedZoneName?: string;
  isTutorial?: boolean;
  isVictory?: boolean;
  // Level Progression Additions
  levelId?: number;
  levelNumber?: number;
  levelTitle?: string;
  zoneName?: string;
  starsEarned?: number; // 0, 1, 2, 3
  starsBreakdown?: {
    star1: boolean;
    star2: boolean;
    star3: boolean;
  };
  starConditions?: {
    oneStar: string;
    twoStars: string;
    threeStars: string;
  };
  isParagemDominada?: boolean; // True on beating Level 20
  firstTimeClearBonus?: number;
  failReason?: string;
  oldLevel?: number;
  newLevel?: number;
  levelUp?: boolean;
  newTitle?: string;
  allMissionsDone?: boolean;
  missionsTotal?: number;
  missionsDone?: number;
  levelUpRewardKz?: number;
  levelUpRewardXp?: number;
  skillPointsEarned?: number;
  totalSkillPoints?: number;
  nextLevelUnlocked?: number;
  objectivesSummary?: {
    type?: string;
    description: string;
    completed: boolean;
    current: number;
    target: number;
    displayProgress?: string;
  }[];
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number; z: number };
  screenPos?: { x: number; y: number };
  life: number; // 0-1
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  language: 'PT' | 'EN';
  showFpsOverlay?: boolean;
  sfxVolume?: number; // 0.0 - 1.0 (default 1.0)
  musicVolume?: number; // 0.0 - 1.0 (default 0.7)
}

export interface OffScreenTaxiIndicator {
  id: string;
  route: RouteType;
  side: 'LEFT' | 'RIGHT';
  distanceMeters: number;
  availableSeats: number;
  capacity: number;
  isDestinationMatching: boolean;
  color: string;
}
