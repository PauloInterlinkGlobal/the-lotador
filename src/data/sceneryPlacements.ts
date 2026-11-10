/**
 * LOTADOR - Scenery & Obstacle Placements and Atlas Frame Configurations
 * 6 Pixel-Art Scenery Objects from objetos-obstaculos.png
 */

import { SceneryFrameDef, SceneryObstacleType, SceneryPlacement } from '../types/scenery';

/**
 * Exact atlas frame coordinates measured directly from objetos-obstaculos.png (610x409 px)
 * along with proportional height ratios relative to player height (2.8 units)
 * and realistic ground footprint collision bounding boxes.
 */
export const SCENERY_FRAME_DEFS: Record<SceneryObstacleType, SceneryFrameDef> = {
  paragem_taxi_placa: {
    id: 'paragem_taxi_placa',
    name: 'Placa Paragem de Táxi',
    x: 226,
    y: 23,
    width: 126,
    height: 155,
    heightRatio: 1.7, // 1.7x player height
    footprint: { x: 0.25, y: 0.82, w: 0.35, h: 0.18 },
  },
  barraca_agua_fresca: {
    id: 'barraca_agua_fresca',
    name: 'Barraca Água Fresca',
    x: 385,
    y: 28,
    width: 173,
    height: 157,
    heightRatio: 1.8, // 1.8x player height
    footprint: { x: 0.05, y: 0.55, w: 0.90, h: 0.45 },
  },
  banco_madeira: {
    id: 'banco_madeira',
    name: 'Banco de Madeira',
    x: 26,
    y: 70,
    width: 167,
    height: 106,
    heightRatio: 0.75, // 0.75x player height
    footprint: { x: 0.05, y: 0.55, w: 0.90, h: 0.45 },
  },
  arvore: {
    id: 'arvore',
    name: 'Árvore Urbana',
    x: 199,
    y: 200,
    width: 121,
    height: 168,
    heightRatio: 2.4, // 2.4x player height
    footprint: { x: 0.30, y: 0.78, w: 0.40, h: 0.22 },
  },
  abrigo_paragem: {
    id: 'abrigo_paragem',
    name: 'Abrigo da Paragem',
    x: 356,
    y: 210,
    width: 227,
    height: 161,
    heightRatio: 2.0, // 2.0x player height
    footprint: { x: 0.05, y: 0.60, w: 0.90, h: 0.40 },
  },
  cone_transito: {
    id: 'cone_transito',
    name: 'Cone de Trânsito',
    x: 55,
    y: 273,
    width: 76,
    height: 85,
    heightRatio: 0.45, // 0.45x player height
    footprint: { x: 0.15, y: 0.60, w: 0.70, h: 0.40 },
  },
};

/**
 * Configurable placements per zone / level.
 * Level 1 (PARAGEM_URBANA / Mutamba) features the exact specified composition:
 * - 1 Abrigo de paragem
 * - 1 Placa de paragem de táxi
 * - 1 Barraca de água fresca
 * - 2 Bancos de madeira
 * - 2 Árvores
 * - 4 Cones de trânsito alinhados separando a rua das baias de táxis
 */
export const SCENERY_PLACEMENTS: Record<string, SceneryPlacement[]> = {
  // Level 1 / Default Paragem Urbana Layout
  LEVEL_1: [
    // 1 Abrigo de paragem (central on sidewalk promenade, clear of storefronts)
    {
      id: 'scenery_abrigo_1',
      type: 'abrigo_paragem',
      x: -4.0,
      z: 5.2,
    },
    // 1 Placa de paragem de táxi (near sidewalk curb edge, separated from trees and buildings)
    {
      id: 'scenery_placa_1',
      type: 'paragem_taxi_placa',
      x: -16.0,
      z: 1.0,
    },
    // 1 Barraca de água fresca (right sidewalk commercial area, open pedestrian corridor)
    {
      id: 'scenery_barraca_1',
      type: 'barraca_agua_fresca',
      x: 15.0,
      z: 4.2,
    },
    // 2 Bancos de madeira (comfortable waiting areas flanking the central plaza)
    {
      id: 'scenery_banco_1',
      type: 'banco_madeira',
      x: -10.5,
      z: 3.6,
    },
    {
      id: 'scenery_banco_2',
      type: 'banco_madeira',
      x: 5.5,
      z: 3.6,
    },
    // 2 Árvores (positioned on lateral sidewalk wings, completely free of building facades)
    {
      id: 'scenery_arvore_1',
      type: 'arvore',
      x: -22.0,
      z: 4.8,
    },
    {
      id: 'scenery_arvore_2',
      type: 'arvore',
      x: 22.0,
      z: 4.8,
    },
    // 4 Cones de trânsito alinhados separando a rua das baias de táxis
    {
      id: 'scenery_cone_1',
      type: 'cone_transito',
      x: -13.5,
      z: -1.9,
    },
    {
      id: 'scenery_cone_2',
      type: 'cone_transito',
      x: -4.5,
      z: -1.9,
    },
    {
      id: 'scenery_cone_3',
      type: 'cone_transito',
      x: 4.5,
      z: -1.9,
    },
    {
      id: 'scenery_cone_4',
      type: 'cone_transito',
      x: 13.5,
      z: -1.9,
    },
  ],

  // Fallback / Zone aliases
  PARAGEM_URBANA: [],
  VIANA_EXPRESS: [],
  MERCADO_CORREIOS: [],
  TALATONA_NOBRE: [],
  SAMBA_TERMINAL: [],
};

// Aliases share the rich Level 1 setup
SCENERY_PLACEMENTS.PARAGEM_URBANA = SCENERY_PLACEMENTS.LEVEL_1;
SCENERY_PLACEMENTS.VIANA_EXPRESS = SCENERY_PLACEMENTS.LEVEL_1;
SCENERY_PLACEMENTS.MERCADO_CORREIOS = SCENERY_PLACEMENTS.LEVEL_1;
SCENERY_PLACEMENTS.TALATONA_NOBRE = SCENERY_PLACEMENTS.LEVEL_1;
SCENERY_PLACEMENTS.SAMBA_TERMINAL = SCENERY_PLACEMENTS.LEVEL_1;
