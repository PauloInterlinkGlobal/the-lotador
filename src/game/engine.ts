/**
 * LOTADOR - Interface e Resultados do Motor de Jogo (Game Engine)
 */

import { GameEngine } from './GameEngine';
import { MatchResults } from '../types/game';

export interface EngineResult extends MatchResults {
  allMissionsDone: boolean;
  missionsTotal: number;
  missionsDone: number;
}

export { GameEngine };
