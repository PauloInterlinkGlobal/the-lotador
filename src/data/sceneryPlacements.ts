/**
 * LOTADOR - Scenery & Obstacle Placements and Atlas Frame Configurations.
 *
 * The commercial buildings occupy the rear band of the scene (front facade
 * around z=8.8). Decorative props are deliberately kept in front of that
 * facade, with separate depth rows for shelters, benches and traffic cones.
 */
import { SceneryFrameDef, SceneryObstacleType, SceneryPlacement } from '../types/scenery';

export const SCENERY_FRAME_DEFS: Record<SceneryObstacleType, SceneryFrameDef> = {
  paragem_taxi_placa: {
    id: 'paragem_taxi_placa', name: 'Placa Paragem de Táxi',
    x: 226, y: 23, width: 126, height: 155, heightRatio: 1.7,
    footprint: { x: 0.25, y: 0.82, w: 0.35, h: 0.18 },
  },
  barraca_agua_fresca: {
    id: 'barraca_agua_fresca', name: 'Barraca Água Fresca',
    x: 385, y: 28, width: 173, height: 157, heightRatio: 1.8,
    footprint: { x: 0.05, y: 0.55, w: 0.90, h: 0.45 },
  },
  banco_madeira: {
    id: 'banco_madeira', name: 'Banco de Madeira',
    x: 26, y: 70, width: 167, height: 106, heightRatio: 0.75,
    footprint: { x: 0.05, y: 0.55, w: 0.90, h: 0.45 },
  },
  arvore: {
    id: 'arvore', name: 'Árvore Urbana',
    x: 199, y: 200, width: 121, height: 168, heightRatio: 2.4,
    footprint: { x: 0.30, y: 0.78, w: 0.40, h: 0.22 },
  },
  abrigo_paragem: {
    id: 'abrigo_paragem', name: 'Abrigo da Paragem',
    x: 356, y: 210, width: 227, height: 161, heightRatio: 2.0,
    footprint: { x: 0.05, y: 0.60, w: 0.90, h: 0.40 },
  },
  cone_transito: {
    id: 'cone_transito', name: 'Cone de Trânsito',
    x: 55, y: 273, width: 76, height: 85, heightRatio: 0.45,
    footprint: { x: 0.15, y: 0.60, w: 0.70, h: 0.40 },
  },
};

/**
 * Layout convention:
 * - Buildings: rear band, z >= 8.8.
 * - Street furniture: middle band, z 5.0–6.0.
 * - Benches / signs: front pedestrian band, z 2.5–4.0.
 * - Cones: road edge, z -1.9.
 *
 * Keeping these rows separate prevents props from appearing embedded in
 * shop fronts and preserves the central passenger movement corridor.
 */
