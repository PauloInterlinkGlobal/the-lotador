/**
 * LOTADOR - Texture Atlas Frame Definitions & Slicer
 */

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ATLAS_WIDTH = 1448;
export const ATLAS_HEIGHT = 1086;

export const ATLAS_FRAMES: Record<string, SpriteFrame> = {
  // Player Male Idle
  player_male_idle_0: { x: 8, y: 5, width: 54, height: 94 },
  player_male_idle_1: { x: 62, y: 5, width: 54, height: 94 },
  player_male_idle_2: { x: 116, y: 5, width: 54, height: 94 },
  player_male_idle_3: { x: 170, y: 5, width: 54, height: 94 },
  player_male_idle_4: { x: 224, y: 5, width: 54, height: 94 },
  player_male_idle_5: { x: 278, y: 5, width: 54, height: 94 },
  player_male_idle_6: { x: 332, y: 5, width: 54, height: 94 },
  player_male_idle_7: { x: 386, y: 5, width: 54, height: 94 },

  // Player Male Walk
  player_male_walk_0: { x: 8, y: 107, width: 54, height: 94 },
  player_male_walk_1: { x: 62, y: 107, width: 54, height: 94 },
  player_male_walk_2: { x: 116, y: 107, width: 54, height: 94 },
  player_male_walk_3: { x: 170, y: 107, width: 54, height: 94 },
  player_male_walk_4: { x: 224, y: 107, width: 54, height: 94 },
  player_male_walk_5: { x: 278, y: 107, width: 54, height: 94 },
  player_male_walk_6: { x: 332, y: 107, width: 54, height: 94 },
  player_male_walk_7: { x: 386, y: 107, width: 54, height: 94 },

  // Player Male Run
  player_male_run_0: { x: 8, y: 209, width: 54, height: 94 },
  player_male_run_1: { x: 62, y: 209, width: 54, height: 94 },
  player_male_run_2: { x: 116, y: 209, width: 54, height: 94 },
  player_male_run_3: { x: 170, y: 209, width: 54, height: 94 },
  player_male_run_4: { x: 224, y: 209, width: 54, height: 94 },
  player_male_run_5: { x: 278, y: 209, width: 54, height: 94 },
  player_male_run_6: { x: 332, y: 209, width: 54, height: 94 },
  player_male_run_7: { x: 386, y: 209, width: 54, height: 94 },

  // Player Female Idle
  player_female_idle_0: { x: 325, y: 5, width: 54, height: 94 },
  player_female_idle_1: { x: 379, y: 5, width: 54, height: 94 },
  player_female_idle_2: { x: 433, y: 5, width: 54, height: 94 },
  player_female_idle_3: { x: 487, y: 5, width: 54, height: 94 },
  player_female_idle_4: { x: 541, y: 5, width: 54, height: 94 },
  player_female_idle_5: { x: 595, y: 5, width: 54, height: 94 },
  player_female_idle_6: { x: 649, y: 5, width: 54, height: 94 },
  player_female_idle_7: { x: 703, y: 5, width: 54, height: 94 },

  // Player Female Walk
  player_female_walk_0: { x: 325, y: 107, width: 54, height: 94 },
  player_female_walk_1: { x: 379, y: 107, width: 54, height: 94 },
  player_female_walk_2: { x: 433, y: 107, width: 54, height: 94 },
  player_female_walk_3: { x: 487, y: 107, width: 54, height: 94 },
  player_female_walk_4: { x: 541, y: 107, width: 54, height: 94 },
  player_female_walk_5: { x: 595, y: 107, width: 54, height: 94 },
  player_female_walk_6: { x: 649, y: 107, width: 54, height: 94 },
  player_female_walk_7: { x: 703, y: 107, width: 54, height: 94 },

  // Player Female Run
  player_female_run_0: { x: 325, y: 209, width: 54, height: 94 },
  player_female_run_1: { x: 379, y: 209, width: 54, height: 94 },
  player_female_run_2: { x: 433, y: 209, width: 54, height: 94 },
  player_female_run_3: { x: 487, y: 209, width: 54, height: 94 },
  player_female_run_4: { x: 541, y: 209, width: 54, height: 94 },
  player_female_run_5: { x: 595, y: 209, width: 54, height: 94 },
  player_female_run_6: { x: 649, y: 209, width: 54, height: 94 },
  player_female_run_7: { x: 703, y: 209, width: 54, height: 94 },

  // NPCs
  npc_kito: { x: 815, y: 10, width: 70, height: 92 },
  npc_kito_walk_0: { x: 815, y: 10, width: 70, height: 92 },
  npc_kito_walk_1: { x: 815, y: 107, width: 70, height: 92 },
  npc_kito_walk_2: { x: 815, y: 204, width: 70, height: 92 },
  npc_kito_walk_3: { x: 815, y: 301, width: 70, height: 92 },

  npc_manuel: { x: 895, y: 10, width: 70, height: 92 },
  npc_manuel_walk_0: { x: 895, y: 10, width: 70, height: 92 },
  npc_manuel_walk_1: { x: 895, y: 107, width: 70, height: 92 },
  npc_manuel_walk_2: { x: 895, y: 204, width: 70, height: 92 },
  npc_manuel_walk_3: { x: 895, y: 301, width: 70, height: 92 },

  npc_debora: { x: 975, y: 10, width: 70, height: 92 },
  npc_debora_walk_0: { x: 975, y: 10, width: 70, height: 92 },
  npc_debora_walk_1: { x: 975, y: 107, width: 70, height: 92 },
  npc_debora_walk_2: { x: 975, y: 204, width: 70, height: 92 },
  npc_debora_walk_3: { x: 975, y: 301, width: 70, height: 92 },

  npc_mestre_ze: { x: 1115, y: 10, width: 82, height: 105 },
  npc_mestre_ze_walk_0: { x: 1115, y: 10, width: 82, height: 105 },
  npc_mestre_ze_walk_1: { x: 1115, y: 120, width: 82, height: 105 },
  npc_mestre_ze_walk_2: { x: 1115, y: 230, width: 82, height: 105 },
  npc_mestre_ze_walk_3: { x: 1115, y: 340, width: 82, height: 105 },

  // Passenger Portraits / Big
  passenger_normal: { x: 12, y: 220, width: 78, height: 150 },
  passenger_apressado: { x: 94, y: 220, width: 78, height: 150 },
  passenger_indeciso: { x: 177, y: 220, width: 78, height: 150 },
  passenger_observador: { x: 260, y: 220, width: 78, height: 150 },
  passenger_exigente: { x: 343, y: 220, width: 78, height: 150 },
  passenger_correria: { x: 426, y: 220, width: 78, height: 150 },
  passenger_especial: { x: 509, y: 220, width: 78, height: 150 },

  // Passenger Walking Animations (4 frames each)
  passenger_normal_walk_0: { x: 12, y: 370, width: 20, height: 48 },
  passenger_normal_walk_1: { x: 31, y: 370, width: 20, height: 48 },
  passenger_normal_walk_2: { x: 50, y: 370, width: 20, height: 48 },
  passenger_normal_walk_3: { x: 69, y: 370, width: 20, height: 48 },

  passenger_apressado_walk_0: { x: 94, y: 370, width: 20, height: 48 },
  passenger_apressado_walk_1: { x: 113, y: 370, width: 20, height: 48 },
  passenger_apressado_walk_2: { x: 132, y: 370, width: 20, height: 48 },
  passenger_apressado_walk_3: { x: 151, y: 370, width: 20, height: 48 },

  passenger_indeciso_walk_0: { x: 176, y: 370, width: 20, height: 48 },
  passenger_indeciso_walk_1: { x: 195, y: 370, width: 20, height: 48 },
  passenger_indeciso_walk_2: { x: 214, y: 370, width: 20, height: 48 },
  passenger_indeciso_walk_3: { x: 233, y: 370, width: 20, height: 48 },

  passenger_observador_walk_0: { x: 258, y: 370, width: 20, height: 48 },
  passenger_observador_walk_1: { x: 277, y: 370, width: 20, height: 48 },
  passenger_observador_walk_2: { x: 296, y: 370, width: 20, height: 48 },
  passenger_observador_walk_3: { x: 315, y: 370, width: 20, height: 48 },

  passenger_exigente_walk_0: { x: 340, y: 370, width: 20, height: 48 },
  passenger_exigente_walk_1: { x: 359, y: 370, width: 20, height: 48 },
  passenger_exigente_walk_2: { x: 378, y: 370, width: 20, height: 48 },
  passenger_exigente_walk_3: { x: 397, y: 370, width: 20, height: 48 },

  passenger_correria_walk_0: { x: 422, y: 370, width: 20, height: 48 },
  passenger_correria_walk_1: { x: 441, y: 370, width: 20, height: 48 },
  passenger_correria_walk_2: { x: 460, y: 370, width: 20, height: 48 },
  passenger_correria_walk_3: { x: 479, y: 370, width: 20, height: 48 },

  passenger_especial_walk_0: { x: 504, y: 370, width: 20, height: 48 },
  passenger_especial_walk_1: { x: 523, y: 370, width: 20, height: 48 },
  passenger_especial_walk_2: { x: 542, y: 370, width: 20, height: 48 },
  passenger_especial_walk_3: { x: 561, y: 370, width: 20, height: 48 },

  // Taxis & Views
  taxi_normal: { x: 675, y: 220, width: 128, height: 78 },
  taxi_normal_front: { x: 675, y: 300, width: 62, height: 48 },
  taxi_normal_side: { x: 739, y: 300, width: 62, height: 48 },
  taxi_normal_rear: { x: 675, y: 352, width: 62, height: 48 },
  taxi_normal_top: { x: 739, y: 352, width: 62, height: 48 },

  taxi_rapido: { x: 820, y: 220, width: 128, height: 78 },
  taxi_rapido_front: { x: 820, y: 300, width: 62, height: 48 },
  taxi_rapido_side: { x: 884, y: 300, width: 62, height: 48 },
  taxi_rapido_rear: { x: 820, y: 352, width: 62, height: 48 },
  taxi_rapido_top: { x: 884, y: 352, width: 62, height: 48 },

  taxi_grande: { x: 965, y: 220, width: 128, height: 78 },
  taxi_grande_front: { x: 965, y: 300, width: 62, height: 48 },
  taxi_grande_side: { x: 1029, y: 300, width: 62, height: 48 },
  taxi_grande_rear: { x: 965, y: 352, width: 62, height: 48 },
  taxi_grande_top: { x: 1029, y: 352, width: 62, height: 48 },

  taxi_especial: { x: 1110, y: 220, width: 128, height: 78 },
  taxi_especial_front: { x: 1110, y: 300, width: 62, height: 48 },
  taxi_especial_side: { x: 1174, y: 300, width: 62, height: 48 },
  taxi_especial_rear: { x: 1110, y: 352, width: 62, height: 48 },
  taxi_especial_top: { x: 1174, y: 352, width: 62, height: 48 },

  taxi_dourado: { x: 1255, y: 220, width: 128, height: 78 },
  taxi_dourado_front: { x: 1255, y: 300, width: 62, height: 48 },
  taxi_dourado_side: { x: 1319, y: 300, width: 62, height: 48 },
  taxi_dourado_rear: { x: 1255, y: 352, width: 62, height: 48 },
  taxi_dourado_top: { x: 1319, y: 352, width: 62, height: 48 },

  // Customization Items
  custom_cap_red: { x: 8, y: 480, width: 55, height: 48 },
  custom_hat_black: { x: 67, y: 480, width: 55, height: 48 },
  custom_hat_brown: { x: 126, y: 480, width: 55, height: 48 },
  custom_hair_1: { x: 185, y: 480, width: 55, height: 60 },
  custom_hair_2: { x: 244, y: 480, width: 55, height: 60 },
  custom_hair_3: { x: 303, y: 480, width: 55, height: 60 },
  custom_shirt_yellow: { x: 8, y: 545, width: 70, height: 75 },
  custom_shirt_red: { x: 84, y: 545, width: 70, height: 75 },
  custom_shirt_white: { x: 160, y: 545, width: 70, height: 75 },
  custom_pants_blue: { x: 236, y: 545, width: 70, height: 75 },
  custom_pants_black: { x: 312, y: 545, width: 70, height: 75 },
  custom_pants_light: { x: 388, y: 545, width: 70, height: 75 },
  custom_shoes_red: { x: 8, y: 625, width: 65, height: 45 },
  custom_shoes_blue: { x: 78, y: 625, width: 65, height: 45 },
  custom_shoes_black: { x: 148, y: 625, width: 65, height: 45 },
  custom_backpack: { x: 218, y: 625, width: 70, height: 80 },
  custom_sunglasses: { x: 293, y: 625, width: 70, height: 45 },
  custom_megaphone: { x: 368, y: 625, width: 70, height: 60 },

  // Map Objects & Props
  object_bus_stop_1: { x: 8, y: 700, width: 120, height: 85 },
  object_bus_stop_2: { x: 132, y: 700, width: 120, height: 85 },
  object_bus_stop_3: { x: 256, y: 700, width: 120, height: 85 },
  object_stall: { x: 380, y: 700, width: 105, height: 85 },
  object_tree_small: { x: 495, y: 690, width: 70, height: 105 },
  object_tree_medium: { x: 570, y: 685, width: 75, height: 110 },
  object_tree_large: { x: 650, y: 675, width: 95, height: 120 },
  object_traffic_light: { x: 745, y: 700, width: 45, height: 100 },
  object_lamp_post: { x: 800, y: 700, width: 45, height: 100 },
  object_barrier: { x: 850, y: 700, width: 120, height: 50 },
  object_container: { x: 8, y: 800, width: 120, height: 85 },
  object_bin: { x: 135, y: 800, width: 60, height: 70 },
  object_crate: { x: 200, y: 800, width: 65, height: 60 },
  object_cone: { x: 270, y: 800, width: 35, height: 55 },
  object_wall_1: { x: 310, y: 800, width: 90, height: 100 },
  object_wall_2: { x: 405, y: 800, width: 90, height: 100 },

  // Effects & UI
  effect_coin: { x: 8, y: 910, width: 70, height: 70 },
  effect_xp: { x: 80, y: 910, width: 70, height: 70 },
  effect_combo: { x: 152, y: 900, width: 95, height: 90 },
  effect_taxi_full: { x: 252, y: 900, width: 100, height: 90 },
  effect_passenger_ok: { x: 360, y: 910, width: 70, height: 70 },
  effect_passenger_lost: { x: 435, y: 910, width: 70, height: 70 },
  effect_turbo: { x: 510, y: 910, width: 80, height: 70 },
  effect_megaphone: { x: 595, y: 910, width: 80, height: 70 },

  ui_coin: { x: 685, y: 900, width: 48, height: 48 },
  ui_xp: { x: 735, y: 900, width: 48, height: 48 },
  ui_stamina: { x: 785, y: 900, width: 48, height: 48 },
  ui_play: { x: 845, y: 900, width: 52, height: 52 },
  ui_confirm: { x: 905, y: 900, width: 52, height: 52 },
  ui_close: { x: 965, y: 900, width: 52, height: 52 },
  ui_settings: { x: 1025, y: 900, width: 52, height: 52 },
  ui_trophy: { x: 1085, y: 900, width: 52, height: 52 },

  // Destinations & Logo
  destination_viana: { x: 1000, y: 780, width: 145, height: 52 },
  destination_talatona: { x: 1000, y: 835, width: 145, height: 52 },
  destination_centro: { x: 1000, y: 890, width: 145, height: 52 },
  logo_lotador: { x: 1160, y: 835, width: 270, height: 210 },
};
