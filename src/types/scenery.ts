/**
 * LOTADOR - Scenery & Obstacle Type Definitions
 * Pixel-art paragem obstacles & decoration
 */

export type SceneryObstacleType =
  | 'paragem_taxi_placa'
  | 'barraca_agua_fresca'
  | 'banco_madeira'
  | 'arvore'
  | 'abrigo_paragem'
  | 'cone_transito';

export interface SceneryFrameDef {
  id: SceneryObstacleType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Height multiplier relative to player height (2.8 units) */
  heightRatio: number;
  /** Normalized footprint rectangle [x, y, w, h] from top-left (0..1) */
  footprint: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface SceneryPlacement {
  id: string;
  type: SceneryObstacleType;
  x: number;
  z: number;
  y?: number;
  /** Optional custom scale multiplier */
  scale?: number;
  /** Optional rotation in radians around Y */
  rotationY?: number;
}

export interface SceneryCollider {
  id: string;
  type: SceneryObstacleType;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
}