export const SCENERY_PLACEMENTS: Record<string, SceneryPlacement[]> = {
  LEVEL_1: [
    { id: 'scenery_abrigo_1', type: 'abrigo_paragem', x: -7.5, z: 4.8, scale: 0.92 },
    { id: 'scenery_placa_1', type: 'paragem_taxi_placa', x: -17.5, z: 2.8 },
    { id: 'scenery_barraca_1', type: 'barraca_agua_fresca', x: 17.0, z: 4.8, scale: 0.9 },
    { id: 'scenery_banco_1', type: 'banco_madeira', x: -13.0, z: 2.8 },
    { id: 'scenery_banco_2', type: 'banco_madeira', x: 7.0, z: 2.8 },
    { id: 'scenery_arvore_1', type: 'arvore', x: -25.5, z: 4.8, scale: 0.9 },
    { id: 'scenery_arvore_2', type: 'arvore', x: 25.5, z: 4.8, scale: 0.9 },
    { id: 'scenery_cone_1', type: 'cone_transito', x: -13.5, z: -1.9 },
    { id: 'scenery_cone_2', type: 'cone_transito', x: -4.5, z: -1.9 },
    { id: 'scenery_cone_3', type: 'cone_transito', x: 4.5, z: -1.9 },
    { id: 'scenery_cone_4', type: 'cone_transito', x: 13.5, z: -1.9 },
  ],
  PARAGEM_URBANA: [
    { id: 'mutamba_abrigo', type: 'abrigo_paragem', x: -7.5, z: 4.8, scale: 0.92 },
    { id: 'mutamba_placa', type: 'paragem_taxi_placa', x: -17.5, z: 2.8 },
    { id: 'mutamba_barraca', type: 'barraca_agua_fresca', x: 17.0, z: 4.8, scale: 0.9 },
    { id: 'mutamba_banco_1', type: 'banco_madeira', x: -13.0, z: 2.8 },
    { id: 'mutamba_banco_2', type: 'banco_madeira', x: 7.0, z: 2.8 },
    { id: 'mutamba_arvore_1', type: 'arvore', x: -25.5, z: 4.8, scale: 0.9 },
    { id: 'mutamba_arvore_2', type: 'arvore', x: 25.5, z: 4.8, scale: 0.9 },
    { id: 'mutamba_cone_1', type: 'cone_transito', x: -13.5, z: -1.9 },
    { id: 'mutamba_cone_2', type: 'cone_transito', x: -4.5, z: -1.9 },
    { id: 'mutamba_cone_3', type: 'cone_transito', x: 4.5, z: -1.9 },
    { id: 'mutamba_cone_4', type: 'cone_transito', x: 13.5, z: -1.9 },
  ],
  VIANA_EXPRESS: [
    { id: 'viana_abrigo', type: 'abrigo_paragem', x: -11.0, z: 4.8, scale: 0.9 },
    { id: 'viana_placa', type: 'paragem_taxi_placa', x: 11.5, z: 2.8 },
    { id: 'viana_barraca', type: 'barraca_agua_fresca', x: 20.0, z: 4.8, scale: 0.85 },
    { id: 'viana_banco_1', type: 'banco_madeira', x: -18.0, z: 2.8 },
    { id: 'viana_banco_2', type: 'banco_madeira', x: -1.0, z: 2.8 },
    { id: 'viana_arvore_1', type: 'arvore', x: -26.0, z: 4.8, scale: 0.9 },
    { id: 'viana_arvore_2', type: 'arvore', x: 26.0, z: 4.8, scale: 0.9 },
    { id: 'viana_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'viana_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'viana_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'viana_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],
  MERCADO_CORREIOS: [
    { id: 'correios_abrigo', type: 'abrigo_paragem', x: 9.0, z: 4.8, scale: 0.9 },
    { id: 'correios_placa', type: 'paragem_taxi_placa', x: -17.5, z: 2.8 },
    { id: 'correios_barraca', type: 'barraca_agua_fresca', x: -23.0, z: 4.8, scale: 0.82 },
    { id: 'correios_banco_1', type: 'banco_madeira', x: -10.5, z: 2.8 },
    { id: 'correios_banco_2', type: 'banco_madeira', x: 17.0, z: 2.8 },
    { id: 'correios_arvore_1', type: 'arvore', x: -27.0, z: 4.8, scale: 0.85 },
    { id: 'correios_arvore_2', type: 'arvore', x: 26.0, z: 4.8, scale: 0.85 },
    { id: 'correios_cone_1', type: 'cone_transito', x: -18.0, z: -1.9 },
    { id: 'correios_cone_2', type: 'cone_transito', x: -6.0, z: -1.9 },
    { id: 'correios_cone_3', type: 'cone_transito', x: 6.0, z: -1.9 },
    { id: 'correios_cone_4', type: 'cone_transito', x: 18.0, z: -1.9 },
  ],
  TALATONA_NOBRE: [
    { id: 'talatona_abrigo', type: 'abrigo_paragem', x: -1.5, z: 4.8, scale: 0.95 },
    { id: 'talatona_placa', type: 'paragem_taxi_placa', x: 21.0, z: 2.8 },
    { id: 'talatona_barraca', type: 'barraca_agua_fresca', x: -22.0, z: 4.8, scale: 0.82 },
    { id: 'talatona_banco_1', type: 'banco_madeira', x: -14.0, z: 2.8 },
    { id: 'talatona_banco_2', type: 'banco_madeira', x: 13.0, z: 2.8 },
    { id: 'talatona_arvore_1', type: 'arvore', x: -27.0, z: 4.8, scale: 0.85 },
    { id: 'talatona_arvore_2', type: 'arvore', x: 27.0, z: 4.8, scale: 0.85 },
    { id: 'talatona_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'talatona_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'talatona_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'talatona_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],
  SAMBA_TERMINAL: [
    { id: 'samba_abrigo', type: 'abrigo_paragem', x: 10.0, z: 4.8, scale: 0.9 },
    { id: 'samba_placa', type: 'paragem_taxi_placa', x: -20.0, z: 2.8 },
    { id: 'samba_barraca', type: 'barraca_agua_fresca', x: 22.0, z: 4.8, scale: 0.82 },
    { id: 'samba_banco_1', type: 'banco_madeira', x: -12.0, z: 2.8 },
    { id: 'samba_banco_2', type: 'banco_madeira', x: 1.0, z: 2.8 },
    { id: 'samba_arvore_1', type: 'arvore', x: -27.0, z: 4.8, scale: 0.85 },
    { id: 'samba_arvore_2', type: 'arvore', x: 27.0, z: 4.8, scale: 0.85 },
    { id: 'samba_cone_1', type: 'cone_transito', x: -16.0, z: -1.9 },
    { id: 'samba_cone_2', type: 'cone_transito', x: -8.0, z: -1.9 },
    { id: 'samba_cone_3', type: 'cone_transito', x: 8.0, z: -1.9 },
    { id: 'samba_cone_4', type: 'cone_transito', x: 16.0, z: -1.9 },
  ],
};
