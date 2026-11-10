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
    // 1 Abrigo de paragem (central on sidewalk, back corridor)
    {
      id: 'scenery_abrigo_1',
      type: 'abrigo_paragem',
      x: -4.0,
      z: 7.5,
    },
    // 1 Placa de paragem de táxi (near sidewalk curb edge)
    {
      id: 'scenery_placa_1',
      type: 'paragem_taxi_placa',
      x: -14.5,
      z: 0.5,
    },
    // 1 Barraca de água fresca (right sidewalk commercial activity)
    {
      id: 'scenery_barraca_1',
      type: 'barraca_agua_fresca',
      x: 14.5,
      z: 5.5,
    },
    // 2 Bancos de madeira (comfortable waiting areas)
    {
      id: 'scenery_banco_1',
      type: 'banco_madeira',
      x: -9.5,
      z: 4.5,
    },
    {
      id: 'scenery_banco_2',
      type: 'banco_madeira',
      x: 5.5,
      z: 4.5,
    },
    // 2 Árvores (lush shade on lateral sidewalks)
    {
      id: 'scenery_arvore_1',
      type: 'arvore',
      x: -19.0,
      z: 8.5,
    },
    {
      id: 'scenery_arvore_2',
      type: 'arvore',
      x: 19.0,
      z: 8.5,
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

  // Paragem urbana / Mutamba: composição base, com corredor central livre.
  PARAGEM_URBANA: [],

  // Viana Express: zona de espera mais concentrada à esquerda e comércio à direita.
  VIANA_EXPRESS: [
    { id: 'viana_abrigo', type: 'abrigo_paragem', x: -10.5, z: 8.0, scale: 0.95 },
    { id: 'viana_placa', type: 'paragem_taxi_placa', x: 10.5, z: 1.0 },
    { id: 'viana_barraca', type: 'barraca_agua_fresca', x: 18.0, z: 6.0, scale: 0.9 },
    { id: 'viana_banco_1', type: 'banco_madeira', x: -17.0, z: 4.7 },
    { id: 'viana_banco_2', type: 'banco_madeira', x: -2.5, z: 5.0 },
    { id: 'viana_arvore_1', type: 'arvore', x: -23.0, z: 9.0 },
    { id: 'viana_arvore_2', type: 'arvore', x: 23.0, z: 9.0 },
    { id: 'viana_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'viana_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'viana_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'viana_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],

  // Mercado dos Correios: ambiente de mercado, com abrigo lateral e corredor central aberto.
  MERCADO_CORREIOS: [
    { id: 'correios_abrigo', type: 'abrigo_paragem', x: 8.5, z: 8.0 },
    { id: 'correios_placa', type: 'paragem_taxi_placa', x: -15.5, z: 1.0 },
    { id: 'correios_barraca', type: 'barraca_agua_fresca', x: -21.0, z: 6.0, scale: 0.9 },
    { id: 'correios_banco_1', type: 'banco_madeira', x: -10.0, z: 5.0 },
    { id: 'correios_banco_2', type: 'banco_madeira', x: 16.0, z: 4.8 },
    { id: 'correios_arvore_1', type: 'arvore', x: -25.0, z: 9.0 },
    { id: 'correios_arvore_2', type: 'arvore', x: 24.0, z: 9.0 },
    { id: 'correios_cone_1', type: 'cone_transito', x: -18.0, z: -1.9 },
    { id: 'correios_cone_2', type: 'cone_transito', x: -6.0, z: -1.9 },
    { id: 'correios_cone_3', type: 'cone_transito', x: 6.0, z: -1.9 },
    { id: 'correios_cone_4', type: 'cone_transito', x: 18.0, z: -1.9 },
  ],

  // Talatona: composição mais espaçada e simétrica, com duas áreas de descanso.
  TALATONA_NOBRE: [
    { id: 'talatona_abrigo', type: 'abrigo_paragem', x: -1.5, z: 8.5, scale: 1.05 },
    { id: 'talatona_placa', type: 'paragem_taxi_placa', x: 20.0, z: 1.0 },
    { id: 'talatona_barraca', type: 'barraca_agua_fresca', x: -21.0, z: 6.0, scale: 0.85 },
    { id: 'talatona_banco_1', type: 'banco_madeira', x: -14.0, z: 4.7 },
    { id: 'talatona_banco_2', type: 'banco_madeira', x: 13.0, z: 4.7 },
    { id: 'talatona_arvore_1', type: 'arvore', x: -25.0, z: 9.0 },
    { id: 'talatona_arvore_2', type: 'arvore', x: 25.0, z: 9.0 },
    { id: 'talatona_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'talatona_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'talatona_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'talatona_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],

  // Samba Terminal: abrigo comprido, placa lateral e comércio junto à extremidade.
  SAMBA_TERMINAL: [
    { id: 'samba_abrigo', type: 'abrigo_paragem', x: 10.0, z: 8.0 },
    { id: 'samba_placa', type: 'paragem_taxi_placa', x: -19.0, z: 1.0 },
    { id: 'samba_barraca', type: 'barraca_agua_fresca', x: 21.0, z: 5.8, scale: 0.9 },
    { id: 'samba_banco_1', type: 'banco_madeira', x: -12.0, z: 4.8 },
    { id: 'samba_banco_2', type: 'banco_madeira', x: 1.0, z: 4.8 },
    { id: 'samba_arvore_1', type: 'arvore', x: -25.0, z: 9.0 },
    { id: 'samba_arvore_2', type: 'arvore', x: 25.0, z: 9.0 },
    { id: 'samba_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'samba_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'samba_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'samba_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],
};

// The base layout remains available for the first level only. Each named map owns
// its own placement array so map changes cannot silently reuse Mutamba coordinates.
SCENERY_PLACEMENTS.PARAGEM_URBANA = SCENERY_PLACEMENTS.LEVEL_1;
