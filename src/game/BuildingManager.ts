/**
 * LOTADOR - Building & Urban Background Manager
 *
 * Procedural and architectural rendering of Angolan urban establishments
 * and buildings around the Luanda paragens de táxi (candongueiros).
 *
 * 15 Diverse Establishment Types:
 * 1. Cantinas de bairro ("CANTINA DO MAMADOU", "CANTINA DA MAMÃ")
 * 2. Pequenas lojas ("MINI MERCADO CONVENIÊNCIA", "CASA DAS UTILIDADES")
 * 3. Armazéns ("ARMAZÉM DE FARRINHA & ALIMENTOS", "ARMAZÉM GERAL")
 * 4. Supermercados ("SUPERMERCADO POPULAR", "NOSSO SUPER")
 * 5. Hipermercados ("HIPER BOA COMPRA LUANDA")
 * 6. Praças comerciais ("PRAÇA COMERCIAL DA PARAGEM", "GALERIA DO CANDONGUEIRO")
 * 7. Padarias ("PADARIA PÃO QUENTE", "PADARIA CENTRAL")
 * 8. Farmácias ("FARMÁCIA POPULAR 24H", "CRUZ VERDE")
 * 9. Bancos ou caixas automáticas ("MULTICAIXA 24H", "BANCO COMERCIAL")
 * 10. Restaurantes e lanchonetes ("RESTAURANTE SABOR TROPICAL", "CHURRASQUEIRA KIANDA")
 * 11. Oficinas ("AUTO OFICINA DO PAI", "VULCANIZADOR & PNEUS")
 * 12. Lojas de telemóveis ("CASA DOS TELEMÓVEIS", "RECARGAS & ACESSÓRIOS")
 * 13. Salões de beleza e barbearias ("BARBEARIA ESTILO VIP", "SALÃO AFRO CHIC")
 * 14. Mercados de rua ("BANCAS DO MERCADO", "MERCADO INFORMAL")
 * 15. Edifícios residenciais ("EDIFÍCIO MUTAMBA", "CASAS URBANAS")
 */

import * as THREE from 'three';

export type BuildingType =
  | 'cantina'
  | 'loja'
  | 'armazem'
  | 'supermercado'
  | 'hipermercado'
  | 'praca_comercial'
  | 'padaria'
  | 'farmacia'
  | 'banco_multicaixa'
  | 'restaurante'
  | 'oficina'
  | 'loja_telemoveis'
  | 'salao_barbearia'
  | 'mercado_rua'
  | 'residencial';

export type DoorType =
  | 'metal_roller'
  | 'glass_double'
  | 'glass_single'
  | 'wood'
  | 'warehouse_gate'
  | 'grate_security'
  | 'open_stall'
  | 'single_metal_door';

export type AwningStyle = 'striped' | 'solid' | 'canopy' | 'bamboo' | 'none';

export type WallPattern = 'plain' | 'tile_wainscot' | 'horizontal_stripes' | 'brick_accent' | 'stone_plinth';

export type EntranceStyle = 'steps' | 'ramp' | 'flush';

export type FrontPropType =
  | 'none'
  | 'crates_pallet'
  | 'oil_drum'
  | 'planter_pot'
  | 'bread_basket'
  | 'newspaper_rack'
  | 'tire_pile'
  | 'produce_box'
  | 'bench_seat';

export interface WindowVariationConfig {
  hasGrilles?: boolean;
  openWindowChance?: number;
  hasCurtains?: boolean;
}

export interface BuildingData {
  id: string;
  type: BuildingType;
  name: string;
  subtitle?: string;
  x: number;
  z?: number;
  rotationY?: number;
  width: number;
  height: number;
  depth: number;
  floors: number;
  windowCols: number;
  wallColorHex: number;
  wallColorCss: string;
  trimColorCss: string;
  plinthColorCss: string;
  doorType: DoorType;
  awningStyle: AwningStyle;
  awningColor1: string;
  awningColor2: string;
  signBgColor: string;
  signTextColor: string;
  signBorderColor: string;
  hasAcUnits?: boolean;
  hasWaterTank?: boolean;
  hasSatelliteDish?: boolean;
  roofType?: 'flat' | 'parapet' | 'corrugated_pitched';
  customDetails?: {
    hasBarberPole?: boolean;
    hasPharmacyCross?: boolean;
    hasAtmScreen?: boolean;
    hasPneumaticTires?: boolean;
    hasGrillSmoke?: boolean;
    hasBreadBasket?: boolean;
    hasMobileBanner?: boolean;
  };
  // Stage 2 Procedural Architectural Variations:
  instanceSeed?: number;
  wallPattern?: WallPattern;
  entranceStyle?: EntranceStyle;
  hasVerticalSign?: boolean;
  verticalSignText?: string;
  verticalSignColor?: string;
  hasFacadeLights?: boolean;
  frontProp?: FrontPropType;
  windowVariations?: WindowVariationConfig;
}

export class BuildingManager {
  private static textureCache: Map<string, THREE.CanvasTexture> = new Map();
  private static readonly sharedRoofTopMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
  private static readonly sharedFloorBottomMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  private static readonly sharedRoofTrimMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
  private static wallMatCache: Map<number, THREE.MeshLambertMaterial> = new Map();

  public static getWallMaterial(colorHex: number): THREE.MeshLambertMaterial {
    let mat = this.wallMatCache.get(colorHex);
    if (!mat) {
      mat = new THREE.MeshLambertMaterial({ color: colorHex });
      this.wallMatCache.set(colorHex, mat);
    }
    return mat;
  }

