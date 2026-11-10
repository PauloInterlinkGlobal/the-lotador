/**
 * LOTADOR - Texture Atlas Frame Definitions & Slicer
 */

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Which source image this frame is cropped from. Defaults to 'main' when omitted. */
  source?: 'main' | 'player1' | 'scenery_obstacles';
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

  // ==============================================================
  // 6 PERSONAGENS DA IMAGEM DE REFERÊNCIA (LUANDA URBAN STREET CRAZE)
  // ==============================================================
  // 1. Comerciante / Trabalhador de Bege (Camisa Cáqui & Bolsa Tiracolo)
  passenger_comerciante_bege: { x: 12, y: 220, width: 78, height: 150 },
  passenger_comerciante_bege_walk_0: { x: 12, y: 370, width: 28, height: 56 },
  passenger_comerciante_bege_walk_1: { x: 42, y: 370, width: 28, height: 56 },
  passenger_comerciante_bege_walk_2: { x: 72, y: 370, width: 28, height: 56 },
  passenger_comerciante_bege_walk_3: { x: 102, y: 370, width: 28, height: 56 },

  // 2. Estudante Uniformizado (Farda Branca, Gravata Azul & Mochila)
  passenger_estudante_gravata: { x: 94, y: 220, width: 78, height: 150 },
  passenger_estudante_gravata_walk_0: { x: 132, y: 370, width: 28, height: 56 },
  passenger_estudante_gravata_walk_1: { x: 162, y: 370, width: 28, height: 56 },
  passenger_estudante_gravata_walk_2: { x: 192, y: 370, width: 28, height: 56 },
  passenger_estudante_gravata_walk_3: { x: 222, y: 370, width: 28, height: 56 },

  // 3. Mama / Quitandeira (Turbante Amarelo, Vestido Roxo & Sacolas)
  passenger_mama_quitandeira: { x: 177, y: 220, width: 78, height: 150 },
  passenger_mama_quitandeira_walk_0: { x: 252, y: 370, width: 28, height: 56 },
  passenger_mama_quitandeira_walk_1: { x: 282, y: 370, width: 28, height: 56 },
  passenger_mama_quitandeira_walk_2: { x: 312, y: 370, width: 28, height: 56 },
  passenger_mama_quitandeira_walk_3: { x: 342, y: 370, width: 28, height: 56 },

  // 4. Executivo de Camisa Azul (Camisa Azul-Celeste, Pasta & Relógio)
  passenger_executivo_azul: { x: 343, y: 220, width: 78, height: 150 },
  passenger_executivo_azul_walk_0: { x: 492, y: 370, width: 28, height: 56 },
  passenger_executivo_azul_walk_1: { x: 522, y: 370, width: 28, height: 56 },
  passenger_executivo_azul_walk_2: { x: 552, y: 370, width: 28, height: 56 },
  passenger_executivo_azul_walk_3: { x: 582, y: 370, width: 28, height: 56 },

  // 5. Jovem Moça Estilosa (T-Shirt Amarela, Jeans & Tranças)
  passenger_moca_amarela: { x: 260, y: 220, width: 78, height: 150 },
  passenger_moca_amarela_walk_0: { x: 372, y: 370, width: 28, height: 56 },
  passenger_moca_amarela_walk_1: { x: 402, y: 370, width: 28, height: 56 },
  passenger_moca_amarela_walk_2: { x: 432, y: 370, width: 28, height: 56 },
  passenger_moca_amarela_walk_3: { x: 462, y: 370, width: 28, height: 56 },

  // 6. Jovem de Moletom Verde (Capuz Verde, Cordões & Ténis Brancos)
  passenger_jovem_verde: { x: 426, y: 220, width: 78, height: 150 },
  passenger_jovem_verde_walk_0: { x: 612, y: 370, width: 28, height: 56 },
  passenger_jovem_verde_walk_1: { x: 642, y: 370, width: 28, height: 56 },
  passenger_jovem_verde_walk_2: { x: 672, y: 370, width: 28, height: 56 },
  passenger_jovem_verde_walk_3: { x: 702, y: 370, width: 28, height: 56 },

  // Mapeamentos diretos
  passenger_trabalhador: { x: 12, y: 220, width: 78, height: 150 },
  passenger_trabalhador_walk_0: { x: 12, y: 370, width: 28, height: 56 },
  passenger_trabalhador_walk_1: { x: 42, y: 370, width: 28, height: 56 },
  passenger_trabalhador_walk_2: { x: 72, y: 370, width: 28, height: 56 },
  passenger_trabalhador_walk_3: { x: 102, y: 370, width: 28, height: 56 },

  passenger_estudante: { x: 94, y: 220, width: 78, height: 150 },
  passenger_estudante_walk_0: { x: 132, y: 370, width: 28, height: 56 },
  passenger_estudante_walk_1: { x: 162, y: 370, width: 28, height: 56 },
  passenger_estudante_walk_2: { x: 192, y: 370, width: 28, height: 56 },
  passenger_estudante_walk_3: { x: 222, y: 370, width: 28, height: 56 },

  // 3. Idoso / Cota Mais Velho (Fato de Linho & Bengala)
  passenger_idoso: { x: 177, y: 220, width: 78, height: 150 },
  passenger_idoso_walk_0: { x: 252, y: 370, width: 28, height: 56 },
  passenger_idoso_walk_1: { x: 282, y: 370, width: 28, height: 56 },
  passenger_idoso_walk_2: { x: 312, y: 370, width: 28, height: 56 },
  passenger_idoso_walk_3: { x: 342, y: 370, width: 28, height: 56 },

  // 4. Jovem Estilosa / Mancebo (Streetwear & Tranças Afro)
  passenger_jovem: { x: 260, y: 220, width: 78, height: 150 },
  passenger_jovem_walk_0: { x: 372, y: 370, width: 28, height: 56 },
  passenger_jovem_walk_1: { x: 402, y: 370, width: 28, height: 56 },
  passenger_jovem_walk_2: { x: 432, y: 370, width: 28, height: 56 },
  passenger_jovem_walk_3: { x: 462, y: 370, width: 28, height: 56 },

  // 5. Executivo / Doutor (Fato Escuro & Pasta)
  passenger_executivo: { x: 343, y: 220, width: 78, height: 150 },
  passenger_executivo_walk_0: { x: 492, y: 370, width: 28, height: 56 },
  passenger_executivo_walk_1: { x: 522, y: 370, width: 28, height: 56 },
  passenger_executivo_walk_2: { x: 552, y: 370, width: 28, height: 56 },
  passenger_executivo_walk_3: { x: 582, y: 370, width: 28, height: 56 },

  // 6. Impaciente / Apressado (Relógio de Pulso & Tensão)
  passenger_impaciente: { x: 426, y: 220, width: 78, height: 150 },
  passenger_impaciente_walk_0: { x: 612, y: 370, width: 28, height: 56 },
  passenger_impaciente_walk_1: { x: 642, y: 370, width: 28, height: 56 },
  passenger_impaciente_walk_2: { x: 672, y: 370, width: 28, height: 56 },
  passenger_impaciente_walk_3: { x: 702, y: 370, width: 28, height: 56 },

  // 7. VIP / Patrão (Seda, Ouro & Elegância)
  passenger_vip: { x: 509, y: 220, width: 78, height: 150 },
  passenger_vip_walk_0: { x: 732, y: 370, width: 28, height: 56 },
  passenger_vip_walk_1: { x: 762, y: 370, width: 28, height: 56 },
  passenger_vip_walk_2: { x: 792, y: 370, width: 28, height: 56 },
  passenger_vip_walk_3: { x: 822, y: 370, width: 28, height: 56 },

  // Compatibilidade com chaves legadas mapeadas para os novos arquétipos
  passenger_normal: { x: 12, y: 220, width: 78, height: 150 },
  passenger_apressado: { x: 426, y: 220, width: 78, height: 150 },
  passenger_indeciso: { x: 260, y: 220, width: 78, height: 150 },
  passenger_observador: { x: 177, y: 220, width: 78, height: 150 },
  passenger_exigente: { x: 343, y: 220, width: 78, height: 150 },
  passenger_correria: { x: 426, y: 220, width: 78, height: 150 },
  passenger_especial: { x: 509, y: 220, width: 78, height: 150 },

  passenger_normal_walk_0: { x: 12, y: 370, width: 28, height: 56 },
  passenger_normal_walk_1: { x: 42, y: 370, width: 28, height: 56 },
  passenger_normal_walk_2: { x: 72, y: 370, width: 28, height: 56 },
  passenger_normal_walk_3: { x: 102, y: 370, width: 28, height: 56 },

  passenger_apressado_walk_0: { x: 612, y: 370, width: 28, height: 56 },
  passenger_apressado_walk_1: { x: 642, y: 370, width: 28, height: 56 },
  passenger_apressado_walk_2: { x: 672, y: 370, width: 28, height: 56 },
  passenger_apressado_walk_3: { x: 702, y: 370, width: 28, height: 56 },

  passenger_indeciso_walk_0: { x: 372, y: 370, width: 28, height: 56 },
  passenger_indeciso_walk_1: { x: 402, y: 370, width: 28, height: 56 },
  passenger_indeciso_walk_2: { x: 432, y: 370, width: 28, height: 56 },
  passenger_indeciso_walk_3: { x: 462, y: 370, width: 28, height: 56 },

  passenger_observador_walk_0: { x: 252, y: 370, width: 28, height: 56 },
  passenger_observador_walk_1: { x: 282, y: 370, width: 28, height: 56 },
  passenger_observador_walk_2: { x: 312, y: 370, width: 28, height: 56 },
  passenger_observador_walk_3: { x: 342, y: 370, width: 28, height: 56 },

  passenger_exigente_walk_0: { x: 492, y: 370, width: 28, height: 56 },
  passenger_exigente_walk_1: { x: 522, y: 370, width: 28, height: 56 },
  passenger_exigente_walk_2: { x: 552, y: 370, width: 28, height: 56 },
  passenger_exigente_walk_3: { x: 582, y: 370, width: 28, height: 56 },

  passenger_correria_walk_0: { x: 612, y: 370, width: 28, height: 56 },
  passenger_correria_walk_1: { x: 642, y: 370, width: 28, height: 56 },
  passenger_correria_walk_2: { x: 672, y: 370, width: 28, height: 56 },
  passenger_correria_walk_3: { x: 702, y: 370, width: 28, height: 56 },

  passenger_especial_walk_0: { x: 732, y: 370, width: 28, height: 56 },
  passenger_especial_walk_1: { x: 762, y: 370, width: 28, height: 56 },
  passenger_especial_walk_2: { x: 792, y: 370, width: 28, height: 56 },
  passenger_especial_walk_3: { x: 822, y: 370, width: 28, height: 56 },

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
  destination_golfe2: { x: 1000, y: 780, width: 145, height: 52 },
  destination_cacuaco: { x: 1000, y: 835, width: 145, height: 52 },
  destination_camama: { x: 1000, y: 890, width: 145, height: 52 },
  logo_lotador: { x: 1160, y: 835, width: 270, height: 210 },

  // Urban Obstacles of Luanda (Zungueira & Fiscal da Paragem)
  obstacle_zungueira: { x: 400, y: 350, width: 64, height: 96 },
  obstacle_zungueira_walk_0: { x: 400, y: 350, width: 64, height: 96 },
  obstacle_zungueira_walk_1: { x: 464, y: 350, width: 64, height: 96 },
  obstacle_zungueira_walk_2: { x: 528, y: 350, width: 64, height: 96 },
  obstacle_zungueira_walk_3: { x: 592, y: 350, width: 64, height: 96 },

  obstacle_fiscal: { x: 656, y: 350, width: 64, height: 96 },
  obstacle_fiscal_walk_0: { x: 656, y: 350, width: 64, height: 96 },
  obstacle_fiscal_walk_1: { x: 720, y: 350, width: 64, height: 96 },
  obstacle_fiscal_walk_2: { x: 784, y: 350, width: 64, height: 96 },
  obstacle_fiscal_walk_3: { x: 848, y: 350, width: 64, height: 96 },

  // ===== CÁÇA Player (real directional sprites, player1_spritesheet.png) =====
  // IMPORTANT: these are the *exact* pixel bounding boxes measured directly
  // from the actual 412x900 player1_spritesheet.png (auto-detected via the
  // image's alpha channel). Only 1 idle frame + 2 run frames exist per
  // direction in the real asset — there is no idle_1, run_2 or run_3.
  // Using coordinates that don't match the real file is exactly what causes
  // the character to render cropped/squashed/blank.
  player_front_idle_0: { x: 7, y: 4, width: 80, height: 218, source: 'player1' },
  player_front_run_0: { x: 112, y: 4, width: 104, height: 220, source: 'player1' },
  player_front_run_1: { x: 275, y: 4, width: 98, height: 220, source: 'player1' },

  player_back_idle_0: { x: 6, y: 229, width: 79, height: 218, source: 'player1' },
  player_back_run_0: { x: 118, y: 228, width: 93, height: 220, source: 'player1' },
  player_back_run_1: { x: 278, y: 228, width: 93, height: 220, source: 'player1' },

  // Row 3 (y: 452..672): Side view (character faces LEFT in player1_spritesheet.png)
  // Both left and right share these source frames, with horizontal flip applied for right
  player_right_idle_0: { x: 17, y: 452, width: 55, height: 220, source: 'player1' },
  player_right_run_0: { x: 92, y: 452, width: 145, height: 220, source: 'player1' },
  player_right_run_1: { x: 241, y: 452, width: 167, height: 220, source: 'player1' },

  player_left_idle_0: { x: 17, y: 452, width: 55, height: 220, source: 'player1' },
  player_left_run_0: { x: 92, y: 452, width: 145, height: 220, source: 'player1' },
  player_left_run_1: { x: 241, y: 452, width: 167, height: 220, source: 'player1' },

  // ==============================================================
  // 6 OBSTÁCULOS E OBJETOS DE CENÁRIO (objetos-obstaculos.png)
  // ==============================================================
  paragem_taxi_placa: { x: 226, y: 23, width: 126, height: 155, source: 'scenery_obstacles' },
  barraca_agua_fresca: { x: 385, y: 28, width: 173, height: 157, source: 'scenery_obstacles' },
  banco_madeira: { x: 26, y: 70, width: 167, height: 106, source: 'scenery_obstacles' },
  arvore: { x: 199, y: 200, width: 121, height: 168, source: 'scenery_obstacles' },
  abrigo_paragem: { x: 356, y: 210, width: 227, height: 161, source: 'scenery_obstacles' },
  cone_transito: { x: 55, y: 273, width: 76, height: 85, source: 'scenery_obstacles' },
};

export const ATLAS_PLAYER1_WIDTH = 412;
export const ATLAS_PLAYER1_HEIGHT = 675;
