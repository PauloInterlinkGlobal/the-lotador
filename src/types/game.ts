/**
 * LOTADOR - Game Data Types
 */

export type PassengerType = 
  | 'NORMAL'
  | 'APRESSADO'
  | 'INDECISO'
  | 'OBSERVADOR'
  | 'EXIGENTE'
  | 'CORRERIA'
  | 'ESPECIAL';

export type PassengerState = 
  | 'SPAWNING'
  | 'WAITING'
  | 'SEARCHING'
  | 'APPROACHED'
  | 'FOLLOWING'
  | 'BOARDING'
  | 'COMPLETED'
  | 'LEAVING';

export type RouteType = 'VIANA' | 'TALATONA' | 'CENTRO';

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

  // Customization
  selectedGender: 'M' | 'F';
  selectedShirt: number;
  selectedPants: number;
  selectedAccessory: number;

  selectedMapId: string;
  unlockedMaps: string[];
  tutorialCompleted?: boolean;
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
}