  // =========================================================================
  // 1. PRESET LIBRARY - 15 AUTHENTIC ANGOLAN ESTABLISHMENTS
  // =========================================================================
  public static readonly ESTABLISHMENTS: Omit<BuildingData, 'id' | 'x'>[] = [
    // 1. Cantina de Bairro
    {
      type: 'cantina',
      name: 'CANTINA DO MAMADOU',
      subtitle: 'Bebidas Frescas • Pão • Salgados',
      width: 7.2,
      height: 7.5,
      depth: 6.0,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0xfe6b00,
      wallColorCss: '#fe6b00',
      trimColorCss: '#ffd700',
      plinthColorCss: '#3c2310',
      doorType: 'metal_roller',
      awningStyle: 'striped',
      awningColor1: '#d62828',
      awningColor2: '#fdf0d5',
      signBgColor: '#161c28',
      signTextColor: '#ffd700',
      signBorderColor: '#ffd700',
      hasAcUnits: true,
      hasWaterTank: true,
    },
    // 2. Pequenas Lojas / Conveniência
    {
      type: 'loja',
      name: 'MINI MERCADO CONVENIÊNCIA',
      subtitle: 'Artigos do Lar • Laticínios • Higiene',
      width: 6.8,
      height: 6.8,
      depth: 5.5,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x0284c7,
      wallColorCss: '#0284c7',
      trimColorCss: '#ffffff',
      plinthColorCss: '#0c4a6e',
      doorType: 'glass_double',
      awningStyle: 'striped',
      awningColor1: '#0284c7',
      awningColor2: '#ffffff',
      signBgColor: '#0369a1',
      signTextColor: '#ffffff',
      signBorderColor: '#38bdf8',
      hasAcUnits: true,
      hasWaterTank: false,
    },
    // 3. Armazém
    {
      type: 'armazem',
      name: 'ARMAZÉM DE ALIMENTOS',
      subtitle: 'Venda a Grosso & Retalho • Luanda',
      width: 8.5,
      height: 6.8,
      depth: 6.2,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x705d00,
      wallColorCss: '#b3951f',
      trimColorCss: '#161c28',
      plinthColorCss: '#262000',
      doorType: 'warehouse_gate',
      awningStyle: 'canopy',
      awningColor1: '#262a33',
      awningColor2: '#ffd700',
      signBgColor: '#161c28',
      signTextColor: '#ffffff',
      signBorderColor: '#fe6b00',
      hasAcUnits: false,
      hasWaterTank: true,
    },
    // 4. Supermercado
    {
      type: 'supermercado',
      name: 'NOSSO SUPER',
      subtitle: 'Frescos • Talho • Mercearia • Padaria',
      width: 8.2,
      height: 9.0,
      depth: 6.2,
      floors: 3,
      windowCols: 4,
      wallColorHex: 0x006399,
      wallColorCss: '#006399',
      trimColorCss: '#ffd700',
      plinthColorCss: '#1a2332',
      doorType: 'glass_double',
      awningStyle: 'solid',
      awningColor1: '#004369',
      awningColor2: '#ffd700',
      signBgColor: '#ffd700',
      signTextColor: '#006399',
      signBorderColor: '#ffffff',
      hasAcUnits: true,
      hasWaterTank: true,
    },
    // 5. Hipermercado
    {
      type: 'hipermercado',
      name: 'HIPER BOA COMPRA',
      subtitle: 'Grande Superfície • Qualidade Garantida',
      width: 9.0,
      height: 10.0,
      depth: 6.5,
      floors: 3,
      windowCols: 4,
      wallColorHex: 0xba1a1a,
      wallColorCss: '#ba1a1a',
      trimColorCss: '#ffffff',
      plinthColorCss: '#4a0404',
      doorType: 'glass_double',
      awningStyle: 'solid',
      awningColor1: '#8a0000',
      awningColor2: '#ffd700',
      signBgColor: '#161c28',
      signTextColor: '#ffd700',
      signBorderColor: '#ba1a1a',
      hasAcUnits: true,
      hasWaterTank: true,
    },
    // 6. Praça Comercial
    {
      type: 'praca_comercial',
      name: 'PRAÇA COMERCIAL DA PARAGEM',
      subtitle: 'Galerias • Lojas Diversas • Serviços',
      width: 8.4,
      height: 8.8,
      depth: 6.0,
      floors: 3,
      windowCols: 4,
      wallColorHex: 0xc27803,
      wallColorCss: '#c27803',
      trimColorCss: '#fef08a',
      plinthColorCss: '#451a03',
      doorType: 'glass_double',
      awningStyle: 'striped',
      awningColor1: '#c27803',
      awningColor2: '#fef08a',
      signBgColor: '#451a03',
      signTextColor: '#fef08a',
      signBorderColor: '#fde047',
      hasAcUnits: true,
      hasWaterTank: true,
    },
    // 7. Padaria
    {
      type: 'padaria',
      name: 'PADARIA PÃO QUENTE',
      subtitle: 'Fornos a Lenha • Pastelaria Tradicional',
      width: 7.2,
      height: 7.2,
      depth: 5.8,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0xd97706,
      wallColorCss: '#d97706',
      trimColorCss: '#fef3c7',
      plinthColorCss: '#78350f',
      doorType: 'glass_double',
      awningStyle: 'striped',
      awningColor1: '#b45309',
      awningColor2: '#fef3c7',
      signBgColor: '#78350f',
      signTextColor: '#fef3c7',
      signBorderColor: '#ffd700',
      hasAcUnits: true,
      hasWaterTank: false,
      customDetails: { hasBreadBasket: true },
    },
    // 8. Farmácia
    {
      type: 'farmacia',
      name: 'FARMÁCIA POPULAR 24H',
      subtitle: 'Medicamentos • Primeiros Socorros • Saúde',
      width: 7.4,
      height: 7.5,
      depth: 5.8,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x059669,
      wallColorCss: '#059669',
      trimColorCss: '#ffffff',
      plinthColorCss: '#064e3b',
      doorType: 'glass_double',
      awningStyle: 'solid',
      awningColor1: '#047857',
      awningColor2: '#ffffff',
      signBgColor: '#ffffff',
      signTextColor: '#059669',
      signBorderColor: '#10b981',
      hasAcUnits: true,
      hasWaterTank: false,
      customDetails: { hasPharmacyCross: true },
    },
    // 9. Banco / Multicaixa
    {
      type: 'banco_multicaixa',
      name: 'MULTICAIXA 24H',
      subtitle: 'Levantamentos • Transferências • Saldo',
      width: 6.8,
      height: 7.6,
      depth: 5.8,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x1e3a8a,
      wallColorCss: '#1e3a8a',
      trimColorCss: '#ef4444',
      plinthColorCss: '#0f172a',
      doorType: 'glass_double',
      awningStyle: 'solid',
      awningColor1: '#1e3a8a',
      awningColor2: '#ef4444',
      signBgColor: '#1e3a8a',
      signTextColor: '#ffffff',
      signBorderColor: '#ef4444',
      hasAcUnits: true,
      hasWaterTank: false,
      customDetails: { hasAtmScreen: true },
    },
    // 10. Restaurante e Lanchonete
    {
      type: 'restaurante',
      name: 'RESTAURANTE SABOR TROPICAL',
      subtitle: 'Churrasco • Peixe Grelhado • Mufete',
      width: 7.8,
      height: 7.4,
      depth: 6.0,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0xe11d48,
      wallColorCss: '#e11d48',
      trimColorCss: '#fde047',
      plinthColorCss: '#4c0519',
      doorType: 'wood',
      awningStyle: 'striped',
      awningColor1: '#be123c',
      awningColor2: '#fef08a',
      signBgColor: '#4c0519',
      signTextColor: '#fef08a',
      signBorderColor: '#ffd700',
      hasAcUnits: true,
      hasWaterTank: true,
      customDetails: { hasGrillSmoke: true },
    },
    // 11. Oficina Mecânica / Vulcanizador
    {
      type: 'oficina',
      name: 'AUTO OFICINA DO PAI',
      subtitle: 'Vulcanizador 24h • Pneus • Mecânica Rápida',
      width: 8.0,
      height: 6.8,
      depth: 6.2,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x475569,
      wallColorCss: '#475569',
      trimColorCss: '#f59e0b',
      plinthColorCss: '#1e293b',
      doorType: 'warehouse_gate',
      awningStyle: 'canopy',
      awningColor1: '#1e293b',
      awningColor2: '#f59e0b',
      signBgColor: '#0f172a',
      signTextColor: '#f59e0b',
      signBorderColor: '#f59e0b',
      hasAcUnits: false,
      hasWaterTank: true,
      customDetails: { hasPneumaticTires: true },
    },
    // 12. Loja de Telemóveis
    {
      type: 'loja_telemoveis',
      name: 'CASA DOS TELEMÓVEIS',
      subtitle: 'Recargas • Acessórios • Smartphones',
      width: 6.6,
      height: 7.0,
      depth: 5.6,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x7c3aed,
      wallColorCss: '#7c3aed',
      trimColorCss: '#f43f5e',
      plinthColorCss: '#3b0764',
      doorType: 'glass_double',
      awningStyle: 'striped',
      awningColor1: '#7c3aed',
      awningColor2: '#ffffff',
      signBgColor: '#3b0764',
      signTextColor: '#f43f5e',
      signBorderColor: '#c084fc',
      hasAcUnits: true,
      hasWaterTank: false,
      customDetails: { hasMobileBanner: true },
    },
    // 13. Salão de Beleza & Barbearia
    {
      type: 'salao_barbearia',
      name: 'BARBEARIA ESTILO VIP',
      subtitle: 'Cortes Masculinos • Tranças • Estilo Afro',
      width: 6.8,
      height: 7.2,
      depth: 5.6,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0x0d9488,
      wallColorCss: '#0d9488',
      trimColorCss: '#fef08a',
      plinthColorCss: '#134e4a',
      doorType: 'glass_double',
      awningStyle: 'striped',
      awningColor1: '#0f766e',
      awningColor2: '#ffffff',
      signBgColor: '#134e4a',
      signTextColor: '#fef08a',
      signBorderColor: '#2dd4bf',
      hasAcUnits: true,
      hasWaterTank: false,
      customDetails: { hasBarberPole: true },
    },
    // 14. Mercado de Rua / Bancas
    {
      type: 'mercado_rua',
      name: 'MERCADO INFORMAL DA PARAGEM',
      subtitle: 'Frutas Tropicais • Mandioca • Banana Pão',
      width: 7.4,
      height: 6.2,
      depth: 5.5,
      floors: 2,
      windowCols: 3,
      wallColorHex: 0xeab308,
      wallColorCss: '#eab308',
      trimColorCss: '#16a34a',
      plinthColorCss: '#713f12',
      doorType: 'open_stall',
      awningStyle: 'striped',
      awningColor1: '#dc2626',
      awningColor2: '#facc15',
      signBgColor: '#713f12',
      signTextColor: '#fef08a',
      signBorderColor: '#ca8a04',
      hasAcUnits: false,
      hasWaterTank: true,
    },
    // 15. Edifício Residencial
    {
      type: 'residencial',
      name: 'EDIFÍCIO MUTAMBA',
      subtitle: 'Habitação & Comércio',
      width: 8.0,
      height: 10.5,
      depth: 6.2,
      floors: 3,
      windowCols: 4,
      wallColorHex: 0xd97757,
      wallColorCss: '#d97757',
      trimColorCss: '#f8eedb',
      plinthColorCss: '#4a251a',
      doorType: 'wood',
      awningStyle: 'none',
      awningColor1: '#4a251a',
      awningColor2: '#ffffff',
      signBgColor: '#3c1d15',
      signTextColor: '#f8eedb',
      signBorderColor: '#ffd700',
      hasAcUnits: true,
      hasWaterTank: true,
      hasSatelliteDish: true,
    },
  ];

  // =========================================================================
  // 2. SCENE GENERATION - MAIN STRIP, LATERAL STREETS & SKYLINE
  // =========================================================================

  /**
   * Applies deterministic procedural variations to building facade, entrance,
   * windows, signs, and front street props based on position seed.
   */
  public static applyProceduralVariations(base: Omit<BuildingData, 'id' | 'x'>, seed: number, id: string, x: number, z = 12.0, rotY?: number): BuildingData {
    const rnd = (offset: number) => {
      const s = Math.sin(seed + offset * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    };

    // 1. Wall pattern
    let wallPattern: WallPattern = 'plain';
    const pVal = rnd(1);
    if (base.type === 'loja' || base.type === 'supermercado' || base.type === 'padaria' || base.type === 'farmacia' || base.type === 'banco_multicaixa') {
      wallPattern = pVal > 0.35 ? 'tile_wainscot' : 'horizontal_stripes';
    } else if (base.type === 'armazem' || base.type === 'oficina' || base.type === 'cantina') {
      wallPattern = pVal > 0.4 ? 'brick_accent' : 'plain';
    } else if (base.type === 'residencial' || base.type === 'restaurante' || base.type === 'salao_barbearia') {
      wallPattern = pVal > 0.35 ? 'stone_plinth' : 'horizontal_stripes';
    } else {
      wallPattern = pVal > 0.5 ? 'horizontal_stripes' : 'plain';
    }

    // 2. Entrance style (steps, ramp, or flush)
    let entranceStyle: EntranceStyle = 'flush';
    const eVal = rnd(2);
    if (base.type === 'armazem' || base.type === 'supermercado' || base.type === 'hipermercado' || base.type === 'oficina') {
      entranceStyle = eVal > 0.35 ? 'ramp' : 'steps';
    } else if (base.type === 'residencial' || base.type === 'padaria' || base.type === 'banco_multicaixa' || base.type === 'farmacia' || base.type === 'restaurante') {
      entranceStyle = eVal > 0.3 ? 'steps' : 'ramp';
    } else {
      entranceStyle = eVal > 0.5 ? 'steps' : 'flush';
    }

    // 3. Vertical projecting blade signs ("Placas em bandeira")
    let hasVerticalSign = false;
    let verticalSignText = '';
    let verticalSignColor = base.signBgColor;
    const vVal = rnd(3);
    if (vVal > 0.22) {
      hasVerticalSign = true;
      if (base.type === 'farmacia') {
        verticalSignText = '24H';
        verticalSignColor = '#059669';
      } else if (base.type === 'banco_multicaixa') {
        verticalSignText = 'ATM';
        verticalSignColor = '#1d4ed8';
      } else if (base.type === 'cantina') {
        verticalSignText = 'CANTINA';
        verticalSignColor = '#ea580c';
      } else if (base.type === 'salao_barbearia') {
        verticalSignText = 'VIP';
        verticalSignColor = '#dc2626';
      } else if (base.type === 'padaria') {
        verticalSignText = 'PÃO';
        verticalSignColor = '#d97706';
      } else if (base.type === 'oficina') {
        verticalSignText = 'PNEUS';
        verticalSignColor = '#475569';
      } else if (base.type === 'loja_telemoveis') {
        verticalSignText = 'RECARGAS';
        verticalSignColor = '#ea580c';
      } else if (base.type === 'restaurante') {
        verticalSignText = 'MENU';
        verticalSignColor = '#78350f';
      } else if (base.type === 'supermercado' || base.type === 'hipermercado') {
        verticalSignText = 'SUPER';
        verticalSignColor = '#b91c1c';
      } else {
        verticalSignText = 'ABERTO';
        verticalSignColor = '#1e293b';
      }
    }

    // 4. Exterior facade sconce lights
    const hasFacadeLights = rnd(4) > 0.25;

    // 5. Front props (bancas, caixotes, tambores, vasos de plantas)
    let frontProp: FrontPropType = 'none';
    const propVal = rnd(5);
    if (base.type === 'armazem') {
      frontProp = propVal > 0.35 ? 'crates_pallet' : 'oil_drum';
    } else if (base.type === 'oficina') {
      frontProp = propVal > 0.35 ? 'oil_drum' : 'tire_pile';
    } else if (base.type === 'cantina' || base.type === 'loja') {
      frontProp = propVal > 0.4 ? 'newspaper_rack' : 'produce_box';
    } else if (base.type === 'padaria') {
      frontProp = propVal > 0.4 ? 'bread_basket' : 'newspaper_rack';
    } else if (base.type === 'residencial' || base.type === 'restaurante' || base.type === 'praca_comercial') {
      frontProp = propVal > 0.35 ? 'planter_pot' : 'bench_seat';
    } else if (base.type === 'banco_multicaixa' || base.type === 'farmacia') {
      frontProp = propVal > 0.55 ? 'planter_pot' : 'none';
    }

    // 6. Window variations (open, curtains, security grilles)
    const hasGrilles = base.type === 'cantina' || base.type === 'farmacia' || base.type === 'armazem' || base.type === 'residencial' || rnd(6) > 0.45;
    const openWindowChance = 0.3 + rnd(7) * 0.25;
    const hasCurtains = rnd(8) > 0.28;

    return {
      ...base,
      id,
      x,
      z,
      rotationY: rotY,
      instanceSeed: seed,
      wallPattern,
      entranceStyle,
      hasVerticalSign,
      verticalSignText,
      verticalSignColor,
      hasFacadeLights,
      frontProp,
      windowVariations: {
        hasGrilles,
        openWindowChance,
        hasCurtains,
      },
    };
  }

  /**
   * Generates the central background commercial strip directly behind the sidewalk (z = 12).
   */
  public static generateCityBackground(
    startX = -28,
    endX = 28,
    stepX = 7.6,
    zPos = 12.0
  ): THREE.Group[] {
    const groups: THREE.Group[] = [];
    const presets = this.ESTABLISHMENTS;
    let idx = 0;

    for (let x = startX; x <= endX; x += stepX) {
      const preset = presets[idx % presets.length];
      const seed = Math.abs(Math.round(x * 17.3 + idx * 43.1 + 1000));
      idx++;

      const buildingData = this.applyProceduralVariations(
        preset,
        seed,
        `bld_bg_${preset.type}_${Math.round(x)}`,
        x,
        zPos
      );

      groups.push(this.createBuildingMeshGroup(buildingData, zPos));
    }

    return groups;
  }

  /**
   * Generates the lateral urban wings (Left: x < -28, Right: x > 28)
   * flanking the paragem to create a deep, continuous streetscape.
   */
  public static generateLateralStreets(): THREE.Group[] {
    const groups: THREE.Group[] = [];

    // Left Street Wing (Oficina, Armazém, Cantina de Esquina, Mercado)
    const leftConfigs: { presetIdx: number; x: number; z: number; rotY: number }[] = [
      { presetIdx: 10, x: -35, z: 10, rotY: 0 }, // Oficina
      { presetIdx: 2, x: -42, z: 9, rotY: Math.PI / 16 }, // Armazém
      { presetIdx: 0, x: -34, z: 2, rotY: Math.PI / 8 }, // Cantina
      { presetIdx: 13, x: -41, z: 1, rotY: Math.PI / 8 }, // Mercado de rua
    ];

    leftConfigs.forEach((cfg, i) => {
      const preset = this.ESTABLISHMENTS[cfg.presetIdx % this.ESTABLISHMENTS.length];
      const seed = Math.abs(Math.round(cfg.x * 29.1 + i * 53.7 + 2000));
      const data = this.applyProceduralVariations(
        preset,
        seed,
        `bld_left_${i}_${preset.type}`,
        cfg.x,
        cfg.z,
        cfg.rotY
      );
      groups.push(this.createBuildingMeshGroup(data, cfg.z));
    });

    // Right Street Wing (Multicaixa, Farmácia 24h, Barbearia, Padaria, Loja Telemóveis)
    const rightConfigs: { presetIdx: number; x: number; z: number; rotY: number }[] = [
      { presetIdx: 8, x: 35, z: 10, rotY: 0 }, // Multicaixa
      { presetIdx: 7, x: 42, z: 9, rotY: -Math.PI / 16 }, // Farmácia
      { presetIdx: 12, x: 34, z: 2, rotY: -Math.PI / 8 }, // Barbearia
      { presetIdx: 11, x: 41, z: 1, rotY: -Math.PI / 8 }, // Loja Telemóveis
    ];

    rightConfigs.forEach((cfg, i) => {
      const preset = this.ESTABLISHMENTS[cfg.presetIdx % this.ESTABLISHMENTS.length];
      const seed = Math.abs(Math.round(cfg.x * 31.3 + i * 67.9 + 3000));
      const data = this.applyProceduralVariations(
        preset,
        seed,
        `bld_right_${i}_${preset.type}`,
        cfg.x,
        cfg.z,
        cfg.rotY
      );
      groups.push(this.createBuildingMeshGroup(data, cfg.z));
    });

    return groups;
  }

  /**
   * Generates a distant skyline layer (z = 20) with residential buildings and houses.
   * Gives deep Luanda horizon perspective without cluttering the foreground or impacting performance.
   */
  public static generateDistantSkyline(): THREE.Group {
    const skylineGroup = new THREE.Group();
    skylineGroup.name = 'distant_urban_skyline';

    const houseColors = [0xdf8453, 0xfacc15, 0x38bdf8, 0x4ade80, 0xf87171, 0xa78bfa];
    const roofColors = [0x78350f, 0x991b1b, 0x334155, 0x1e293b];

    const houseMats = houseColors.map((c) => this.getWallMaterial(c));
    const roofMats = roofColors.map((c) => this.getWallMaterial(c));
    const tankMat = this.getWallMaterial(0x0284c7);
    const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 8);
    const coneGeo = new THREE.ConeGeometry(5.8 * 0.72, 1.6, 4);

    for (let x = -44; x <= 44; x += 6.5) {
      const h = 7.0 + Math.abs(Math.sin(x * 0.4)) * 7.5;
      const w = 5.8;
      const d = 5.0;

      const bodyGeo = new THREE.BoxGeometry(w, h, d);
      const bodyMat = houseMats[Math.abs(Math.round(x)) % houseMats.length];
      const bMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bMesh.position.set(x, h / 2, 20.0);
      bMesh.castShadow = false;
      bMesh.receiveShadow = false;
      skylineGroup.add(bMesh);

      // Pitched or flat roof
      const roofMat = roofMats[Math.abs(Math.round(x * 2)) % roofMats.length];
      if (Math.abs(x) % 2 === 0) {
        // Pitched roof (telhado de chapa)
        const roofMesh = new THREE.Mesh(coneGeo, roofMat);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.position.set(x, h + 0.8, 20.0);
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        skylineGroup.add(roofMesh);
      } else {
        // Flat roof with water tank
        const roofGeo = new THREE.BoxGeometry(w + 0.2, 0.4, d + 0.2);
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.position.set(x, h + 0.2, 20.0);
        roofMesh.castShadow = false;
        roofMesh.receiveShadow = false;
        skylineGroup.add(roofMesh);

        // Water tank
        const tankMesh = new THREE.Mesh(tankGeo, tankMat);
        tankMesh.position.set(x + 1.2, h + 0.9, 20.0);
        tankMesh.castShadow = false;
        tankMesh.receiveShadow = false;
        skylineGroup.add(tankMesh);
      }
    }

    return skylineGroup;
  }

  /**
   * Generates street-level props and urban life elements:
   * - Postes de iluminação pública urbana com lâmpada
   * - Caixotes de lixo e tambores urbanos
   * - Totem exterior Multicaixa ATM no passeio
   * - Pilhas de pneus low-poly da oficina
   * - Placas de trânsito angolanas com direções de bairros (Luanda, Viana, Talatona, Kilamba)
   * - Bancas de venda com sombrinhas coloridas (zungueiras)
   */
  public static generateUrbanProps(): THREE.Group[] {
    const props: THREE.Group[] = [];

    // 1. Street Lamp Posts (Postes de iluminação pública) along sidewalk (z = 9.2)
    [-24, -14, -2, 10, 22].forEach((x) => {
      const lampGroup = this.createStreetLamp(x, 0.4, 9.2);
      props.push(lampGroup);
    });

    // 2. Trash Bins (Caixotes de lixo urbanos)
    [-18, -6, 6, 18].forEach((x) => {
      const bin = this.createTrashBin(x, 0.4, 8.8);
      props.push(bin);
    });

    // 3. Directional Road Sign (Placa de Direção de Luanda)
    const signBoard = this.createAngolaDirectionSign(-26, 0.4, 2.5);
    props.push(signBoard);

    const signBoard2 = this.createAngolaDirectionSign(26, 0.4, 2.5);
    props.push(signBoard2);

    // 4. Street Multicaixa Standalone ATM Totem (Passeio, perto da zona comercial)
    const atmTotem = this.createMulticaixaTotem(15.5, 0.4, 8.6);
    props.push(atmTotem);

    // 5. Tire Stack for Auto Workshop (Perto da lateral esquerda)
    const tireStack1 = this.createTireStack(-27.5, 0.4, 8.8);
    props.push(tireStack1);

    // 6. Street Market Fruit Stall / Zungueira Umbrella
    const marketStall = this.createStreetFruitStall(-8, 0.4, 8.6);
    props.push(marketStall);

    const marketStall2 = this.createStreetFruitStall(8, 0.4, 8.6);
    props.push(marketStall2);

    return props;
  }

  // =========================================================================
  // 3. 3D BUILDING GROUP BUILDER
  // =========================================================================

  /**
   * Builds the 3D mesh group for any building:
   * - Box structure with textured front facade
   * - Projecting 3D awning with authentic physics/shadows
   * - Roof parapet trim
   * - Rooftop props (water tank, satellite dish)
   * - Lateral detail props (barber pole, pharmacy cross, etc.)
   */
  public static createBuildingMeshGroup(data: BuildingData, zPos: number): THREE.Group {
    const group = new THREE.Group();
    group.name = data.id;

    const { width, height, depth } = data;
    const yCenter = height / 2 + 0.4;

    // 1. Structural Mesh
    const bGeo = new THREE.BoxGeometry(width, height, depth);

    const sideWallMat = this.getWallMaterial(data.wallColorHex);
    const roofTopMat = this.sharedRoofTopMat;
    const floorBottomMat = this.sharedFloorBottomMat;

    const frontFacadeTex = this.getBuildingFacadeTexture(data);
    const frontFacadeMat = new THREE.MeshLambertMaterial({ map: frontFacadeTex });

    const materials: THREE.Material[] = [
      sideWallMat, // +X right
      sideWallMat, // -X left
      roofTopMat, // +Y top
      floorBottomMat, // -Y bottom
      sideWallMat, // +Z back
      frontFacadeMat, // -Z front (faces sidewalk & camera!)
    ];

    const buildingMesh = new THREE.Mesh(bGeo, materials);
    buildingMesh.position.set(0, yCenter, 0);
    buildingMesh.castShadow = false;
    buildingMesh.receiveShadow = true;
    group.add(buildingMesh);

    // 2. Connecting Apron Pavement Slab (smooth low-poly transition to paragem)
    const apron = this.createConnectingApron(width, depth);
    group.add(apron);

    // 3. Roof Trim Parapet
    const roofGeo = new THREE.BoxGeometry(width + 0.35, 0.45, depth + 0.35);
    const roof = new THREE.Mesh(roofGeo, this.sharedRoofTrimMat);
    roof.position.set(0, height + 0.6, 0);
    roof.castShadow = false;
    roof.receiveShadow = true;
    group.add(roof);

    // 4. Entrance Steps or Ramp
    if (data.entranceStyle === 'steps') {
      const steps = this.createEntranceSteps(2.0, 0.24);
      steps.position.set(0, 0, -depth / 2 - 0.22);
      group.add(steps);
    } else if (data.entranceStyle === 'ramp') {
      const ramp = this.createEntranceRamp(2.0, 0.22);
      ramp.position.set(0, 0, -depth / 2 - 0.24);
      group.add(ramp);
    }

    // 5. 3D Awning
    if (data.awningStyle !== 'none') {
      const awning3D = this.create3DAwning(data);
      awning3D.position.set(0, 0, -depth / 2);
      group.add(awning3D);
    }

    // 6. Rooftop Props
    const roofProps = this.createRooftopProps(data, height + 0.8);
    group.add(roofProps);

    // 7. Vertical Blade Signs ("Placas em bandeira")
    if (data.hasVerticalSign && data.verticalSignText) {
      const vSign = this.createVerticalBladeSign(
        data.verticalSignText,
        data.verticalSignColor || data.signBgColor,
        data.signTextColor || '#ffffff'
      );
      const signX = (data.instanceSeed || 0) % 2 === 0 ? width * 0.46 : -width * 0.46;
      vSign.position.set(signX, 3.6, -depth / 2 - 0.35);
      group.add(vSign);
    }

    // 8. Facade Exterior Lights (Luminárias de parede)
    if (data.hasFacadeLights) {
      const lampL = this.createFacadeWallLamp();
      lampL.position.set(-width * 0.3, 3.9, -depth / 2 - 0.1);
      group.add(lampL);

      const lampR = this.createFacadeWallLamp();
      lampR.position.set(width * 0.3, 3.9, -depth / 2 - 0.1);
      group.add(lampR);
    }

    // 9. Front Commercial & Street Props (Bancas, caixotes, vasos, tambores)
    if (data.frontProp && data.frontProp !== 'none') {
      const frontPropMesh = this.createFrontProp(data.frontProp, width, depth, data.instanceSeed || 0);
      if (frontPropMesh) {
        group.add(frontPropMesh);
      }
    }

    // 10. Special Exterior 3D Props (Barber pole, pharmacy 3D cross, etc.)
    if (data.customDetails?.hasBarberPole) {
      const pole = this.create3DBarberPole();
      pole.position.set(width * 0.44, 2.5, -depth / 2 - 0.2);
      group.add(pole);
    }

    if (data.customDetails?.hasPharmacyCross) {
      const cross = this.create3DPharmacyCross();
      cross.position.set(-width * 0.44, 2.6, -depth / 2 - 0.2);
      group.add(cross);
    }

    // Position & Rotation in World
    group.position.set(data.x, 0, zPos);
    if (data.rotationY) {
      group.rotation.y = data.rotationY;
    }

    return group;
  }

  // =========================================================================
  // 4. TEXTURE CACHING & MASTER CANVAS DRAWING
  // =========================================================================

  public static getBuildingFacadeTexture(data: BuildingData): THREE.CanvasTexture {
    const cacheKey = `${data.type}_${data.id}_${data.wallPattern || 'plain'}_${data.doorType}_${data.instanceSeed || 0}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      this.drawBuildingFacade(ctx, canvas.width, canvas.height, data);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Master Canvas 2D Facade Drawer:
   * Dispatches to dedicated facade implementations for each of the 15 establishment types.
   */
  public static drawBuildingFacade(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    ctx.clearRect(0, 0, w, h);

    // 1. Base Wall Background with subtle stucco gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h);
    wallGrad.addColorStop(0, this.adjustBrightness(data.wallColorCss, 1.15));
    wallGrad.addColorStop(0.6, data.wallColorCss);
    wallGrad.addColorStop(1, this.adjustBrightness(data.wallColorCss, 0.82));
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h);

    // Lateral pillars for architectural weight
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, 16, h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w - 16, 0, 16, h);

    // Wall Pattern Variations
    if (data.wallPattern === 'tile_wainscot') {
      const tileTop = h * 0.58;
      const tileH = h * 0.37;
      ctx.fillStyle = this.adjustBrightness(data.wallColorCss, 0.82);
      ctx.fillRect(0, tileTop, w, tileH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      const tileSz = 18;
      for (let tx = 0; tx < w; tx += tileSz) {
        ctx.beginPath();
        ctx.moveTo(tx, tileTop);
        ctx.lineTo(tx, tileTop + tileH);
        ctx.stroke();
      }
      for (let ty = tileTop; ty < tileTop + tileH; ty += tileSz) {
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(w, ty);
        ctx.stroke();
      }
      ctx.fillStyle = data.trimColorCss;
      ctx.fillRect(0, tileTop - 4, w, 4);
    } else if (data.wallPattern === 'brick_accent') {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      const brickH = 14;
      const brickW = 28;
      for (let by = 48; by < h * 0.6; by += brickH) {
        const offset = (Math.floor(by / brickH) % 2) * (brickW / 2);
        for (let bx = -offset; bx < w; bx += brickW) {
          ctx.strokeRect(bx, by, brickW, brickH);
        }
      }
    } else if (data.wallPattern === 'horizontal_stripes') {
      ctx.fillStyle = this.adjustBrightness(data.wallColorCss, 1.25);
      ctx.fillRect(0, h * 0.46, w, 16);
      ctx.fillStyle = data.trimColorCss;
      ctx.fillRect(0, h * 0.46 + 16, w, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, h * 0.46 - 2, w, 2);
    } else if (data.wallPattern === 'stone_plinth') {
      const plinthTop = h * 0.7;
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, plinthTop, w, h - plinthTop);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      for (let sy = plinthTop; sy < h; sy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
        ctx.stroke();
      }
      for (let sx = 0; sx < w; sx += 48) {
        ctx.beginPath();
        ctx.moveTo(sx, plinthTop);
        ctx.lineTo(sx, h);
        ctx.stroke();
      }
    }

    // 2. Concrete Base Plinth (Rodapé da rua)
    const plinthH = h * 0.05;
    ctx.fillStyle = data.plinthColorCss;
    ctx.fillRect(0, h - plinthH, w, plinthH);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, h - plinthH, w, 3);

    // Vertical zoning
    const groundFloorTop = h * 0.62;
    const groundFloorH = h - groundFloorTop - plinthH;
    const corniceY = groundFloorTop - 12;

    // 3. Ground Floor Storefront
    this.drawStorefront(ctx, 0, groundFloorTop, w, groundFloorH, data);

    // 4. Floor dividing cornice
    ctx.fillStyle = '#161c28';
    ctx.fillRect(0, corniceY, w, 12);
    ctx.fillStyle = data.trimColorCss;
    ctx.fillRect(0, corniceY + 2, w, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, corniceY + 12, w, 8);

    // 5. Commercial Signboard
    this.drawSignboard(ctx, w, corniceY - 50, data);

    // 6. Upper Floors Windows
    this.drawWindows(ctx, 0, 45, w, corniceY - 100, data);

    // 7. Roof Parapet Cornice
    this.drawRoofCornice(ctx, w, 38, data);
  }

  // =========================================================================
  // 5. PARAMETRIZED FACADE & STOREFRONT DISPATCHER (15 TYPES)
  // =========================================================================

  public static drawStorefront(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    const padX = 36;
    const storeW = w - padX * 2;

    // Storefront backdrop frame
    ctx.fillStyle = '#161c28';
    ctx.fillRect(padX - 8, y, storeW + 16, h);
    ctx.fillStyle = '#262f3f';
    ctx.fillRect(padX - 4, y + 4, storeW + 8, h - 4);

    switch (data.type) {
      case 'cantina':
        this.drawCantinaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'loja':
        this.drawLojaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'armazem':
        this.drawArmazemStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'supermercado':
      case 'hipermercado':
        this.drawSupermercadoStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'praca_comercial':
        this.drawPracaComercialStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'padaria':
        this.drawPadariaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'farmacia':
        this.drawFarmaciaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'banco_multicaixa':
        this.drawBancoMulticaixaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'restaurante':
        this.drawRestauranteStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'oficina':
        this.drawOficinaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'loja_telemoveis':
        this.drawTelemoveisStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'salao_barbearia':
        this.drawBarbeariaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'mercado_rua':
        this.drawMercadoRuaStorefront(ctx, padX, y, storeW, h, data);
        break;
      case 'residencial':
      default:
        this.drawResidencialStorefront(ctx, padX, y, storeW, h, data);
        break;
    }
  }

  // --- Specific Storefront Implementations ---

  private static drawCantinaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.44;
    const winW = storeW * 0.44;
    const gap = storeW * 0.12;

    const doorX = padX + 12;
    const winX = doorX + doorW + gap;

    this.drawDoor(ctx, doorX, y + 16, doorW, h - 16, data.doorType);
    this.drawShopDisplayWindow(ctx, winX, y + 26, winW, h * 0.65, 'cantina');

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PÃO QUENTE • GELO', winX + winW / 2, y + 18);
  }

  private static drawLojaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.38;
    const winW = storeW * 0.52;
    const doorX = padX + 8;
    const winX = doorX + doorW + 12;

    this.drawDoor(ctx, doorX, y + 16, doorW, h - 16, data.doorType);
    this.drawShopDisplayWindow(ctx, winX, y + 16, winW, h - 16, 'loja_utilidades');
  }

  private static drawArmazemStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const gateW = storeW * 0.68;
    const sideDoorW = storeW * 0.24;
    const gateX = padX + 8;
    const sideX = gateX + gateW + 12;

    this.drawDoor(ctx, gateX, y + 14, gateW, h - 14, 'warehouse_gate');
    this.drawDoor(ctx, sideX, y + 28, sideDoorW, h - 28, 'metal_roller');
  }

  private static drawSupermercadoStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const winW = storeW * 0.28;
    const doorW = storeW * 0.36;
    const leftWinX = padX + 6;
    const doorX = leftWinX + winW + 10;
    const rightWinX = doorX + doorW + 10;

    this.drawShopDisplayWindow(ctx, leftWinX, y + 14, winW, h - 18, 'super_promo');
    this.drawDoor(ctx, doorX, y + 14, doorW, h - 14, 'glass_double');
    this.drawShopDisplayWindow(ctx, rightWinX, y + 14, winW, h - 18, 'super_grocery');

    ctx.fillStyle = '#ffd700';
    ctx.fillRect(doorX + 8, y + 4, doorW - 16, 8);
  }

  private static drawPracaComercialStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    // Twin archways leading to internal mall gallery
    const archW = storeW * 0.44;
    const archGap = storeW * 0.12;
    const arch1X = padX + 8;
    const arch2X = arch1X + archW + archGap;

    [arch1X, arch2X].forEach((ax, idx) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ax, y + 16, archW, h - 16);

      // Arch top
      ctx.beginPath();
      ctx.arc(ax + archW / 2, y + 24, archW / 2 - 2, Math.PI, 0);
      ctx.fillStyle = '#ffd700';
      ctx.fill();

      // Glass door inside
      this.drawDoor(ctx, ax + 6, y + 26, archW - 12, h - 26, 'glass_double');

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(idx === 0 ? 'ENTRADA A' : 'ENTRADA B', ax + archW / 2, y + 20);
    });
  }

  private static drawPadariaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.36;
    const winW = storeW * 0.54;
    const doorX = padX + 8;
    const winX = doorX + doorW + 12;

    this.drawDoor(ctx, doorX, y + 16, doorW, h - 16, 'glass_double');
    this.drawShopDisplayWindow(ctx, winX, y + 16, winW, h - 16, 'padaria_vitrine');

    // Baker banner
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FORNADAS A CADA 30 MIN', winX + winW / 2, y + 10);
  }

  private static drawFarmaciaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.40;
    const winW = storeW * 0.50;
    const winX = padX + 8;
    const doorX = winX + winW + 12;

    this.drawShopDisplayWindow(ctx, winX, y + 14, winW, h - 16, 'farmacia_vitrine');
    this.drawDoor(ctx, doorX, y + 14, doorW, h - 14, 'glass_double');

    // Illuminated Green Cross on facade glass
    this.drawGreenCross(ctx, winX + winW / 2, y + h * 0.35, 18);
  }

  private static drawBancoMulticaixaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const atmW = storeW * 0.48;
    const doorW = storeW * 0.42;
    const atmX = padX + 8;
    const doorX = atmX + atmW + 12;

    // ATM Machine inset box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(atmX, y + 12, atmW, h - 12);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(atmX, y + 12, atmW, h - 12);

    // ATM Screen
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(atmX + 10, y + 26, atmW - 20, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MULTICAIXA', atmX + atmW / 2, y + 42);
    ctx.fillText('INSIRA O CARTÃO', atmX + atmW / 2, y + 54);

    // ATM Keypad
    ctx.fillStyle = '#64748b';
    ctx.fillRect(atmX + 14, y + 68, atmW - 28, 22);

    // Card Slot & Cash Dispenser
    ctx.fillStyle = '#10b981';
    ctx.fillRect(atmX + 16, y + 96, atmW - 32, 6);

    // Security Glass Entrance Door
    this.drawDoor(ctx, doorX, y + 12, doorW, h - 12, 'glass_double');
  }

  private static drawRestauranteStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.38;
    const winW = storeW * 0.52;
    const doorX = padX + 8;
    const winX = doorX + doorW + 12;

    this.drawDoor(ctx, doorX, y + 16, doorW, h - 16, 'wood');
    this.drawShopDisplayWindow(ctx, winX, y + 16, winW, h - 16, 'restaurante_vitrine');

    // Menu chalkboard
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(doorX - 22, y + 24, 16, 32);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(doorX - 22, y + 24, 16, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MENU', doorX - 14, y + 32);
    ctx.fillText('DO DIA', doorX - 14, y + 40);
  }

  private static drawOficinaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const gateW = storeW * 0.72;
    const sideDoorW = storeW * 0.22;
    const gateX = padX + 6;
    const sideX = gateX + gateW + 10;

    // Industrial rolling garage gate
    this.drawDoor(ctx, gateX, y + 12, gateW, h - 12, 'warehouse_gate');
    this.drawDoor(ctx, sideX, y + 26, sideDoorW, h - 26, 'metal_roller');

    // Tire service stencil on gate
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TROCA DE PNEUS & ÓLEO', gateX + gateW / 2, y + 8);
  }

  private static drawTelemoveisStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.38;
    const winW = storeW * 0.52;
    const doorX = padX + 8;
    const winX = doorX + doorW + 12;

    this.drawDoor(ctx, doorX, y + 14, doorW, h - 14, 'glass_double');
    this.drawShopDisplayWindow(ctx, winX, y + 14, winW, h - 14, 'telemoveis_vitrine');

    // Telco brand stripes (orange/yellow/blue/purple)
    const stripeColors = ['#f97316', '#eab308', '#3b82f6', '#8b5cf6'];
    stripeColors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(winX + idx * (winW / 4), y + 6, winW / 4, 6);
    });
  }

  private static drawBarbeariaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.40;
    const winW = storeW * 0.50;
    const winX = padX + 8;
    const doorX = winX + winW + 12;

    this.drawShopDisplayWindow(ctx, winX, y + 14, winW, h - 14, 'barbearia_vitrine');
    this.drawDoor(ctx, doorX, y + 14, doorW, h - 14, 'glass_double');

    // Barber pole painting on side pillar
    this.drawBarberPole2D(ctx, winX - 16, y + 18, 12, 48);
  }

  private static drawMercadoRuaStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    // Open street market stall counters with fresh fruit baskets
    ctx.fillStyle = '#78350f';
    ctx.fillRect(padX + 6, y + h * 0.45, storeW - 12, h * 0.55);

    // Table display slats
    ctx.fillStyle = '#b45309';
    ctx.fillRect(padX + 8, y + h * 0.45 + 4, storeW - 16, 8);

    // Fruit baskets (bananas, mangas, legumes)
    const basketColors = ['#eab308', '#ea580c', '#16a34a', '#dc2626'];
    const bW = (storeW - 24) / 4;
    basketColors.forEach((col, idx) => {
      const bx = padX + 12 + idx * bW;
      ctx.fillStyle = '#713f12';
      ctx.fillRect(bx, y + h * 0.45 - 12, bW - 6, 14);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(bx + (bW - 6) / 2, y + h * 0.45 - 12, (bW - 6) / 2 - 2, Math.PI, 0);
      ctx.fill();
    });
  }

  private static drawResidencialStorefront(
    ctx: CanvasRenderingContext2D,
    padX: number,
    y: number,
    storeW: number,
    h: number,
    data: BuildingData
  ): void {
    const doorW = storeW * 0.40;
    const doorX = padX + (storeW - doorW) / 2;

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(doorX - 10, y + 8, doorW + 20, h - 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(doorX - 6, y + 12, doorW + 12, h - 12);

    this.drawDoor(ctx, doorX, y + 18, doorW, h - 18, 'wood');

    // Mailbox & intercom
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(doorX - 24, y + h * 0.45, 12, 28);
    ctx.fillStyle = '#475569';
    ctx.fillRect(doorX - 22, y + h * 0.45 + 3, 8, 22);

    // Porch light
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(doorX + doorW / 2, y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================================================================
  // 6. DETAILED DOORS, WINDOWS, DISPLAYS & SIGNBOARD DRAWING
  // =========================================================================

  public static drawDoor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    type: DoorType
  ): void {
    if (type === 'metal_roller') {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, y, w, h);

      const slatH = 8;
      for (let sy = y; sy < y + h - 8; sy += slatH) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, sy, w, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x, sy + 2, w, 2);
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 2, y + h - 12, w + 4, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x + w / 2 - 8, y + h - 10, 16, 4);
    } else if (type === 'warehouse_gate') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, w, h);

      for (let rx = x; rx < x + w; rx += 14) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rx, y, 3, h - 16);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(rx + 3, y, 3, h - 16);
      }

      const stripeH = 16;
      const stripeY = y + h - stripeH;
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x, stripeY, w, stripeH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, stripeY, w, stripeH);
      ctx.clip();
      ctx.strokeStyle = '#161c28';
      ctx.lineWidth = 8;
      for (let sx = x - stripeH; sx < x + w + stripeH; sx += 18) {
        ctx.beginPath();
        ctx.moveTo(sx, stripeY + stripeH);
        ctx.lineTo(sx + stripeH, stripeY);
        ctx.stroke();
      }
      ctx.restore();
    } else if (type === 'glass_double') {
      const halfW = w / 2;
      ctx.fillStyle = '#09101d';
      ctx.fillRect(x, y, w, h);

      for (let i = 0; i < 2; i++) {
        const dx = x + i * halfW + 2;
        const dw = halfW - 4;

        ctx.fillStyle = '#0f2744';
        ctx.fillRect(dx, y + 2, dw, h - 4);

        // Glare highlight
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, y + 2, dw, h - 4);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.moveTo(dx - 10, y + h);
        ctx.lineTo(dx + dw + 10, y);
        ctx.lineTo(dx + dw - 10, y);
        ctx.lineTo(dx - 30, y + h);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.strokeRect(dx, y + 2, dw, h - 4);

        const handleX = i === 0 ? dx + dw - 8 : dx + 8;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(handleX, y + h * 0.35, 4, h * 0.3);
      }
    } else if (type === 'glass_single') {
      // Single framed aluminum commercial glass entrance door
      ctx.fillStyle = '#09101d';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = '#0f2744';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

      // Glass glare
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 3, y + 3, w - 6, h - 6);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(x - 10, y + h);
      ctx.lineTo(x + w + 10, y);
      ctx.lineTo(x + w - 5, y);
      ctx.lineTo(x - 25, y + h);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);

      // Horizontal push bar
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 6, y + h * 0.48, w - 12, 5);

      // "ABERTO" glass sign decal
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + (w - 32) / 2, y + h * 0.28, 32, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ABERTO', x + w / 2, y + h * 0.28 + 9);
    } else if (type === 'single_metal_door') {
      // Sturdy Angolan security iron door with peep postigo and ribbed plates
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Reinforced horizontal ribs
      for (let ry = y + 16; ry < y + h - 16; ry += 20) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 4, ry, w - 8, 3);
      }

      // Small security peep grille / postigo
      const postigoW = w * 0.45;
      const postigoH = 20;
      const postigoX = x + (w - postigoW) / 2;
      const postigoY = y + 24;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(postigoX, postigoY, postigoW, postigoH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(postigoX, postigoY, postigoW, postigoH);
      for (let bx = postigoX + 4; bx < postigoX + postigoW; bx += 6) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx, postigoY + 2, 2, postigoH - 4);
      }

      // Brass door handle
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x + w * 0.82, y + h * 0.52, 5, 12);
    } else {
      // Wood door
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x, y, w, h);

      const panelW = w * 0.38;
      const panelH = (h - 24) / 3;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const px = x + 6 + col * (panelW + 6);
          const py = y + 6 + row * (panelH + 6);
          ctx.fillStyle = '#3f1d0e';
          ctx.fillRect(px, py, panelW, panelH);
          ctx.fillStyle = '#7a3e20';
          ctx.fillRect(px + 2, py + 2, panelW - 4, panelH - 4);
        }
      }

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x + w * 0.85, y + h * 0.55, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public static drawShopDisplayWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    theme: string
  ): void {
    ctx.fillStyle = '#0b1424';
    ctx.fillRect(x, y, w, h);

    // Shelves
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + h * 0.45, w, 4);
    ctx.fillRect(x, y + h * 0.75, w, 4);

    if (theme === 'cantina') {
      ctx.fillStyle = '#ffd700';
      for (let bx = x + 6; bx < x + w - 8; bx += 10) {
        ctx.fillRect(bx, y + h * 0.45 - 14, 6, 14);
      }
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 6, y + h * 0.75 - 16, w - 12, 16);
    } else if (theme === 'padaria_vitrine') {
      // Bread & pastry silhouettes
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 6, y + h * 0.45 - 12, w - 12, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 10, y + h * 0.75 - 14, w - 20, 14);
    } else if (theme === 'farmacia_vitrine') {
      // Medicine boxes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + h * 0.45 - 12, 14, 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 24, y + h * 0.45 - 12, 14, 12);
    } else if (theme === 'telemoveis_vitrine') {
      // Smartphones
      for (let px = x + 8; px < x + w - 12; px += 14) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(px, y + h * 0.45 - 14, 8, 14);
      }
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 4, y + h * 0.45 - 12, 12, 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 20, y + h * 0.45 - 12, 14, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 4, y + h * 0.75 - 14, w - 8, 14);
    }

    // Glass reflection diagonal glare
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(x - 20, y + h);
    ctx.lineTo(x + w * 0.8, y);
    ctx.lineTo(x + w * 0.8 + 25, y);
    ctx.lineTo(x + 5, y + h);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }

  public static drawWindows(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    totalW: number,
    availH: number,
    data: BuildingData
  ): void {
    const floors = Math.max(1, data.floors - 1);
    const cols = data.windowCols;

    const floorH = availH / floors;
    const colW = totalW / cols;

    const winW = colW * 0.56;
    const winH = floorH * 0.55;

    const seedBase = data.instanceSeed || 12345;

    for (let f = 0; f < floors; f++) {
      const rowY = startY + f * floorH + (floorH - winH) / 2;

      for (let c = 0; c < cols; c++) {
        const colX = startX + c * colW + (colW - winW) / 2;

        // Deterministic variation factor for each individual window
        const winHash = Math.abs(Math.sin(seedBase + f * 31.7 + c * 17.3)) * 10000;
        const winFactor = winHash - Math.floor(winHash);

        const isOpen = winFactor < (data.windowVariations?.openWindowChance ?? 0.28);
        const hasCurtain = !isOpen && winFactor > 0.35 && winFactor < 0.65;
        const hasBlinds = !isOpen && !hasCurtain && winFactor > 0.65 && winFactor < 0.85;

        // Window sill and lintel
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(colX - 4, rowY + winH, winW + 8, 5);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(colX - 4, rowY + winH - 2, winW + 8, 4);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(colX - 2, rowY - 4, winW + 4, 4);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(colX, rowY, winW, winH);

        if (isOpen) {
          // Open window interior: warm cozy room light gradient
          const roomGrad = ctx.createLinearGradient(colX, rowY, colX, rowY + winH);
          roomGrad.addColorStop(0, '#fef08a');
          roomGrad.addColorStop(0.4, '#f59e0b');
          roomGrad.addColorStop(1, '#78350f');
          ctx.fillStyle = roomGrad;
          ctx.fillRect(colX + 2, rowY + 2, winW - 4, winH - 4);

          // Room interior silhouette
          ctx.fillStyle = 'rgba(30, 20, 10, 0.35)';
          ctx.fillRect(colX + 2, rowY + winH * 0.55, (winW - 4) * 0.45, winH * 0.45);

          // Swung-open outward casement sash
          const openSashW = (winW - 4) * 0.45;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(colX + winW - openSashW - 2, rowY + 3, openSashW, winH - 6);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(colX + winW - openSashW - 1, rowY + 4, openSashW - 2, (winH - 8) * 0.4);
        } else if (hasCurtain) {
          // Glass background
          const glassGrad = ctx.createLinearGradient(colX, rowY, colX, rowY + winH);
          glassGrad.addColorStop(0, '#38bdf8');
          glassGrad.addColorStop(0.5, '#0284c7');
          glassGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = glassGrad;
          ctx.fillRect(colX + 2, rowY + 2, winW - 4, winH - 4);

          // Draped fabric curtains
          const curtainW = (winW - 4) * 0.32;
          ctx.fillStyle = winFactor > 0.48 ? '#fef08a' : '#ffffff';
          // Left drape
          ctx.beginPath();
          ctx.moveTo(colX + 2, rowY + 2);
          ctx.lineTo(colX + 2 + curtainW, rowY + 2);
          ctx.quadraticCurveTo(colX + 2 + curtainW * 0.6, rowY + winH * 0.5, colX + 2 + curtainW * 0.85, rowY + winH - 2);
          ctx.lineTo(colX + 2, rowY + winH - 2);
          ctx.fill();
          // Right drape
          ctx.beginPath();
          ctx.moveTo(colX + winW - 2, rowY + 2);
          ctx.lineTo(colX + winW - 2 - curtainW, rowY + 2);
          ctx.quadraticCurveTo(colX + winW - 2 - curtainW * 0.6, rowY + winH * 0.5, colX + winW - 2 - curtainW * 0.85, rowY + winH - 2);
          ctx.lineTo(colX + winW - 2, rowY + winH - 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(colX + winW * 0.35, rowY + 2, winW * 0.3, winH - 4);
        } else if (hasBlinds) {
          // Venetian horizontal blinds
          const glassGrad = ctx.createLinearGradient(colX, rowY, colX, rowY + winH);
          glassGrad.addColorStop(0, '#0284c7');
          glassGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = glassGrad;
          ctx.fillRect(colX + 2, rowY + 2, winW - 4, winH - 4);

          const blindH = winH * 0.7;
          ctx.fillStyle = '#f8fafc';
          for (let by = rowY + 3; by < rowY + blindH; by += 4) {
            ctx.fillRect(colX + 3, by, winW - 6, 2.5);
          }
        } else {
          // Standard reflective closed glass
          const glassGrad = ctx.createLinearGradient(colX, rowY, colX, rowY + winH);
          glassGrad.addColorStop(0, '#38bdf8');
          glassGrad.addColorStop(0.35, '#0284c7');
          glassGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = glassGrad;
          ctx.fillRect(colX + 2, rowY + 2, winW - 4, winH - 4);

          // Diagonal glare streak
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.beginPath();
          ctx.moveTo(colX + 2, rowY + winH * 0.8);
          ctx.lineTo(colX + winW * 0.7, rowY + 2);
          ctx.lineTo(colX + winW * 0.9, rowY + 2);
          ctx.lineTo(colX + winW * 0.2, rowY + winH - 2);
          ctx.fill();
        }

        // Window caixilharia (mullions)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(colX + winW / 2 - 1.5, rowY + 2, 3, winH - 4);
        ctx.fillRect(colX + 2, rowY + winH * 0.45 - 1.5, winW - 4, 3);

        // Security Grilles (Grades de ferro)
        const hasGrilles = data.windowVariations?.hasGrilles && (f === 0 || f === floors - 1);
        if (hasGrilles) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          const barCount = 4;
          const barSpacing = (winW - 6) / (barCount + 1);
          for (let b = 1; b <= barCount; b++) {
            const bx = colX + 3 + b * barSpacing;
            ctx.beginPath();
            ctx.moveTo(bx, rowY - 1);
            ctx.lineTo(bx, rowY + winH + 1);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.moveTo(colX + 1, rowY + winH * 0.25);
          ctx.lineTo(colX + winW - 1, rowY + winH * 0.25);
          ctx.moveTo(colX + 1, rowY + winH * 0.75);
          ctx.lineTo(colX + winW - 1, rowY + winH * 0.75);
          ctx.stroke();

          // Central decorative iron diamond
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(colX + winW / 2, rowY + winH / 2 - 5);
          ctx.lineTo(colX + winW / 2 + 5, rowY + winH / 2);
          ctx.lineTo(colX + winW / 2, rowY + winH / 2 + 5);
          ctx.lineTo(colX + winW / 2 - 5, rowY + winH / 2);
          ctx.fill();
        }

        // AC unit
        if (data.hasAcUnits && (f === floors - 1 && (c === 0 || c === cols - 1))) {
          const acW = winW * 0.65;
          const acH = 14;
          const acX = colX + (winW - acW) / 2;
          const acY = rowY + winH + 5;

          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(acX - 1, acY + acH, acW + 2, 3);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(acX, acY, acW, acH);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(acX, acY, acW, acH);
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(acX + acW * 0.3, acY + acH / 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  public static drawSignboard(
    ctx: CanvasRenderingContext2D,
    w: number,
    y: number,
    data: BuildingData
  ): void {
    const signW = w - 48;
    const signH = 46;
    const signX = (w - signW) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(signX + 4, y + 4, signW, signH);

    ctx.fillStyle = data.signBgColor;
    ctx.fillRect(signX, y, signW, signH);

    ctx.strokeStyle = data.signBorderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(signX + 2, y + 2, signW - 4, signH - 4);

    ctx.fillStyle = '#ffd700';
    [
      [signX + 6, y + 6],
      [signX + signW - 6, y + 6],
      [signX + 6, y + signH - 6],
      [signX + signW - 6, y + signH - 6],
    ].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = data.signTextColor;
    ctx.textAlign = 'center';
    ctx.font = '900 17px "Anybody", "Space Grotesk", sans-serif';
    ctx.fillText(data.name, w / 2, y + 24);

    if (data.subtitle) {
      ctx.fillStyle = data.trimColorCss || '#ffffff';
      ctx.font = 'bold 9px "Work Sans", sans-serif';
      ctx.fillText(data.subtitle.toUpperCase(), w / 2, y + 38);
    }
  }

  public static drawRoofCornice(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    data: BuildingData
  ): void {
    ctx.fillStyle = '#161c28';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = data.trimColorCss;
    ctx.fillRect(0, h - 8, w, 8);

    ctx.fillStyle = '#f8fafc';
    const dentilW = 12;
    const dentilGap = 8;
    for (let dx = 10; dx < w - 10; dx += dentilW + dentilGap) {
      ctx.fillRect(dx, h - 16, dentilW, 6);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, h, w, 10);
  }

  private static drawGreenCross(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number
  ): void {
    ctx.fillStyle = '#10b981';
    const armW = size * 0.35;
    ctx.fillRect(cx - armW / 2, cy - size / 2, armW, size);
    ctx.fillRect(cx - size / 2, cy - armW / 2, size, armW);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - armW / 2, cy - size / 2, armW, size);
    ctx.strokeRect(cx - size / 2, cy - armW / 2, size, armW);
  }

  private static drawBarberPole2D(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 2, y - 4, w + 4, 4);
    ctx.fillRect(x - 2, y + h, w + 4, 4);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, w, h);

    const stripeW = 8;
    for (let sy = y - w; sy < y + h + w; sy += stripeW * 2) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x + w, sy + w);
      ctx.lineTo(x + w, sy + w + stripeW);
      ctx.lineTo(x, sy + stripeW);
      ctx.fill();

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(x, sy + stripeW);
      ctx.lineTo(x + w, sy + w + stripeW);
      ctx.lineTo(x + w, sy + w + stripeW * 2);
      ctx.lineTo(x, sy + stripeW * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // 7. 3D PROJECTING AWNINGS & ROOFTOP PROPS
  // =========================================================================

  public static create3DAwning(data: BuildingData): THREE.Group {
    const awningGroup = new THREE.Group();
    awningGroup.name = 'building_awning_3d';

    const awningW = data.width * 0.88;
    const awningExt = 1.1;
    const awningDrop = 0.45;

    const awningGeo = new THREE.PlaneGeometry(awningW, Math.hypot(awningExt, awningDrop));

    const awningCanvas = document.createElement('canvas');
    awningCanvas.width = 256;
    awningCanvas.height = 64;
    const actx = awningCanvas.getContext('2d');

    if (actx) {
      if (data.awningStyle === 'striped') {
        const stripeW = 256 / 10;
        for (let i = 0; i < 10; i++) {
          actx.fillStyle = i % 2 === 0 ? data.awningColor1 : data.awningColor2;
          actx.fillRect(i * stripeW, 0, stripeW, 64);
        }
      } else {
        actx.fillStyle = data.awningColor1;
        actx.fillRect(0, 0, 256, 64);
      }
      actx.fillStyle = 'rgba(255,255,255,0.25)';
      actx.fillRect(0, 0, 256, 6);
      actx.fillStyle = 'rgba(0,0,0,0.3)';
      actx.fillRect(0, 58, 256, 6);
    }

    const awningTex = new THREE.CanvasTexture(awningCanvas);
    awningTex.colorSpace = THREE.SRGBColorSpace;

    const awningMat = new THREE.MeshLambertMaterial({
      map: awningTex,
      side: THREE.DoubleSide,
    });

    const awningMesh = new THREE.Mesh(awningGeo, awningMat);
    const awningY = data.height * 0.38 + 0.4;
    const angle = Math.atan2(awningDrop, awningExt);
    awningMesh.rotation.x = Math.PI / 2 + angle;
    awningMesh.position.set(0, awningY, -awningExt / 2);
    awningMesh.castShadow = true;
    awningMesh.receiveShadow = true;
    awningGroup.add(awningMesh);

    // Front Valance Flap
    const valanceGeo = new THREE.PlaneGeometry(awningW, 0.25);
    const valanceMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(data.awningColor1),
      side: THREE.DoubleSide,
    });
    const valanceMesh = new THREE.Mesh(valanceGeo, valanceMat);
    valanceMesh.position.set(0, awningY - awningDrop - 0.12, -awningExt);
    valanceMesh.castShadow = true;
    awningGroup.add(valanceMesh);

    // Metal struts
    const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2);
    const strutMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    [-awningW * 0.45, 0, awningW * 0.45].forEach((sx) => {
      const strut = new THREE.Mesh(strutGeo, strutMat);
      strut.rotation.x = Math.PI / 4;
      strut.position.set(sx, awningY - 0.4, -awningExt * 0.5);
      awningGroup.add(strut);
    });

    return awningGroup;
  }

  public static createRooftopProps(data: BuildingData, roofY: number): THREE.Group {
    const propsGroup = new THREE.Group();

    if (data.hasWaterTank) {
      // Iconic Blue Water Tank
      const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16);
      const tankMat = new THREE.MeshLambertMaterial({ color: 0x0055aa });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(-data.width * 0.28, roofY + 0.7, 0.5);
      tank.castShadow = true;
      propsGroup.add(tank);

      const lidGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.15, 16);
      const lidMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(-data.width * 0.28, roofY + 1.45, 0.5);
      propsGroup.add(lid);
    }

    if (data.hasSatelliteDish) {
      const dishGroup = new THREE.Group();
      const dishGeo = new THREE.SphereGeometry(0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const dishMat = new THREE.MeshLambertMaterial({ color: 0xdde2eb, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = -Math.PI / 3;
      dish.rotation.y = Math.PI / 4;
      dishGroup.add(dish);

      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, -0.4, 0);
      dishGroup.add(pole);

      dishGroup.position.set(data.width * 0.3, roofY + 0.8, -0.5);
      dishGroup.castShadow = true;
      propsGroup.add(dishGroup);
    }

    return propsGroup;
  }

  // =========================================================================
  // 8. 3D SPECIALIZED STREET ASSETS (LIGHTS, BINS, SIGNS, PROPS)
  // =========================================================================

  private static create3DBarberPole(): THREE.Group {
    const group = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12);
    const cylMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const pole = new THREE.Mesh(cylGeo, cylMat);
    group.add(pole);

    const capGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const capMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const topCap = new THREE.Mesh(capGeo, capMat);
    topCap.position.y = 0.5;
    group.add(topCap);

    const botCap = new THREE.Mesh(capGeo, capMat);
    botCap.position.y = -0.5;
    group.add(botCap);

    return group;
  }

  private static create3DPharmacyCross(): THREE.Group {
    const group = new THREE.Group();
    const vGeo = new THREE.BoxGeometry(0.2, 0.8, 0.1);
    const hGeo = new THREE.BoxGeometry(0.8, 0.2, 0.1);
    const crossMat = new THREE.MeshLambertMaterial({ color: 0x10b981 });

    const vMesh = new THREE.Mesh(vGeo, crossMat);
    const hMesh = new THREE.Mesh(hGeo, crossMat);
    group.add(vMesh);
    group.add(hMesh);
    return group;
  }

  public static createStreetLamp(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();

    // Steel pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.2, 10);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.6;
    pole.castShadow = true;
    group.add(pole);

    // Curved arm extending towards street (-Z)
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.x = Math.PI / 3;
    arm.position.set(0, 5.0, -0.6);
    group.add(arm);

    // Lamp head
    const lampGeo = new THREE.ConeGeometry(0.3, 0.25, 8);
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const lampHead = new THREE.Mesh(lampGeo, lampMat);
    lampHead.rotation.x = Math.PI;
    lampHead.position.set(0, 5.3, -1.2);
    group.add(lampHead);

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 5.15, -1.2);
    group.add(bulb);

    group.position.set(x, y, z);
    return group;
  }

  public static createTrashBin(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();

    const binGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.75, 12);
    const binMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    const bin = new THREE.Mesh(binGeo, binMat);
    bin.position.y = 0.38;
    bin.castShadow = true;
    group.add(bin);

    const lidGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 12);
    const lidMat = new THREE.MeshLambertMaterial({ color: 0x166534 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.8;
    group.add(lid);

    group.position.set(x, y, z);
    return group;
  }

  public static createAngolaDirectionSign(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();

    // Post
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.6;
    pole.castShadow = true;
    group.add(pole);

    // Signboard canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Blue sign background (typical highway/avenue sign in Angola)
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 248, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⬆ LUANDA CENTRO', 20, 36);
      ctx.fillText('➡ VIANA • KILAMBA', 20, 68);
      ctx.fillText('⬅ BENFICA • TALATONA', 20, 100);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const boardGeo = new THREE.PlaneGeometry(1.6, 0.8);
    const boardMat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 2.5, 0);
    board.castShadow = true;
    group.add(board);

    group.position.set(x, y, z);
    return group;
  }

  public static createMulticaixaTotem(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();

    // ATM Kiosk Pillar
    const baseGeo = new THREE.BoxGeometry(1.0, 2.2, 0.8);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.1;
    base.castShadow = true;
    group.add(base);

    // Multicaixa red header
    const topGeo = new THREE.BoxGeometry(1.04, 0.35, 0.84);
    const topMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 2.25;
    group.add(top);

    // Screen
    const screenGeo = new THREE.PlaneGeometry(0.6, 0.45);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.4, -0.41);
    group.add(screen);

    group.position.set(x, y, z);
    return group;
  }

  public static createTireStack(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    for (let i = 0; i < 4; i++) {
      const tireGeo = new THREE.TorusGeometry(0.35, 0.14, 8, 16);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.y = 0.15 + i * 0.28;
      tire.castShadow = true;
      group.add(tire);
    }

    group.position.set(x, y, z);
    return group;
  }

  public static createStreetFruitStall(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();

    // Wooden table / crate
    const tableGeo = new THREE.BoxGeometry(1.6, 0.65, 0.8);
    const tableMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.32;
    table.castShadow = true;
    group.add(table);

    // Tropical Fruit piles
    const fruitColors = [0xfacc15, 0xea580c, 0x16a34a];
    fruitColors.forEach((color, i) => {
      const fruitGeo = new THREE.SphereGeometry(0.14, 6, 6);
      const fruitMat = new THREE.MeshLambertMaterial({ color });
      const fruit = new THREE.Mesh(fruitGeo, fruitMat);
      fruit.position.set(-0.45 + i * 0.45, 0.75, 0);
      group.add(fruit);
    });

    // Striped Sun Umbrella (Sombrinha de Zungueira)
    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0.7, 1.2, 0);
    group.add(pole);

    const umbrellaGeo = new THREE.ConeGeometry(1.1, 0.45, 10);
    const umbrellaMat = new THREE.MeshLambertMaterial({
      color: 0xdc2626,
      side: THREE.DoubleSide,
    });
    const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
    umbrella.position.set(0.7, 2.3, 0);
    umbrella.castShadow = true;
    group.add(umbrella);

    group.position.set(x, y, z);
    return group;
  }

  // =========================================================================
  // 8. 3D SPECIALIZED FACADE & STREET PROPS
  // =========================================================================

  public static createConnectingApron(width: number, depth: number): THREE.Mesh {
    const apronGeo = new THREE.BoxGeometry(width + 0.15, 0.12, 1.4);
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xc8d1dc });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 0.06, -depth / 2 - 0.7);
    apron.receiveShadow = true;
    return apron;
  }

  public static createEntranceSteps(doorW: number, height: number): THREE.Group {
    const group = new THREE.Group();
    const stepMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

    // Step 1 (bottom)
    const s1Geo = new THREE.BoxGeometry(doorW, 0.12, 0.44);
    const s1 = new THREE.Mesh(s1Geo, stepMat);
    s1.position.set(0, 0.06, -0.16);
    s1.castShadow = true;
    s1.receiveShadow = true;
    group.add(s1);

    // Step 2 (top)
    const s2Geo = new THREE.BoxGeometry(doorW - 0.1, 0.12, 0.22);
    const s2 = new THREE.Mesh(s2Geo, stepMat);
    s2.position.set(0, 0.18, -0.05);
    s2.castShadow = true;
    s2.receiveShadow = true;
    group.add(s2);

    return group;
  }

  public static createEntranceRamp(doorW: number, height: number): THREE.Group {
    const group = new THREE.Group();

    // Center sloped ramp slab
    const rampGeo = new THREE.BoxGeometry(doorW, 0.18, 0.46);
    const rampMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.rotation.x = -Math.PI / 18;
    ramp.position.set(0, 0.08, -0.12);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    group.add(ramp);

    // Safety yellow curbs on sides
    const curbGeo = new THREE.BoxGeometry(0.08, 0.22, 0.46);
    const curbMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const curbL = new THREE.Mesh(curbGeo, curbMat);
    curbL.position.set(-doorW / 2 - 0.04, 0.11, -0.12);
    curbL.castShadow = true;
    group.add(curbL);

    const curbR = new THREE.Mesh(curbGeo, curbMat);
    curbR.position.set(doorW / 2 + 0.04, 0.11, -0.12);
    curbR.castShadow = true;
    group.add(curbR);

    return group;
  }

  public static createVerticalBladeSign(
    text: string,
    bgColor: string,
    textColor: string
  ): THREE.Group {
    const group = new THREE.Group();

    // Metal bracket mount rods
    const bracketGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
    const bracketMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });

    const rodTop = new THREE.Mesh(bracketGeo, bracketMat);
    rodTop.rotation.x = Math.PI / 2;
    rodTop.position.set(0, 0.4, 0.2);
    group.add(rodTop);

    const rodBot = new THREE.Mesh(bracketGeo, bracketMat);
    rodBot.rotation.x = Math.PI / 2;
    rodBot.position.set(0, -0.4, 0.2);
    group.add(rodBot);

    // Canvas texture for the blade sign (double sided text)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 128, 256);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 120, 248);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';

      // Draw vertical text stack
      const chars = text.split('');
      const charStep = Math.min(34, 220 / Math.max(1, chars.length));
      const startY = 128 - ((chars.length - 1) * charStep) / 2 + 8;
      chars.forEach((ch, idx) => {
        ctx.fillText(ch, 64, startY + idx * charStep);
      });
    }

    const signTex = new THREE.CanvasTexture(canvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshLambertMaterial({ map: signTex });

    const signGeo = new THREE.BoxGeometry(0.08, 1.15, 0.65);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 0, 0);
    signMesh.castShadow = true;
    group.add(signMesh);

    return group;
  }

  public static createFacadeWallLamp(): THREE.Group {
    const group = new THREE.Group();

    // Horizontal bracket rod
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6);
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x161c28 });
    const rod = new THREE.Mesh(rodGeo, metalMat);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(0, 0, -0.16);
    group.add(rod);

    // Downward sconce shade
    const shadeGeo = new THREE.ConeGeometry(0.16, 0.12, 8);
    const shade = new THREE.Mesh(shadeGeo, metalMat);
    shade.position.set(0, -0.05, -0.32);
    group.add(shade);

    // Glowing warm bulb
    const bulbGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffde7 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, -0.1, -0.32);
    group.add(bulb);

    // Soft warm illumination
    const light = new THREE.PointLight(0xfef08a, 0.65, 3.5);
    light.position.set(0, -0.15, -0.32);
    group.add(light);

    return group;
  }

  public static createFrontProp(
    propType: FrontPropType,
    bWidth: number,
    bDepth: number,
    seed: number
  ): THREE.Group | null {
    if (propType === 'none') return null;

    const group = new THREE.Group();
    const sideX = (seed % 2 === 0 ? 1 : -1) * (bWidth * 0.36);
    const zOffset = -bDepth / 2 - 0.42;

    if (propType === 'crates_pallet') {
      // Wood Pallet
      const palletGeo = new THREE.BoxGeometry(0.85, 0.08, 0.85);
      const palletMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const pallet = new THREE.Mesh(palletGeo, palletMat);
      pallet.position.y = 0.04;
      pallet.castShadow = true;
      group.add(pallet);

      // 3 Stacked cardboard cargo boxes
      const boxMat1 = new THREE.MeshLambertMaterial({ color: 0xb45309 });
      const boxMat2 = new THREE.MeshLambertMaterial({ color: 0xd97706 });
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), boxMat1);
      b1.position.set(-0.16, 0.25, -0.16);
      b1.castShadow = true;
      group.add(b1);

      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.36), boxMat2);
      b2.position.set(0.18, 0.24, 0.15);
      b2.castShadow = true;
      group.add(b2);

      const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), boxMat1);
      b3.position.set(-0.06, 0.54, 0.02);
      b3.rotation.y = Math.PI / 12;
      b3.castShadow = true;
      group.add(b3);
    } else if (propType === 'oil_drum') {
      // 200L Metal industrial drum
      const drumColor = seed % 2 === 0 ? 0x1d4ed8 : 0xeab308;
      const drumGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.85, 12);
      const drumMat = new THREE.MeshLambertMaterial({ color: drumColor });
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.position.y = 0.425;
      drum.castShadow = true;
      group.add(drum);

      // Black top rim
      const rimGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.05, 12);
      const rimMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.y = 0.85;
      group.add(rim);
    } else if (propType === 'planter_pot') {
      // Terracotta / concrete ornamental planter pot
      const potGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.5, 12);
      const potMat = new THREE.MeshLambertMaterial({ color: seed % 2 === 0 ? 0x94a3b8 : 0x7c2d12 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.25;
      pot.castShadow = true;
      group.add(pot);

      // Lush tropical green foliage cluster
      const leafGeo1 = new THREE.DodecahedronGeometry(0.32, 1);
      const leafMat1 = new THREE.MeshLambertMaterial({ color: 0x15803d });
      const leaf1 = new THREE.Mesh(leafGeo1, leafMat1);
      leaf1.position.set(0, 0.6, 0);
      leaf1.castShadow = true;
      group.add(leaf1);

      const leafGeo2 = new THREE.DodecahedronGeometry(0.22, 1);
      const leafMat2 = new THREE.MeshLambertMaterial({ color: 0x22c55e });
      const leaf2 = new THREE.Mesh(leafGeo2, leafMat2);
      leaf2.position.set(0.12, 0.75, -0.08);
      leaf2.castShadow = true;
      group.add(leaf2);
    } else if (propType === 'bread_basket') {
      // Bakery wicker bread box & rolls
      const standGeo = new THREE.BoxGeometry(0.55, 0.55, 0.45);
      const standMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = 0.275;
      stand.castShadow = true;
      group.add(stand);

      // Golden bread loaves
      const breadMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
      for (let bi = -0.15; bi <= 0.15; bi += 0.15) {
        const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8), breadMat);
        loaf.rotation.z = Math.PI / 2;
        loaf.position.set(0, 0.6, bi);
        group.add(loaf);
      }
    } else if (propType === 'newspaper_rack') {
      // Metal magazine / newspapers stand
      const frameGeo = new THREE.BoxGeometry(0.5, 0.75, 0.25);
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.y = 0.375;
      frame.castShadow = true;
      group.add(frame);

      // Colorful magazines / pamphlets
      const magColors = [0xef4444, 0x3b82f6, 0x10b981];
      magColors.forEach((color, idx) => {
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.04), new THREE.MeshLambertMaterial({ color }));
        mag.position.set(0, 0.22 + idx * 0.22, 0.14);
        group.add(mag);
      });
    } else if (propType === 'tire_pile') {
      // Vulcanizer tire stack
      const tireMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const t1 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16), tireMat);
      t1.rotation.x = Math.PI / 2;
      t1.position.y = 0.1;
      t1.castShadow = true;
      group.add(t1);

      const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16), tireMat);
      t2.rotation.x = Math.PI / 2;
      t2.position.set(0.04, 0.28, 0.02);
      t2.castShadow = true;
      group.add(t2);
    } else if (propType === 'produce_box') {
      // Wooden produce crate with bananas & fruit
      const crateGeo = new THREE.BoxGeometry(0.65, 0.35, 0.45);
      const crateMat = new THREE.MeshLambertMaterial({ color: 0x854d0e });
      const crate = new THREE.Mesh(crateGeo, crateMat);
      crate.position.y = 0.18;
      crate.castShadow = true;
      group.add(crate);

      // Yellow bananas & citrus
      const fruitColors = [0xfacc15, 0xea580c, 0x84cc16];
      fruitColors.forEach((color, idx) => {
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshLambertMaterial({ color }));
        fruit.position.set(-0.16 + idx * 0.16, 0.4, 0);
        group.add(fruit);
      });
    } else if (propType === 'bench_seat') {
      // Low-poly public street bench
      const benchGeo = new THREE.BoxGeometry(1.1, 0.08, 0.35);
      const benchMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const seat = new THREE.Mesh(benchGeo, benchMat);
      seat.position.y = 0.35;
      seat.castShadow = true;
      group.add(seat);

      // Bench legs
      const legGeo = new THREE.BoxGeometry(0.06, 0.35, 0.3);
      const legMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const legL = new THREE.Mesh(legGeo, legMat);
      legL.position.set(-0.45, 0.175, 0);
      group.add(legL);

      const legR = new THREE.Mesh(legGeo, legMat);
      legR.position.set(0.45, 0.175, 0);
      group.add(legR);
    }

    group.position.set(sideX, 0, zOffset);
    return group;
  }

  // =========================================================================
  // 9. HELPER UTILITIES
  // =========================================================================

  private static adjustBrightness(col: string, factor: number): string {
    const c = new THREE.Color(col);
    c.r = Math.min(1, Math.max(0, c.r * factor));
    c.g = Math.min(1, Math.max(0, c.g * factor));
    c.b = Math.min(1, Math.max(0, c.b * factor));
    return `#${c.getHexString()}`;
  }
}
